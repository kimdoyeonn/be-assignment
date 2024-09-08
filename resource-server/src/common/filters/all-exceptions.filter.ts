import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { status, err } =
      exception instanceof HttpException
        ? {
            status: exception.getStatus(),
            err: exception.getResponse(),
          }
        : {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            err: {
              message: 'Internal Server Error',
              name: 'Internal Server Error',
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            },
          };

    // 서버 로깅
    this.logger.error('Unhandled exception:', exception);
    console.log(exception);

    // 에러 응답 처리
    response.status(status).json(err);
  }
}
