import { Observable } from 'rxjs';

export interface UsersService {
  validateToken(data: { accessToken: string }): Observable<any>;
}
