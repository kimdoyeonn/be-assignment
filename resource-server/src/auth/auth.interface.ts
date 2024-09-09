import { Observable } from 'rxjs';

export interface UsersService {
  validateToken(data: { token: string }): Observable<any>;
}
