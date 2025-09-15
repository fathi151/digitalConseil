import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-setup',
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.css'],
  standalone: false
})
export class AdminSetupComponent {
  message: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  createAdmin(): void {
    this.isLoading = true;
    this.message = '';

    this.http.post<any>('http://localhost:8088/auth/create-admin', {})
      .subscribe({
        next: (response) => {
          this.message = `Admin créé avec succès!\nEmail: ${response.email}\nMot de passe: ${response.password}`;
          this.isLoading = false;
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/utilisateur']);
          }, 3000);
        },
        error: (error) => {
          this.message = `Erreur: ${error.error?.error || 'Impossible de créer l\'admin'}`;
          this.isLoading = false;
        }
      });
  }

  createTestUsers(): void {
    this.isLoading = true;
    this.message = '';

    this.http.post<any>('http://localhost:8088/auth/create-test-users', {})
      .subscribe({
        next: (response) => {
          this.message = `Utilisateurs de test créés!\n${response.enseignant || ''}\n${response.chef || ''}`;
          this.isLoading = false;
        },
        error: (error) => {
          this.message = `Erreur: ${error.error?.error || 'Impossible de créer les utilisateurs de test'}`;
          this.isLoading = false;
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/utilisateur']);
  }
}