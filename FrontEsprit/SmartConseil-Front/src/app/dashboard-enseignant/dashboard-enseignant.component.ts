import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-enseignant',
  templateUrl: './dashboard-enseignant.component.html',
  styleUrls: ['./dashboard-enseignant.component.css'],
  standalone: false
})
export class DashboardEnseignantComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Redirect if user is not enseignant
      if (user && user.role !== 'enseignant') {
        this.authService.redirectToDashboard();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToRectification(): void {
    this.router.navigate(['/rectification']);
  }

  navigateToGradeCorrection(): void {
    this.router.navigate(['/grade-correction']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
