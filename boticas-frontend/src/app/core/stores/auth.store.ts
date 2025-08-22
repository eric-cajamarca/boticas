// src/app/core/stores/auth.store.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  // Señal que contendrá al usuario logueado (o null)
  readonly user = signal<{ email: string } | null>(null);


  apiUrl: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.apiUrl = this.authService.apiUrl;
  }

  init() {
    // this.http.get<{ email: string }>('http://api:4000/api/auth/me', { withCredentials: true })
    this.http.get<{ email: string }>(this.apiUrl + '/me', { withCredentials: true })
    .subscribe({
      next: res => this.user.set({ email: res.email }),
      error: () => this.user.set(null)
    });

  }

    logout() {
      // Limpia la señal de usuario
      this.user.set(null);
    }
}

