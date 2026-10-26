import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const bodyMessage = (body as { message?: unknown }).message;
        if (typeof bodyMessage === 'string' || Array.isArray(bodyMessage)) {
          message = bodyMessage as string | string[];
        }
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error:
        status >= 500
          ? 'Internal Server Error'
          : exception instanceof HttpException
            ? exception.name
            : 'Error',
      path: request.url,
    });
  }
}
