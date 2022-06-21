import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ExpressRequest } from 'src/types/express-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<ExpressRequest>();

    if (req.user) {
      return true;
    }

    throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
  }
}
