import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError, tap } from 'rxjs';
import { TokenService } from './token.service';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private tokenService: TokenService,
  ) {}
  // Mock implementations (keep these until API is ready)
  login(email: string, password: string): Observable<AuthResponse> {
    if (email === 'test@example.com' && password === 'BeHappy') {
      const response: AuthResponse = {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email: email,
        },
      };
      return of(response).pipe(
        delay(1000),
        tap((res) => {
          this.tokenService.setTokens({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          });
          this.tokenService.setUser(res.user);
        })
      );
    }
    return throwError(() => new Error('Invalid credentials')).pipe(delay(1000));
  }

  signup(email: string, password: string): Observable<AuthResponse> {
    const response: AuthResponse = {
      accessToken: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: email,
      },
    };
    return of(response).pipe(
      delay(1000),
      tap((res) => {
        this.tokenService.setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        });
        this.tokenService.setUser(res.user);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    // Mock refresh token implementation
    return of({
      accessToken: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    }).pipe(
      delay(1000),
      tap((response) => {
        this.tokenService.setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      })
    );
  }

  logout(): Observable<void> {
    return of(void 0).pipe(
      delay(500),
      tap(() => {
        this.tokenService.clear();
        this.refreshToken()
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.tokenService.isAuthenticated();
  }

  getAuthToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  getCurrentUser(): any {
    return this.tokenService.getUser();
  }
}
