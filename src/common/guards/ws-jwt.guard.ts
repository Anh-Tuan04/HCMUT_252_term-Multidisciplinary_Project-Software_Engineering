import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth?.token?.split(' ')[1];
    if (!token) return false; // Không có token -> Từ chối

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client['user'] = payload; // Lưu thông tin người dùng vào socket
      return true;
    } catch {
      return false;
    }
  }
}