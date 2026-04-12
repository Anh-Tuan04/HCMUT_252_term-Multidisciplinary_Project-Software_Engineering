import { Controller } from '@nestjs/common';
import { ParkingLotService } from './parking_lot.service';

@Controller('parking-lot')
export class ParkingLotController {
  constructor(private readonly parkingLotService: ParkingLotService) {}
}
