import { ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  const createMockContext = (method = 'GET', url = '/test'): ExecutionContext =>
    ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ method, url }),
      }),
    } as unknown as ExecutionContext);

  const createMockCallHandler = (value?: unknown, error?: Error) => ({
    handle: jest.fn().mockReturnValue(
      error ? throwError(() => error) : of(value ?? { data: 'ok' }),
    ),
  });

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through successful responses', (done) => {
      const ctx = createMockContext('GET', '/api/books');
      const next = createMockCallHandler({ id: 1 });

      const result$ = interceptor.intercept(ctx, next);

      result$.subscribe({
        next: (val) => {
          expect(val).toEqual({ id: 1 });
          done();
        },
        error: done.fail,
      });
    });

    it('should re-throw errors from the handler', (done) => {
      const ctx = createMockContext('POST', '/api/reservations');
      const error = new Error('Something went wrong');
      const next = createMockCallHandler(undefined, error);

      const result$ = interceptor.intercept(ctx, next);

      result$.subscribe({
        next: () => done.fail('Expected error to be thrown'),
        error: (err) => {
          expect(err).toBe(error);
          done();
        },
      });
    });

    it('should log the request method and url on intercept', () => {
      const logSpy = jest.spyOn((interceptor as any).logger, 'log').mockImplementation(() => {});
      const ctx = createMockContext('DELETE', '/api/books/1');
      const next = createMockCallHandler();

      interceptor.intercept(ctx, next).subscribe();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/books/1'),
      );
    });

    it('should log success with response time on completion', (done) => {
      const logSpy = jest.spyOn((interceptor as any).logger, 'log').mockImplementation(() => {});
      const ctx = createMockContext('GET', '/api/health');
      const next = createMockCallHandler('healthy');

      interceptor.intercept(ctx, next).subscribe({
        complete: () => {
          const successLog = logSpy.mock.calls.find((args) =>
            (args[0] as string).includes('Sucesso'),
          );
          expect(successLog).toBeDefined();
          done();
        },
      });
    });

    it('should log error with response time on failure', (done) => {
      const errorSpy = jest.spyOn((interceptor as any).logger, 'error').mockImplementation(() => {});
      const ctx = createMockContext('PUT', '/api/books/1');
      const error = new Error('DB error');
      const next = createMockCallHandler(undefined, error);

      interceptor.intercept(ctx, next).subscribe({
        error: (_err: unknown) => {
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Erro 500'),
            error.message,
          );
          done();
        },
      });
    });
  });
});
