import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface RapportRequest {
  titre: string;
  contenu: string;
  option: string;
  classe: string;
  secteur: string;
  anneeAcademique: string;
  semestre: string;
}

export interface RapportUpdate {
  titre: string;
  contenu: string;
  option: string;
  classe: string;
  secteur: string;
  anneeAcademique: string;
  semestre: string;
}

export interface RapportResponse {
  id: number;
  titre: string;
  contenu: string;
  option: string;
  classe: string;
  rapporteurUsername: string;
  statut: 'BROUILLON' | 'VALIDE';
  dateCreation: string;
  dateModification?: string;
  dateValidation?: string;
  secteur: string;
  anneeAcademique: string;
  semestre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private baseUrl = 'http://localhost:8087/api/rapport';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Create a new report
  createRapport(rapport: RapportRequest): Observable<RapportResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<RapportResponse>(this.baseUrl, rapport, { headers });
  }

  // Update an existing report
  updateRapport(id: number, rapport: RapportUpdate): Observable<RapportResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<RapportResponse>(`${this.baseUrl}/${id}`, rapport, { headers });
  }

  // Validate a report (change status from BROUILLON to VALIDE)
  validateRapport(id: number): Observable<RapportResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<RapportResponse>(`${this.baseUrl}/${id}/validate`, {}, { headers });
  }

  // Get all reports for the current rapporteur
  getMyReports(): Observable<RapportResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RapportResponse[]>(`${this.baseUrl}/my-reports`, { headers });
  }

  // Get draft reports for the current rapporteur
  getMyDrafts(): Observable<RapportResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RapportResponse[]>(`${this.baseUrl}/my-drafts`, { headers });
  }

  // Get validated reports for the current rapporteur
  getMyValidatedReports(): Observable<RapportResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RapportResponse[]>(`${this.baseUrl}/my-validated`, { headers });
  }

  // Get a specific report by ID
  getRapportById(id: number): Observable<RapportResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RapportResponse>(`${this.baseUrl}/${id}`, { headers });
  }

  // Delete a report (only drafts can be deleted)
  deleteRapport(id: number): Observable<{message: string}> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<{message: string}>(`${this.baseUrl}/${id}`, { headers });
  }

  // Get all reports (admin function)
  getAllReports(): Observable<RapportResponse[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RapportResponse[]>(`${this.baseUrl}/all`, { headers });
  }
}
