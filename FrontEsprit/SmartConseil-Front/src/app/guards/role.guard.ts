import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const expectedRoles = route.data['expectedRoles'] as string[];

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/utilisateur']);
      return false;
    }

    if (expectedRoles && expectedRoles.length > 0) {
      const hasRole = this.authService.hasAnyRole(expectedRoles);
      if (!hasRole) {
        // Redirect to appropriate dashboard if user doesn't have required role
        this.authService.redirectToDashboard();
        return false;
      }
    }

    return true;
  }
}
