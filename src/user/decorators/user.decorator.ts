import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequest } from 'src/types/express-request.interface';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<ExpressRequest>();

  if (!req.user) {
    return null;
  }

  if (data) {
    return req.user[data];
  }

  return req.user;
});
