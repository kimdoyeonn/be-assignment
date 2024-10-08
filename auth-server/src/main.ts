import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

const config = new DocumentBuilder()
  .setTitle('알레테이아 API')
  .setDescription('금을 구매, 판매하는 서비스, 알레테이아의 API 문서입니다.')
  .setVersion('1.0')
  .addTag('aletheia')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'users',
      protoPath: join(__dirname, 'users/users.proto'),
      url: 'localhost:50051',
      loader: {
        object: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true, // 맨 처음 발생한 하나의 에러만 반환 (나머지 검증 skip)
      whitelist: true, // 없는 속성 제거
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(8888);
}
bootstrap();
