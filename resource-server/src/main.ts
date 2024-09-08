import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

const config = new DocumentBuilder()
  .setTitle('알레테이아 API: 자원서버')
  .setDescription('금을 구매, 판매하는 서비스, 알레테이아의 API 문서입니다.')
  .setVersion('1.0')
  .addTag('aletheia')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true, // 맨 처음 발생한 하나의 에러만 반환 (나머지 검증 skip)
      whitelist: true, // 없는 속성 제거
      transform: true,
    }),
  );
  // 로깅
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(9999);
}
bootstrap();
