import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  public apiUrl :any;

  constructor(
    private http: HttpClient,
    private global: GlobalService
  ) {
    this.apiUrl = `${this.global.apiUrl}/auth`;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/super`, credentials, { withCredentials: true });
  }

  registro(user: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, user, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}
