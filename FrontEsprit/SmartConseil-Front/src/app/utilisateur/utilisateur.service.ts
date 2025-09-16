import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from './Utilisateur';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  // utilisateur.service.ts
private baseURL = "http://user-service:8080/auth";


  constructor(private httpClient:HttpClient, private authService: AuthService) { }

  login(user: { email: string; password: string }): Observable<any> {
    return this.authService.login(user);
  }
  

  register(user: Utilisateur): Observable<any> {
    return this.httpClient.post(`${this.baseURL}/register`, user, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


  forgotPassword(email: string) {
    return this.httpClient.post(`${this.baseURL}/forgot-password`, { email }, { responseType: 'text' });
  }
  resetPassword(token: string, newPassword: string) {
    return this.httpClient.post(`${this.baseURL}/reset-password?token=${token}`, { password: newPassword }, { responseType: 'text' });
  }
  
  checkEmailAvailability(email: string): Observable<any> {
    return this.httpClient.get<any>(`${this.baseURL}/check-email?email=${email}`);
  }

  // Profile management methods
  getUserProfile(email: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.httpClient.get<any>(`http://localhost:8088/api/users/profile?email=${email}`, { headers });
  }

  updateProfile(profileData: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.httpClient.put<any>(`http://localhost:8088/api/users/profile`, profileData, { headers });
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    console.log('Making password change request to:', `http://localhost:8088/api/users/change-password`);
    console.log('Headers:', headers);
    console.log('Request payload:', {
      currentPassword: passwordData.currentPassword ? '***' : 'empty',
      newPassword: passwordData.newPassword ? '***' : 'empty',
      confirmPassword: passwordData.confirmPassword ? '***' : 'empty'
    });

    return this.httpClient.put<any>(`http://localhost:8088/api/users/change-password`, passwordData, { headers });
  }

  testBackend(): Observable<any> {
    return this.httpClient.get<any>(`http://localhost:8088/api/users/test`);
  }

  // Profile picture methods
  updateProfilePicture(email: string, profilePicture: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const payload = { email, profilePicture };
    return this.httpClient.put<any>(`http://localhost:8088/api/users/profile-picture`, payload, { headers });
  }

}
