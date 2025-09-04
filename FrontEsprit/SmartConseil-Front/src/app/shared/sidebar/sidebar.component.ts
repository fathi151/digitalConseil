import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { NavigationService, NavigationItem } from '../../services/navigation.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: false
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  navigationItems: NavigationItem[] = [];
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.navigationItems = this.navigationService.getRoleSpecificItems(user.role);
      }
    });

    // Track current route for active menu highlighting
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });

    // Check if logo exists
    this.checkLogoExists();
  }

  private checkLogoExists(): void {
    const img = new Image();
    img.onload = () => {
      console.log('ESPRIT logo loaded successfully');
    };
    img.onerror = () => {
      console.warn('ESPRIT logo failed to load from assets/images/logos/esprit.png');
    };
    img.src = 'assets/images/logos/esprit.png';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  executeAction(action?: () => void): void {
    if (action) {
      action();
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  logout(): void {
    console.log('Sidebar logout clicked');
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'enseignant':
        return 'Enseignant';
      case 'chef departement':
        return 'Chef de Département';
      case 'rapporteur':
        return 'Rapporteur';
      case 'admin':
        return 'Administrateur';
      default:
        return role;
    }
  }

  toggleSidebar(): void {
    const sidebar = document.querySelector('.left-sidebar');
    const body = document.body;
    
    if (sidebar && body) {
      sidebar.classList.toggle('collapsed');
      body.classList.toggle('sidebar-collapsed');
    }
  }
}
