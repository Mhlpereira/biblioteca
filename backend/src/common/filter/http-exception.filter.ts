import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException 
            ? exception.getStatus() 
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException 
            ? exception.getResponse() 
            : "Internal Server Error";

        if (status === 500) {
            console.error("🔥 ERRO REAL DO SISTEMA:", exception);
            

            const errorMessage = exception instanceof Error ? exception.message : String(exception);
            const errorStack = exception instanceof Error ? exception.stack : '';
            
            this.logger.error(`Erro 500 na rota ${request.url}: ${errorMessage}`, errorStack);
        } else {
            this.logger.warn(`Erro de Cliente (${status}): ${JSON.stringify(message)}`);
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: "Erro interno do servidor. Verifique os logs.", // Não vaze detalhes técnicos pro front em erro 500
        });
    }
}