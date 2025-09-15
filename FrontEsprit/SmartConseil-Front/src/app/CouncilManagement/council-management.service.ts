import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Council, CouncilSession, Student, SpecialCase, Statistics, Vote } from './council-management.component';

export interface AbsenceJustification {
  id?: string;
  teacherId: string;
  className: string;
  reason: string;
  details?: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CouncilToken {
  token: string;
  className: string;
  expiresAt: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CouncilManagementService {
  private baseURL = 'http://localhost:8090/council-management';
  
  // BehaviorSubjects for real-time updates
  private councilSessionsSubject = new BehaviorSubject<CouncilSession[]>([]);
  private councilsSubject = new BehaviorSubject<Council[]>([]);
  private statisticsSubject = new BehaviorSubject<Statistics | null>(null);

  public councilSessions$ = this.councilSessionsSubject.asObservable();
  public councils$ = this.councilsSubject.asObservable();
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // HTTP Headers
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  // Council Session Management
  getCouncilSessions(): Observable<CouncilSession[]> {
    return this.http.get<CouncilSession[]>(`${this.baseURL}/sessions`, this.getHttpOptions());
  }

  startCouncilSession(className: string): Observable<CouncilSession> {
    return this.http.post<CouncilSession>(`${this.baseURL}/sessions/start`, 
      { className }, this.getHttpOptions());
  }

  closeCouncilSession(sessionId: string): Observable<CouncilSession> {
    return this.http.put<CouncilSession>(`${this.baseURL}/sessions/${sessionId}/close`, 
      {}, this.getHttpOptions());
  }

  generateSessionToken(sessionId: string): Observable<CouncilToken> {
    return this.http.post<CouncilToken>(`${this.baseURL}/sessions/${sessionId}/token`, 
      {}, this.getHttpOptions());
  }

  validateToken(token: string): Observable<{ valid: boolean; sessionId?: string; className?: string }> {
    return this.http.post<{ valid: boolean; sessionId?: string; className?: string }>(
      `${this.baseURL}/sessions/validate-token`, { token }, this.getHttpOptions());
  }

  // Council Management
  getCouncils(): Observable<Council[]> {
    return this.http.get<Council[]>(`${this.baseURL}/councils`, this.getHttpOptions());
  }

  getCouncilByClassName(className: string): Observable<Council> {
    return this.http.get<Council>(`${this.baseURL}/councils/class/${className}`, this.getHttpOptions());
  }

  updateCouncilStatus(councilId: string, status: 'pending' | 'active' | 'closed'): Observable<Council> {
    return this.http.put<Council>(`${this.baseURL}/councils/${councilId}/status`, 
      { status }, this.getHttpOptions());
  }

  // Student Management
  getTopStudents(className: string, limit: number = 3): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseURL}/students/top/${className}?limit=${limit}`, 
      this.getHttpOptions());
  }

  getStudentsForVoting(className: string, teacherId: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseURL}/students/voting/${className}/${teacherId}`, 
      this.getHttpOptions());
  }

  // Special Cases Management
  getSpecialCases(className?: string): Observable<SpecialCase[]> {
    const url = className ? 
      `${this.baseURL}/special-cases?className=${className}` : 
      `${this.baseURL}/special-cases`;
    return this.http.get<SpecialCase[]>(url, this.getHttpOptions());
  }

  updateSpecialCaseStatus(caseId: string, status: 'processed' | 'unprocessed'): Observable<SpecialCase> {
    return this.http.put<SpecialCase>(`${this.baseURL}/special-cases/${caseId}/status`, 
      { status }, this.getHttpOptions());
  }

  processSpecialCase(caseId: string, decision: 'approved' | 'rejected', notes?: string): Observable<SpecialCase> {
    return this.http.put<SpecialCase>(`${this.baseURL}/special-cases/${caseId}/process`, 
      { decision, notes }, this.getHttpOptions());
  }

  // Voting System
  submitVote(vote: Omit<Vote, 'timestamp'>): Observable<Vote> {
    return this.http.post<Vote>(`${this.baseURL}/votes`, 
      { ...vote, timestamp: new Date() }, this.getHttpOptions());
  }

  getVotesByTeacher(teacherId: string): Observable<Vote[]> {
    return this.http.get<Vote[]>(`${this.baseURL}/votes/teacher/${teacherId}`, this.getHttpOptions());
  }

  getVotesByStudent(studentId: string): Observable<Vote[]> {
    return this.http.get<Vote[]>(`${this.baseURL}/votes/student/${studentId}`, this.getHttpOptions());
  }

  hasTeacherVoted(teacherId: string, studentId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseURL}/votes/check/${teacherId}/${studentId}`, 
      this.getHttpOptions());
  }

  // Statistics
  getStatistics(className?: string): Observable<Statistics> {
    const url = className ? 
      `${this.baseURL}/statistics?className=${className}` : 
      `${this.baseURL}/statistics`;
    return this.http.get<Statistics>(url, this.getHttpOptions());
  }

  getClassStatistics(className: string): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.baseURL}/statistics/class/${className}`, 
      this.getHttpOptions());
  }

  // Absence Justification
  submitAbsenceJustification(justification: Omit<AbsenceJustification, 'id' | 'timestamp' | 'status'>): Observable<AbsenceJustification> {
    return this.http.post<AbsenceJustification>(`${this.baseURL}/absences`, 
      { ...justification, timestamp: new Date(), status: 'pending' }, this.getHttpOptions());
  }

  getAbsenceJustifications(teacherId?: string): Observable<AbsenceJustification[]> {
    const url = teacherId ? 
      `${this.baseURL}/absences?teacherId=${teacherId}` : 
      `${this.baseURL}/absences`;
    return this.http.get<AbsenceJustification[]>(url, this.getHttpOptions());
  }

  updateAbsenceStatus(absenceId: string, status: 'approved' | 'rejected'): Observable<AbsenceJustification> {
    return this.http.put<AbsenceJustification>(`${this.baseURL}/absences/${absenceId}/status`, 
      { status }, this.getHttpOptions());
  }

  // Council Rules and Formulas
  getCouncilRules(): Observable<{ redemptionRules: any; votingRules: any }> {
    return this.http.get<{ redemptionRules: any; votingRules: any }>(`${this.baseURL}/rules`, 
      this.getHttpOptions());
  }

  // Real-time Updates (WebSocket simulation with polling)
  startRealTimeUpdates(): void {
    // Poll for updates every 30 seconds
    setInterval(() => {
      this.getCouncilSessions().subscribe(sessions => {
        this.councilSessionsSubject.next(sessions);
      });
      
      this.getCouncils().subscribe(councils => {
        this.councilsSubject.next(councils);
      });
      
      this.getStatistics().subscribe(stats => {
        this.statisticsSubject.next(stats);
      });
    }, 30000);
  }

  stopRealTimeUpdates(): void {
    // Implementation would clear intervals
  }

  // Utility Methods
  canTeacherVoteForClass(teacherId: string, className: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseURL}/teachers/${teacherId}/can-vote/${className}`, 
      this.getHttpOptions());
  }

  getTeacherSubjects(teacherId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseURL}/teachers/${teacherId}/subjects`, 
      this.getHttpOptions());
  }

  isCouncilActive(className: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseURL}/councils/active/${className}`, 
      this.getHttpOptions());
  }

  // Export and Reporting
  exportCouncilReport(className: string, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseURL}/reports/council/${className}?format=${format}`, 
      { responseType: 'blob' });
  }

  exportStatisticsReport(format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseURL}/reports/statistics?format=${format}`, 
      { responseType: 'blob' });
  }

  // Local Storage Helpers (for offline functionality)
  saveToLocalStorage(key: string, data: any): void {
    localStorage.setItem(`council_${key}`, JSON.stringify(data));
  }

  getFromLocalStorage(key: string): any {
    const data = localStorage.getItem(`council_${key}`);
    return data ? JSON.parse(data) : null;
  }

  clearLocalStorage(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('council_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Error Handling
  handleError(error: any): void {
    console.error('Council Management Service Error:', error);
    // Here you could implement more sophisticated error handling
    // such as showing user-friendly messages, logging to external service, etc.
  }
}
