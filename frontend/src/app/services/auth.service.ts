import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, map, catchError } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../models/auth.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse['user'] | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');
    if (token && userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  loadCurrentUser(): Observable<AuthResponse['user'] | null> {
    const existing = this.currentUserSubject.value;
    if (existing) {
      return of(existing);
    }
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    return this.http.get<ApiResponse<AuthResponse['user']>>(`${this.apiUrl}/me`).pipe(
      map(response => (response.success ? response.data ?? null : null)),
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
      catchError(() => of(null))
    );
  }
}