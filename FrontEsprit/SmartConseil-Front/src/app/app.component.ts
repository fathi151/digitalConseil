import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { WebSocketService } from './PlanificationConseil/web-socket-service.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'conseil';
  showStatusIndicator = true;
  userServiceStatus = false;
  rectificationServiceStatus = false;
  reportServiceStatus = false;
  private wsService?: WebSocketService;

  constructor(private http: HttpClient , private injector: Injector) {}

  ngOnInit(): void {
    // Add event listeners for browser close/refresh
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('unload', this.handleUnload.bind(this));
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    this.cleanup();
  }

  private handleUnload(event: Event): void {
    this.cleanup();
  }

  private cleanup(): void {
    try {
      if (!this.wsService) {
        this.wsService = this.injector.get(WebSocketService);
      }
      this.wsService.disconnect();
    } catch (error) {
      // Service might not be available, ignore
    }
  }
  checkBackendServices(): void {
    // Check User Service
    this.http.get('http://localhost:8088/actuator/health', { responseType: 'text' })
      .subscribe({
        next: () => this.userServiceStatus = true,
        error: () => this.userServiceStatus = false
      });

    // Check Rectification Service
    this.http.get('http://localhost:8089/actuator/health', { responseType: 'text' })
      .subscribe({
        next: () => this.rectificationServiceStatus = true,
        error: () => this.rectificationServiceStatus = false
      });

    // Check Report Service
    this.http.get('http://localhost:8087/actuator/health', { responseType: 'text' })
      .subscribe({
        next: () => this.reportServiceStatus = true,
        error: () => this.reportServiceStatus = false
      });
  }

  toggleStatusIndicator(): void {
    this.showStatusIndicator = !this.showStatusIndicator;

  }
}
