import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-rapporteur',
  templateUrl: './dashboard-rapporteur.component.html',
  styleUrls: ['./dashboard-rapporteur.component.css'],
  standalone: false
})
export class DashboardRapporteurComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Redirect if user is not rapporteur
      if (user && user.role !== 'rapporteur') {
        this.authService.redirectToDashboard();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToReportManagement(): void {
    this.router.navigate(['/report-management']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
