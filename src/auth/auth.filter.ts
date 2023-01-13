import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        // console.log(exception)

        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: "Internal Server Error",
            error: "",
        };

        if (exception instanceof HttpException) {
            const response = exception.getResponse()
            httpStatus = exception.getStatus();
            // Check if response is a type of string or an object
            if (typeof response === 'string'){
                responseBody.message = response;
            } else {
                responseBody = { ...responseBody, ...response }
            }
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
