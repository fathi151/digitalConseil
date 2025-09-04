import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
  poste?: string;
  secteur?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseURL = "http://localhost:8088/auth";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggingOut = false;


  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in on service initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const id = sessionStorage.getItem('id');
    const role = sessionStorage.getItem('role');
    const email = sessionStorage.getItem('email');

    if (token && username && id && role && email) {
      const user: User = {
        id: parseInt(id),
        username,
        email,
        role,
        token
      };
      this.currentUserSubject.next(user);
    }
  }

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseURL}/login`, loginRequest)
      .pipe(
        tap(user => {
          if (user && user.token) {
            // Store user data in session storage
            sessionStorage.setItem('token', user.token);
            sessionStorage.setItem('username', user.username);
            sessionStorage.setItem('id', user.id.toString());
            sessionStorage.setItem('role', user.role);
            sessionStorage.setItem('email', user.email);
            
            // Update current user subject
            this.currentUserSubject.next(user);
          }
        })
      );
  }


logout(): void {
  if (this.isLoggingOut) return; // ← 🔁 évite double appel
  this.isLoggingOut = true;

  try {
    // Clear session storage
    sessionStorage.clear();
    this.currentUserSubject.next(null);

    // Naviguer vers login
    this.router.navigate(['/utilisateur'], { replaceUrl: true }).finally(() => {
      this.isLoggingOut = false;
    });

  } catch (error) {
    console.error('Logout error:', error);
    this.isLoggingOut = false;
  }
}


  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Method to redirect user to appropriate dashboard based on role
  redirectToDashboard(): void {
    const role = this.getUserRole();
    if (role === 'enseignant') {
      this.router.navigate(['/dashboard-enseignant']);
    } else if (role === 'chef departement') {
      this.router.navigate(['/dashboard-chef']);
    } else if (role === 'rapporteur') {
      this.router.navigate(['/dashboard-rapporteur']);
    } else if (role === 'admin') {
      this.router.navigate(['/dashboard-admin']);
    } else if (role === 'president') {
      this.router.navigate(['/president']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseURL}/register`, user, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseURL}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseURL}/reset-password?token=${token}`, 
      { password: newPassword }, { responseType: 'text' });
  }
}
