import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilePictureService {
  private baseURL = 'http://localhost:8088/api/users';
  private profilePictureCache = new Map<string, string>();
  private profilePictureSubject = new BehaviorSubject<string | null>(null);
  
  public profilePicture$ = this.profilePictureSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Upload or update profile picture
   */
  updateProfilePicture(email: string, profilePicture: string): Observable<any> {
    console.log('ProfilePictureService: Updating profile picture for email:', email);
    console.log('ProfilePictureService: Base64 data length:', profilePicture.length);
    console.log('ProfilePictureService: Base URL:', this.baseURL);

    const headers = this.authService.getAuthHeaders();
    console.log('ProfilePictureService: Headers:', headers);

    const payload = {
      email: email,
      profilePicture: profilePicture
    };

    console.log('ProfilePictureService: Making PUT request to:', `${this.baseURL}/profile-picture`);

    return this.http.put<any>(`${this.baseURL}/profile-picture`, payload, { headers })
      .pipe(
        tap((response) => {
          console.log('ProfilePictureService: Upload successful:', response);
          // Update cache and notify subscribers
          this.profilePictureCache.set(email, profilePicture);
          this.profilePictureSubject.next(profilePicture);
        }),
        catchError((error) => {
          console.error('ProfilePictureService: Upload failed:', error);
          throw error;
        })
      );
  }

  /**
   * Get profile picture for a user
   */
  getProfilePicture(email: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.baseURL}/profile?email=${email}`, { headers })
      .pipe(
        tap((user) => {
          if (user && user.profilePicture) {
            this.profilePictureCache.set(email, user.profilePicture);
            this.profilePictureSubject.next(user.profilePicture);
          }
        })
      );
  }

  /**
   * Get cached profile picture
   */
  getCachedProfilePicture(email: string): string | null {
    return this.profilePictureCache.get(email) || null;
  }

  /**
   * Convert file to base64
   */
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No file provided');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject('File must be an image');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject('Error reading file');
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image to fit within max dimensions while maintaining aspect ratio
   */
  resizeImage(file: File, maxWidth: number = 300, maxHeight: number = 300, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedDataUrl);
      };

      img.onerror = () => {
        reject('Error loading image');
      };

      // Convert file to data URL for the image element
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject('Error reading file');
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get default profile picture
   */
  getDefaultProfilePicture(): string {
    return 'assets/images/logos/user-1.jpg.png';
  }

  /**
   * Clear cache for a user
   */
  clearCache(email: string): void {
    this.profilePictureCache.delete(email);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.profilePictureCache.clear();
    this.profilePictureSubject.next(null);
  }
}
