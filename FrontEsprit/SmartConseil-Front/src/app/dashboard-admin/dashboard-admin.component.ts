import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FilterService, FilterConfig } from '../services/filter.service';

interface UserStatistics {
  totalUsers: number;
  usersByRole: {
    [key: string]: number;
  };
  usersBySector: {
    [key: string]: number;
  };
}

interface ReportStatistics {
  totalReports: number;
  reportsByStatus: {
    [key: string]: number;
  };
  reportsBySector: {
    [key: string]: number;
  };
}

interface RectificationStatistics {
  totalRectifications: number;
  rectificationsByStatus: {
    [key: string]: number;
  };
  rectificationsByOption: {
    [key: string]: number;
  };
}

interface SystemHealth {
  database: string;
  userCount?: number;
  databaseError?: string;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  status: string;
  timestamp: string;
}

interface RecentActivities {
  recentUsers: any[];
  totalActivities: number;
  timestamp: string;
}

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  standalone: false
})
export class DashboardAdminComponent implements OnInit {
  currentUser: User | null = null;
  users: any[] = [];
  filteredUsers: any[] = [];
  statistics: UserStatistics | null = null;
  reportStatistics: ReportStatistics | null = null;
  rectificationStatistics: RectificationStatistics | null = null;
  systemHealth: SystemHealth | null = null;
  recentActivities: RecentActivities | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filter configuration
  userFilterConfig: FilterConfig = {
    searchFields: ['username', 'email', 'role', 'poste', 'secteur'],
    filterFields: [
      { key: 'role', label: 'Rôle', type: 'select' },
      { key: 'secteur', label: 'Secteur', type: 'select' },
      { key: 'poste', label: 'Poste', type: 'select' }
    ]
  };

  // User management modal
  isUserModalOpen = false;
  selectedUser: any = null;
  isEditMode = false;
  
  // New user form
  newUser: any = {
    username: '',
    email: '',
    password: '',
    role: '',
    poste: '',
    secteur: '',
    phoneNumber: ''
  };

  roles = [
    'enseignant',
    'chef departement',
    'rapporteur',
    'admin'
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
    private http: HttpClient,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Redirect if user is not admin
      if (user && user.role !== 'admin') {
        this.authService.redirectToDashboard();
      }
    });
    this.loadData();
  }

  loadData(): void {
    this.loadUsers();
    this.loadStatistics();
    this.loadReportStatistics();
    this.loadRectificationStatistics();
    this.loadSystemHealth();
    this.loadRecentActivities();
  }

  loadUsers(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any[]>('http://localhost:8088/api/users/all', { headers })
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = [...users];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.errorMessage = 'Erreur lors du chargement des utilisateurs';
          this.isLoading = false;
        }
      });
  }

  onUserFilterChange(filterData: { searchTerm: string, filters: any }): void {
    this.filteredUsers = this.filterService.filterData(
      this.users,
      filterData.searchTerm,
      filterData.filters,
      this.userFilterConfig
    );
  }

  loadStatistics(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<UserStatistics>('http://localhost:8088/api/users/admin/statistics', { headers })
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  loadReportStatistics(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<ReportStatistics>('http://localhost:8087/api/rapport/admin/statistics', { headers })
      .subscribe({
        next: (stats) => {
          this.reportStatistics = stats;
        },
        error: (error) => {
          console.error('Error loading report statistics:', error);
        }
      });
  }

  loadRectificationStatistics(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<RectificationStatistics>('http://localhost:8089/api/rectification/admin/statistics', { headers })
      .subscribe({
        next: (stats) => {
          this.rectificationStatistics = stats;
        },
        error: (error) => {
          console.error('Error loading rectification statistics:', error);
        }
      });
  }

  loadSystemHealth(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<SystemHealth>('http://localhost:8088/api/users/admin/system-health', { headers })
      .subscribe({
        next: (health) => {
          this.systemHealth = health;
        },
        error: (error) => {
          console.error('Error loading system health:', error);
        }
      });
  }

  loadRecentActivities(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<RecentActivities>('http://localhost:8088/api/users/admin/recent-activities', { headers })
      .subscribe({
        next: (activities) => {
          this.recentActivities = activities;
        },
        error: (error) => {
          console.error('Error loading recent activities:', error);
        }
      });
  }

  openUserModal(user?: any): void {
    this.isUserModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (user) {
      this.isEditMode = true;
      this.selectedUser = user;
      this.newUser = { ...user };
    } else {
      this.isEditMode = false;
      this.selectedUser = null;
      this.resetUserForm();
    }
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
    this.selectedUser = null;
    this.resetUserForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetUserForm(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: '',
      poste: '',
      secteur: '',
      phoneNumber: ''
    };
  }

  saveUser(): void {
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    // Basic validation
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password || !this.newUser.role) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide.';
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:8088/auth/register', this.newUser)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Utilisateur créé avec succès';
          this.loadUsers();
          this.closeUserModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = error.error?.message || error.error?.error || 'Erreur lors de la création';
          this.isLoading = false;
        }
      });
  }

  updateUser(): void {
    if (!this.selectedUser) return;
    
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.put(`http://localhost:8088/api/users/admin/update/${this.selectedUser.id}`, this.newUser, { headers })
      .subscribe({
        next: (response) => {
          this.successMessage = 'Utilisateur mis à jour avec succès';
          this.loadUsers();
          this.closeUserModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Erreur lors de la mise à jour';
          this.isLoading = false;
        }
      });
  }

  deleteUser(user: any): void {
    // Prevent admin from deleting themselves
    if (user.role === 'admin' && user.id === this.currentUser?.id) {
      this.errorMessage = 'Vous ne pouvez pas supprimer votre propre compte administrateur.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username}?\n\nCette action est irréversible.`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      const headers = this.authService.getAuthHeaders();
      this.http.delete(`http://localhost:8088/api/users/${user.id}`, { headers })
        .subscribe({
          next: () => {
            this.successMessage = 'Utilisateur supprimé avec succès';
            this.loadUsers();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
            this.isLoading = false;
          }
        });
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
