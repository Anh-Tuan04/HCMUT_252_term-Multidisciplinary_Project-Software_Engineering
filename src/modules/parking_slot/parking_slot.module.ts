import { Module } from '@nestjs/common';
import { ParkingSlotService } from './parking_slot.service';
import { ParkingSlotController } from './parking_slot.controller';
import { VehicleLogModule } from '../vehicle_log/vehicle_log.module';

@Module({
  imports: [VehicleLogModule],
  controllers: [ParkingSlotController],
  providers: [ParkingSlotService]
})
export class ParkingSlotModule {}
