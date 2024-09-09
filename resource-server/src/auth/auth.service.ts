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
    },
  })
  client: ClientGrpc;

  onModuleInit() {
    this.usersService = this.client.getService<any>('UsersService');
  }

  validateToken(): Observable<string> {
    return this.usersService.validateToken({ token: '' });
  }
}
