import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { parse } from 'js2xmlparser';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class ContentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const content = req.header('Accept');

    return next.handle().pipe(
      map((data) => {
        if (content === 'application/json') {
          // Default
        } else if (content === 'application/xml') {
          res.header('Content-Type', 'application/xml');
          console.log(data);
          data = parse('data', data);
        } else {
          data = data;
          res.header('Content-Type', 'application/json');
        }
        return data;
      }),
    );
  }
}
