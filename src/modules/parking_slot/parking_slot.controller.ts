import { Controller } from '@nestjs/common';
import { ParkingSlotService } from './parking_slot.service';

@Controller('parking-slot')
export class ParkingSlotController {
  constructor(private readonly parkingSlotService: ParkingSlotService) {}
}
