import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ApiResponse } from './api.service';
import { Observable, tap } from 'rxjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: any;
}

export interface AuthResponse {
  user: any;
  session: Session;
  profile: any;
  doctor: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.status === 'ok' && response.result) {
          // Extract tokens from session object
          const session = response.result.session;
          if (session) {
            // Clean and validate access token (must be JWT)
            const accessToken = this.cleanJwtToken(session.access_token);
            // Clean refresh token (may not be JWT, so just trim it)
            const refreshToken = this.cleanToken(session.refresh_token);

            if (accessToken) {
              localStorage.setItem('accessToken', accessToken);
            } else {
              console.error('Failed to store access token: invalid JWT format');
            }
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
            }
          }

          // Store user data (prefer result.user over session.user)
          const userData = response.result.user || response.result.session?.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      })
    );
  }

  private cleanToken(token: string | null | undefined): string | null {
    if (!token) return null;
    // Remove quotes if present, trim whitespace
    return token.trim().replace(/^["']|["']$/g, '');
  }

  private cleanJwtToken(token: string | null | undefined): string | null {
    if (!token) return null;
    // Remove quotes if present, trim whitespace
    let cleaned = token.trim().replace(/^["']|["']$/g, '');
    // Validate JWT format (should have 3 parts separated by dots)
    const parts = cleaned.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format:', cleaned.substring(0, 20) + '...');
      return null;
    }
    return cleaned;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    // Validate token format
    const cleaned = token.trim().replace(/^["']|["']$/g, '');
    const parts = cleaned.split('.');
    return parts.length === 3;
  }

  clearInvalidTokens(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const cleaned = token.trim().replace(/^["']|["']$/g, '');
      const parts = cleaned.split('.');
      if (parts.length !== 3) {
        console.warn('Clearing invalid token from storage');
        this.logout();
      }
    }
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

