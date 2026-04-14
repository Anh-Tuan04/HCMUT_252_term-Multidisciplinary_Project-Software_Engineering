import { SlotHistory } from './../../../node_modules/.prisma/client/index.d';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminUpdateParkingLotDTO, ChangeSlotDeviceDTO, CreateParkingSlotDTO, SensorUpdateParkingLotDTO } from './dto';
import { BadRequestException, NotFoundException } from '../../common/exception';
import { ParkingSlot, UpdateParkingSlotDTO } from '../../interfaces';
import { SlotHistoryAction, SlotStatus } from '@prisma/client';
import { VehicleLogService } from '../vehicle_log/vehicle_log.service';

@Injectable()
export class ParkingSlotService {
    constructor(
        private prisma: PrismaService,
        private readonly vehicleLogService: VehicleLogService,
    ) {}

    private async updateStatus(id: number, lotId: number, name: string, oldStatus: SlotStatus, newStatus: SlotStatus): Promise<UpdateParkingSlotDTO> {
        if (oldStatus !== newStatus) {
            await this.prisma.parkingSlot.update({
                where: { id: +id },
                data: { status: newStatus },
            });
            await this.vehicleLogService.recordByStatusTransition(+id, oldStatus, newStatus);
            return {
                changed: true,
                id: +id,
                lot_id: lotId,
                name: name,
                message: 'Cập nhật trạng thái thành công',
                oldStatus,
                newStatus: newStatus
            };
        }
        return {
            changed: false,
            id: +id,
            lot_id: lotId,
            name: name,
            message: 'Trạng thái không thay đổi',
            oldStatus: oldStatus,
            newStatus: oldStatus
        };
    }

    // Admin update parking slot status
    async adminUpdateParkingSlotStatus(id: number, dto: AdminUpdateParkingLotDTO): Promise<UpdateParkingSlotDTO> {
        const slot = await this.prisma.parkingSlot.findUnique({ where: { id: +id } });
        if (!slot) {
            throw new NotFoundException('Không tìm thấy vị trí đỗ');
        }
        return await this.updateStatus(id, slot.lotId, slot.name, slot.status, dto.status);
    };

    // Sensor update parking slot status
    async sensorUpdateParkingSlotStatus(dto: SensorUpdateParkingLotDTO): Promise<UpdateParkingSlotDTO> {
        const slot = await this.prisma.parkingSlot.findUnique({
            where: {
                deviceMac_portNumber: {
                deviceMac: dto.mac,
                portNumber: dto.port,
                },
            },
        });
        if (!slot) {
            throw new NotFoundException('Không tìm thấy vị trí đỗ');
        }
        if (slot.status === SlotStatus.MAINTAIN) {
            return {
                changed: false,
                id: +slot.id,
                lot_id: slot.lotId,
                name: slot.name,
                message: "Ô đang bảo trì",
                oldStatus: slot.status,
                newStatus: slot.status
            };
        }
        const newStatus = dto.isOccupied ? SlotStatus.OCCUPIED : SlotStatus.AVAILABLE;
        return await this.updateStatus(slot.id, slot.lotId, slot.name, slot.status, newStatus);
    };

    // Get Slot by Id
    async getSlotById(id: number) : Promise<ParkingSlot> {
        const slot = await this.prisma.parkingSlot.findUnique({
            where: { id: +id }
        });
        if (!slot) {
            throw new NotFoundException('Không tìm thấy vị trí đỗ');
        }
        return slot;
    }

    // Create new parking slot
    async createParkingSlot(dto: CreateParkingSlotDTO): Promise<ParkingSlot> {
        const newSlot = await this.prisma.parkingSlot.create({
            data: {
                name: dto.name,
                lotId: dto.lotId,
                deviceMac: dto.deviceMac,
                portNumber: dto.portNumber,
                status: SlotStatus.AVAILABLE,
            }
        });
        return newSlot;
    }

    async changeDevice(slotId: number, dto: ChangeSlotDeviceDTO) {
        return this.prisma.$transaction(async (tx) => {

            // Lấy slot hiện tại
            const slot = await tx.parkingSlot.findUnique({
                where: { id: slotId },
            });

            if (!slot) {
                throw new NotFoundException('Slot not found');
            }

            // Check unique conflict
            const conflict = await tx.parkingSlot.findFirst({
                where: {
                    deviceMac: dto.deviceMac,
                    portNumber: dto.portNumber,
                    NOT: {
                        id: slotId,
                    },
                },
            });

            if (conflict) {
                throw new BadRequestException(
                    'Device + port already assigned to another slot'
                );
            }

            // Update slot
            const updated = await tx.parkingSlot.update({
                where: { id: slotId },
                data: {
                    deviceMac: dto.deviceMac,
                    portNumber: dto.portNumber,
                },
            });

            // Write history
            await tx.slotHistory.create({
                data: {
                    slotId,
                    oldDevice: slot.deviceMac,
                    newDevice: dto.deviceMac,
                    oldPort: slot.portNumber,
                    newPort: dto.portNumber,
                    action: SlotHistoryAction.DEVICE_CHANGE,
                },
            });

            return updated;
        });
    }
}
