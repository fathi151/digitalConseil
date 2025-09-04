import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProfilePictureService } from '../../services/profile-picture.service';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css'],
  standalone: false
})
export class ProfilePictureComponent implements OnInit, OnDestroy {
  @Input() email: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() shape: 'circle' | 'square' = 'circle';
  @Input() showBorder: boolean = true;
  @Input() alt: string = 'Profile Picture';

  profilePicture: string = '';
  isLoading: boolean = false;
  hasError: boolean = false;
  private subscription?: Subscription;

  constructor(private profilePictureService: ProfilePictureService) {}

  ngOnInit(): void {
    this.loadProfilePicture();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadProfilePicture(): void {
    console.log('ProfilePictureComponent: Loading profile picture for email:', this.email);

    if (!this.email) {
      console.log('ProfilePictureComponent: No email provided, using default');
      this.setDefaultPicture();
      return;
    }

    // First check cache
    const cachedPicture = this.profilePictureService.getCachedProfilePicture(this.email);
    if (cachedPicture) {
      console.log('ProfilePictureComponent: Found cached picture');
      this.profilePicture = cachedPicture;
      this.hasError = false;
      return;
    }

    // Load from server
    console.log('ProfilePictureComponent: Loading from server');
    this.isLoading = true;
    this.subscription = this.profilePictureService.getProfilePicture(this.email).subscribe({
      next: (user) => {
        console.log('ProfilePictureComponent: Server response:', user);
        this.isLoading = false;
        if (user && user.profilePicture) {
          console.log('ProfilePictureComponent: Using server picture');
          this.profilePicture = user.profilePicture;
          this.hasError = false;
        } else {
          console.log('ProfilePictureComponent: No server picture, using default');
          this.setDefaultPicture();
        }
      },
      error: (error) => {
        console.error('ProfilePictureComponent: Error loading profile picture:', error);
        this.isLoading = false;
        this.setDefaultPicture();
      }
    });
  }

  private setDefaultPicture(): void {
    this.profilePicture = this.profilePictureService.getDefaultProfilePicture();
    this.hasError = false;
    console.log('ProfilePictureComponent: Using default picture:', this.profilePicture);
  }

  onImageError(): void {
    this.hasError = true;
    this.setDefaultPicture();
  }

  getSizeClass(): string {
    switch (this.size) {
      case 'small':
        return 'profile-picture-small';
      case 'large':
        return 'profile-picture-large';
      default:
        return 'profile-picture-medium';
    }
  }

  getShapeClass(): string {
    return this.shape === 'circle' ? 'profile-picture-circle' : 'profile-picture-square';
  }

  getBorderClass(): string {
    return this.showBorder ? 'profile-picture-border' : '';
  }
}
