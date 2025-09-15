import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  action?: () => void;
  roles: string[];
  children?: NavigationItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private navigationItems: NavigationItem[] = [
    {
      id: 'dashboard-chef',
      title: 'Tableau de Bord',
      icon: 'ti ti-layout-dashboard',
      route: '/dashboard-chef',
      roles: ['chef departement']
    },
    {
      id: 'dashboard-enseignant',
      title: 'Tableau de Bord',
      icon: 'ti ti-layout-dashboard',
      route: '/dashboard-enseignant',
      roles: ['enseignant']
    },
    {
      id: 'dashboard-rapporteur',
      title: 'Tableau de Bord',
      icon: 'ti ti-layout-dashboard',
      route: '/dashboard-rapporteur',
      roles: ['rapporteur']
    },
        {
      id: 'dashboard-rapporteur',
      title: 'Gerer les Conseils',
      icon: 'ti ti-layout-dashboard',
      route: '/rapporteurConseil',
      roles: ['rapporteur']
    },
    {
      id: 'dashboard-admin',
      title: 'Tableau de Bord',
      icon: 'ti ti-layout-dashboard',
      route: '/dashboard-admin',
      roles: ['admin']
    },
        {
      id: 'dashboard-admin',
      title: 'Gerer le Conseil',
      icon: 'ti ti-layout-dashboard',
      route: '/conseil',
      roles: ['admin']
    },
    {
      id: 'gestion-options',
      title: 'Gestion Options & Classes',
      icon: 'ti ti-settings',
      route: '/gestion-options',
      roles: ['admin', 'chef departement']
    },
    {
      id: 'grade-correction',
      title: 'Correction de Notes',
      icon: 'ti ti-edit-circle',
      route: '/grade-correction',
      roles: ['enseignant']
    },
        {
      id: 'grade-correction',
      title: 'Liste des Cosneils',
      icon: 'ti ti-edit-circle',
      route: '/enseignant-conseil',
      roles: ['enseignant']
    },
            {
      id: 'grade-correction',
      title: 'Liste des Conseils',
      icon: 'ti ti-edit-circle',
      route: '/president',
      roles: ['president']
    },
    {
      id: 'rectification-management',
      title: 'Gestion Rectifications',
      icon: 'ti ti-clipboard-check',
      route: '/rectification-management',
      roles: ['chef departement']
    },

    {
      id: 'profile',
      title: 'Mon Profil',
      icon: 'ti ti-user',
      route: '/profile',
      roles: ['enseignant', 'chef departement', 'rapporteur', 'admin','president']
    }
  ];

  constructor() { }

  /**
   * Get navigation items filtered by user role
   */
  getNavigationItems(userRole: string): NavigationItem[] {
    return this.navigationItems.filter(item =>
      item.roles.includes(userRole)
    );
  }

  /**
   * Get all navigation items (for admin)
   */
  getAllNavigationItems(): NavigationItem[] {
    return [...this.navigationItems];
  }

  /**
   * Get navigation item by ID
   */
  getNavigationItem(id: string): NavigationItem | undefined {
    return this.navigationItems.find(item => item.id === id);
  }

  /**
   * Check if user has access to a navigation item
   */
  hasAccess(item: NavigationItem, userRole: string): boolean {
    return item.roles.includes(userRole);
  }

  /**
   * Get dashboard route based on user role
   */
  getDashboardRoute(userRole: string): string {
    switch (userRole) {
      case 'enseignant':
        return '/dashboard-enseignant';
      case 'chef departement':
        return '/dashboard-chef';
      case 'rapporteur':
        return '/dashboard-rapporteur';
      case 'admin':
        return '/dashboard-admin';
      case 'president':
         return '/president';
      default:
        return '/dashboard';
    }
  }

  /**
   * Get role-specific menu items with custom logic
   */
  getRoleSpecificItems(userRole: string): NavigationItem[] {
    const baseItems = this.getNavigationItems(userRole);

    // Add role-specific customizations
    switch (userRole) {

      default:
        return baseItems;
    }
  }
}
