import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: false
})
export class LayoutComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Redirect if not authenticated
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.authService.logout();
      }
    });
  }
}
