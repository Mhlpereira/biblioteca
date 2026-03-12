import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.log(`[${method}] ${url} - Início da requisição`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`[${method}] ${url} - ✅ Sucesso em ${responseTime}ms`);
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.error(`[${method}] ${url} - ❌ Erro 500 em ${responseTime}ms:`, error.message);
        this.logger.error(`[ERROR-STACK]`, error.stack);
        return throwError(error);
      }),
    );
  }
}