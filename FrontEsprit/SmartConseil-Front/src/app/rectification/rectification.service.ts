import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface RectificationRequest {
  etudiantPrenom: string;
  etudiantNom: string;
  classe: string;
  option: string;
  ancienneNote: number;
  nouvelleNote: number;
  justification: string;
}

export interface RectificationResponse {
  id: number;
  etudiantPrenom: string;
  etudiantNom: string;
  classe: string;
  option: string;
  ancienneNote: number;
  nouvelleNote: number;
  justification: string;
  status: string;
  enseignantUsername: string;
  chefDepartementUsername: string;
  dateDemande: string;
  dateTraitement?: string;
  smsVerified: boolean;
  motifRefus?: string;
}

export interface SmsVerification {
  rectificationId: number;
  smsCode: string;
}

export interface StatusUpdate {
  status: string;
  motifRefus?: string;
}

// Keep the old interface for backward compatibility
export interface Rectification {
  id?: number;
  etudiantNom: string;
  classe: string;
  option: string;
  ancienneNote: number;
  nouvelleNote: number;
  justification: string;
  status?: string;
  dateDemande?: string;
}

@Injectable({ providedIn: 'root' })
export class RectificationService {
  private baseUrl = 'http://localhost:8089/api/rectification';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Create a new rectification request
  create(rectification: RectificationRequest): Observable<RectificationResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<RectificationResponse>(this.baseUrl, rectification, { headers });
  }

  // Verify SMS code
  verifySms(verification: SmsVerification): Observable<{verified: boolean, message: string}> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<{verified: boolean, message: string}>(`${this.baseUrl}/verify-sms`, verification, { headers });
  }

  // Get teacher's own rectifications
  getMyRequests(): Observable<RectificationResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RectificationResponse[]>(`${this.baseUrl}/my-requests`, { headers });
  }

  // Get teacher's rectification history
  getHistory(): Observable<RectificationResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RectificationResponse[]>(`${this.baseUrl}/history`, { headers });
  }

  // Get pending requests for department head
  getPendingRequests(): Observable<RectificationResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RectificationResponse[]>(`${this.baseUrl}/pending`, { headers });
  }

  // Get processed history for department head
  getProcessedHistory(): Observable<RectificationResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RectificationResponse[]>(`${this.baseUrl}/processed-history`, { headers });
  }

  // Update rectification status (for department head)
  updateStatus(id: number, statusUpdate: StatusUpdate): Observable<RectificationResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<RectificationResponse>(`${this.baseUrl}/${id}/status`, statusUpdate, { headers });
  }

  // Get all rectifications (admin)
  getAll(): Observable<RectificationResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RectificationResponse[]>(this.baseUrl, { headers });
  }

  // Backward compatibility method
  createOld(rectification: Rectification): Observable<Rectification> {
    const newRequest: RectificationRequest = {
      etudiantPrenom: '', // Will need to be split from etudiantNom
      etudiantNom: rectification.etudiantNom,
      classe: rectification.classe,
      option: rectification.option,
      ancienneNote: rectification.ancienneNote,
      nouvelleNote: rectification.nouvelleNote,
      justification: rectification.justification
    };

    return this.create(newRequest) as Observable<any>;
  }
}
