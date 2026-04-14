import { SlotStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AdminUpdateParkingLotDTO {
    @IsNotEmpty({ message: 'Role không được để trống' })
    @IsEnum(SlotStatus, { message: 'Status phải là AVAILABLE, OCCUPIED hoặc MAINTAIN' })
    status: SlotStatus;
}

export class SensorUpdateParkingLotDTO {
    @IsString()
    @IsNotEmpty({ message: 'Mac không được để trống' })
    mac: string;

    @IsNotEmpty({ message: 'Port không được để trống' })
    @IsNumber()
    port: number;

    @IsNotEmpty({ message: 'IsOccupied không được để trống' })
    isOccupied: boolean;
}

export class CreateParkingSlotDTO {
    @IsNotEmpty({ message: 'Name không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'LotId không được để trống' })
    @IsNumber()
    lotId: number;

    @IsString()
    @IsNotEmpty({ message: 'DeviceMac không được để trống' })
    deviceMac: string;

    @IsNumber()
    @IsNotEmpty({ message: 'PortNumber không được để trống' })
    portNumber: number;
}

export class ChangeSlotDeviceDTO {
    @IsString()
    @IsNotEmpty()
    deviceMac: string;

    @IsNumber()
    @IsNotEmpty()
    portNumber: number;
}
