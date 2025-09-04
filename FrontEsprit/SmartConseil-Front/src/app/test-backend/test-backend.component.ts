import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-test-backend',
  template: `
    <div class="container mt-4">
      <h2>Backend Connectivity Test</h2>
      
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">User Service (8088)</div>
            <div class="card-body">
              <button class="btn btn-primary" (click)="testUserService()">Test Connection</button>
              <div class="mt-2">
                <strong>Status:</strong> 
                <span [class]="userServiceStatus.includes('Success') ? 'text-success' : 'text-danger'">
                  {{ userServiceStatus }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Rectification Service (8089)</div>
            <div class="card-body">
              <button class="btn btn-primary" (click)="testRectificationService()">Test Connection</button>
              <div class="mt-2">
                <strong>Status:</strong> 
                <span [class]="rectificationServiceStatus.includes('Success') ? 'text-success' : 'text-danger'">
                  {{ rectificationServiceStatus }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Report Service (8087)</div>
            <div class="card-body">
              <button class="btn btn-primary" (click)="testReportService()">Test Connection</button>
              <div class="mt-2">
                <strong>Status:</strong> 
                <span [class]="reportServiceStatus.includes('Success') ? 'text-success' : 'text-danger'">
                  {{ reportServiceStatus }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">Authentication Test</div>
            <div class="card-body">
              <div class="mb-3">
                <strong>Current User:</strong> {{ currentUser ? currentUser.username : 'Not logged in' }}
              </div>
              <div class="mb-3">
                <strong>Role:</strong> {{ currentUser ? currentUser.role : 'N/A' }}
              </div>
              <div class="mb-3">
                <strong>Token:</strong> {{ currentUser ? 'Present' : 'Missing' }}
              </div>
              <button class="btn btn-info" (click)="testAuth()">Test Auth Headers</button>
              <div class="mt-2">
                <strong>Auth Status:</strong> 
                <span [class]="authStatus.includes('Success') ? 'text-success' : 'text-danger'">
                  {{ authStatus }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin-bottom: 1rem;
    }
    .text-success {
      color: #28a745 !important;
    }
    .text-danger {
      color: #dc3545 !important;
    }
  `],
  standalone: false
})
export class TestBackendComponent implements OnInit {
  userServiceStatus = 'Not tested';
  rectificationServiceStatus = 'Not tested';
  reportServiceStatus = 'Not tested';
  authStatus = 'Not tested';
  currentUser: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  testUserService(): void {
    this.userServiceStatus = 'Testing...';
    // Try a simple health check endpoint
    this.http.get('http://localhost:8088/actuator/health', { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.userServiceStatus = 'Success: Service is running';
        },
        error: (error) => {
          // If health endpoint doesn't exist, try a basic endpoint
          this.http.get('http://localhost:8088/auth/login', { responseType: 'text' })
            .subscribe({
              next: (_response) => {
                this.userServiceStatus = 'Success: Service is running (login endpoint accessible)';
              },
              error: (loginError) => {
                this.userServiceStatus = `Error: ${error.status || 'Connection failed'} - ${error.message}`;
                console.error('User service error:', error);
              }
            });
        }
      });
  }

  testRectificationService(): void {
    this.rectificationServiceStatus = 'Testing...';
    // Test with auth headers if user is logged in
    const headers = this.currentUser ? this.authService.getAuthHeaders() : undefined;

    this.http.get('http://localhost:8089/actuator/health', { responseType: 'text', headers })
      .subscribe({
        next: (_response) => {
          this.rectificationServiceStatus = 'Success: Service is running';
        },
        error: (error) => {
          // Try without auth headers
          this.http.get('http://localhost:8089/api/rectification', { responseType: 'text' })
            .subscribe({
              next: (_response) => {
                this.rectificationServiceStatus = 'Success: Service is running (may need authentication)';
              },
              error: (apiError) => {
                this.rectificationServiceStatus = `Error: ${error.status || 'Connection failed'} - ${error.message}`;
                console.error('Rectification service error:', error);
              }
            });
        }
      });
  }

  testReportService(): void {
    this.reportServiceStatus = 'Testing...';
    // Test with auth headers if user is logged in
    const headers = this.currentUser ? this.authService.getAuthHeaders() : undefined;

    this.http.get('http://localhost:8087/actuator/health', { responseType: 'text', headers })
      .subscribe({
        next: (_response) => {
          this.reportServiceStatus = 'Success: Service is running';
        },
        error: (error) => {
          // Try without auth headers
          this.http.get('http://localhost:8087/api/rapport', { responseType: 'text' })
            .subscribe({
              next: (_response) => {
                this.reportServiceStatus = 'Success: Service is running (may need authentication)';
              },
              error: (apiError) => {
                this.reportServiceStatus = `Error: ${error.status || 'Connection failed'} - ${error.message}`;
                console.error('Report service error:', error);
              }
            });
        }
      });
  }

  testAuth(): void {
    this.authStatus = 'Testing...';
    const headers = this.authService.getAuthHeaders();
    console.log('Auth headers:', headers);
    
    if (this.currentUser && this.currentUser.token) {
      this.authStatus = 'Success: Headers generated correctly';
    } else {
      this.authStatus = 'Error: No authentication token found';
    }
  }
}
