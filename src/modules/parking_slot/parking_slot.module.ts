import { Module } from '@nestjs/common';
import { ParkingSlotService } from './parking_slot.service';
import { ParkingSlotController } from './parking_slot.controller';
import { VehicleLogModule } from '../vehicle_log/vehicle_log.module';
import { ParkingSlotGateway } from './parking_slot.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@Module({
  imports: [VehicleLogModule, JwtModule.register({})],
  controllers: [ParkingSlotController],
  providers: [ParkingSlotService, ParkingSlotGateway, WsJwtGuard]
})
export class ParkingSlotModule {}
