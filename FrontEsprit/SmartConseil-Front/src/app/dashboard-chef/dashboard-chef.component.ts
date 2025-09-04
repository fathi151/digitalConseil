import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-chef',
  templateUrl: './dashboard-chef.component.html',
  styleUrls: ['./dashboard-chef.component.css'],
  standalone: false
})
export class DashboardChefComponent implements OnInit {
  currentUser: User | null = null;
  users: any[] = [];
  isModalOpen = false;
  newUser: any = {
    username: '',
    email: '',
    password: '',
    role: '',
    poste: '',
    Secteur: ''
  };

  roles = [
    'enseignant',
    'president jury',
    'rapporteur',
    'chef departement'
  ];

  secteurs = [
  'informatique',
  'mathématique',
  'telecommunication',
  'ml',
  'gc'
];


  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Redirect if user is not chef departement
      if (user && user.role !== 'chef departement') {
        this.authService.redirectToDashboard();
      }
    });
    this.loadUsers();
  }

  loadUsers(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any[]>('http://localhost:8088/api/users/all', { headers })
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: '',
      poste: '',
      secteur: ''
    };
  }

  onRegister(): void {
    this.authService.register(this.newUser).subscribe({
      next: (response) => {
        console.log('User registered successfully', response);
        alert('Utilisateur créé avec succès');
        this.closeModal();
        this.loadUsers(); // Reload users list
      },
      error: (error) => {
        console.error('Registration failed:', error);
        alert('Erreur lors de la création de l\'utilisateur');
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const headers = this.authService.getAuthHeaders();
      this.http.delete(`http://localhost:8088/api/users/${userId}`, { headers })
        .subscribe({
          next: () => {
            alert('Utilisateur supprimé avec succès');
            this.loadUsers(); // Reload users list
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Erreur lors de la suppression');
          }
        });
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToRectificationManagement(): void {
    this.router.navigate(['/rectification-management']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  navigateToPlanification(): void {
    this.router.navigate(['/planification']);
  }
}
