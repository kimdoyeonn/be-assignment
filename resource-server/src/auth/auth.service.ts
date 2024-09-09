import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Observable } from 'rxjs';
import { UsersService } from './auth.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private usersService: UsersService;

  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'users',
      protoPath: join(__dirname, 'users.proto'),
      url: 'localhost:50051',
    },
  })
  client: ClientGrpc;
  onModuleInit() {
    this.usersService = this.client.getService<any>('UsersService');
  }

  validateToken(accessToken: string): Observable<{
    isValid: boolean;
    message?: string;
    payload: { sub: number; username: string };
  }> {
    const result = this.usersService.validateToken({ accessToken });
    return result;
  }
}
