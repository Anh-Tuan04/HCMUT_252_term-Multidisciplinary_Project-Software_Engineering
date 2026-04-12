import { Module } from '@nestjs/common';
import { ParkingSlotService } from './parking_slot.service';
import { ParkingSlotController } from './parking_slot.controller';

@Module({
  controllers: [ParkingSlotController],
  providers: [ParkingSlotService]
})
export class ParkingSlotModule {}
