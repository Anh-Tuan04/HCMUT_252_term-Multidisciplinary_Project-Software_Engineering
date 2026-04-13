import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../exception/app.exception';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorList: string[] = ['Internal server error'];

    if (exception instanceof AppException) {
      status = exception.statusCode;
      errorList = [exception.message];
    }
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: any = exception.getResponse();
      errorList = Array.isArray(response?.message)
        ? response.message
        : [response?.message || 'Error'];
    }

    return res.status(status).json({
      success: false,
      errors: errorList
    });
  }
}
