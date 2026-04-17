import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';
import { UseGuards } from '@nestjs/common';
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'parking'   // Tách riêng luồng bãi xe
})
@UseGuards(WsJwtGuard)
export class ParkingSlotGateway {
  @WebSocketServer()
  server: Server;
}
