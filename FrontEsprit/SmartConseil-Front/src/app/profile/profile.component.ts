import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { UtilisateurService } from '../utilisateur/utilisateur.service';
import { ProfilePictureService } from '../services/profile-picture.service';
import { Router } from '@angular/router';

export interface ProfileUpdateRequest {
  username: string;
  poste: string;
  secteur: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileData: ProfileUpdateRequest = {
    username: '',
    poste: '',
    secteur: '',
    email: '',
    phoneNumber: ''
  };

  passwordData: PasswordChangeRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isEditing = false;
  isChangingPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Profile picture related properties
  selectedFile: File | null = null;
  profilePicturePreview: string | null = null;
  isUploadingPicture = false;
  profilePictureError = '';
  
  // Available options for dropdowns
  secteurs = [
    'Informatique',
    'Mathématique',
    'Telecommunication',
    'ML',
    'GC',
    'Administration'
  ];
  
  postes = [
    'Professeur',
    'Maître de Conférences',
    'Professeur Associé',
    'Chef de Département',
    'Directeur',
    'Rapporteur',
    'Enseignant',
    'Assistant'
  ];

  constructor(
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private profilePictureService: ProfilePictureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadUserProfile();
      } else {
        this.router.navigate(['/utilisateur']);
      }
    });
  }

  loadUserProfile(): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Try to load profile from backend, but fallback to current user data if restricted
    this.utilisateurService.getUserProfile(this.currentUser.email).subscribe({
      next: (profile) => {
        this.profileData = {
          username: profile.username || '',
          poste: profile.poste || '',
          secteur: profile.secteur || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile (using fallback):', error);
        // If profile endpoint fails (due to role restrictions), use current user data
        // This is a temporary workaround until backend is updated to allow all roles
        this.profileData = {
          username: this.currentUser?.username || '',
          poste: this.getDefaultPosteForRole(this.currentUser?.role || ''),
          secteur: 'Informatique', // Default sector
          email: this.currentUser?.email || '',
          phoneNumber: this.currentUser?.phoneNumber || ''
        };
        this.isLoading = false;
      }
    });
  }

  private getDefaultPosteForRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'enseignant':
        return 'Professeur';
      case 'chef departement':
        return 'Chef de Département';
      case 'rapporteur':
        return 'Rapporteur';
      case 'president jury':
        return 'Président de Jury';
      default:
        return 'Enseignant';
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.clearMessages();
    
    if (!this.isEditing) {
      // Reset form when canceling edit
      this.loadUserProfile();
    }
  }

  saveProfile(): void {
    if (!this.validateProfileForm()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.utilisateurService.updateProfile(this.profileData).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès!';
        this.isEditing = false;
        this.isLoading = false;

        // Update current user data in auth service if needed
        if (this.currentUser) {
          this.currentUser.username = this.profileData.username;
          this.currentUser.phoneNumber = this.profileData.phoneNumber;
        }

        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
        this.isLoading = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  private validateProfileForm(): boolean {
    this.clearMessages();

    if (!this.profileData.username || this.profileData.username.trim().length === 0) {
      this.errorMessage = 'Le nom d\'utilisateur est requis.';
      return false;
    }

    if (!this.profileData.phoneNumber || this.profileData.phoneNumber.trim().length === 0) {
      this.errorMessage = 'Le numéro de téléphone est requis.';
      return false;
    }

    // Basic phone number validation
    const phonePattern = /^(\+216\s?)?[0-9\s\-]{8,15}$/;
    if (!phonePattern.test(this.profileData.phoneNumber)) {
      this.errorMessage = 'Format de numéro de téléphone invalide. Utilisez le format: +216 XX XXX XXX';
      return false;
    }

    return true;
  }



  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.clearMessages();

    if (!this.isChangingPassword) {
      // Reset password form when canceling
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.clearMessages();
  }

  isPasswordValid(): boolean {
    return !!(
      this.passwordData.currentPassword &&
      this.passwordData.newPassword &&
      this.passwordData.confirmPassword &&
      this.passwordData.newPassword === this.passwordData.confirmPassword &&
      this.passwordData.newPassword.length >= 6
    );
  }

  changePassword(): void {
    if (!this.isPasswordValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    console.log('Attempting to change password with data:', {
      currentPassword: this.passwordData.currentPassword ? '***' : 'empty',
      newPassword: this.passwordData.newPassword ? '***' : 'empty',
      confirmPassword: this.passwordData.confirmPassword ? '***' : 'empty'
    });

    this.isLoading = true;
    this.clearMessages();

    this.utilisateurService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe changé avec succès!';
        this.isChangingPassword = false;
        this.isLoading = false;

        // Reset password form
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });

        if (error.status === 400) {
          // Handle specific error messages from backend
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else {
            this.errorMessage = 'Mot de passe actuel incorrect ou nouveau mot de passe invalide.';
          }
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé. Veuillez vous reconnecter.';
        } else if (error.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else {
          this.errorMessage = `Erreur lors du changement de mot de passe (${error.status}). Veuillez réessayer.`;
        }

        this.isLoading = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 7000);
      }
    });
  }

  testBackend(): void {
    console.log('Testing backend connectivity...');
    this.clearMessages();

    // Test authentication first
    const token = this.authService.getToken();
    const currentUser = this.authService.getCurrentUser();

    console.log('Authentication check:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      currentUser: currentUser ? currentUser.email : 'none',
      isAuthenticated: this.authService.isAuthenticated()
    });

    // Test basic connectivity
    this.utilisateurService.testBackend().subscribe({
      next: (response) => {
        console.log('Backend test successful:', response);
        this.successMessage = 'Backend connecté avec succès! Auth: ' + (token ? 'OK' : 'NO TOKEN');
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Backend test failed:', error);
        this.errorMessage = `Backend non accessible: ${error.status} - ${error.statusText}`;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  usePasswordReset(): void {
    if (this.currentUser && this.currentUser.email) {
      this.isLoading = true;
      this.clearMessages();

      this.utilisateurService.forgotPassword(this.currentUser.email).subscribe({
        next: () => {
          this.successMessage = 'Email de réinitialisation envoyé! Vérifiez votre boîte mail.';
          this.isLoading = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error) => {
          console.error('Error sending reset email:', error);
          this.errorMessage = 'Erreur lors de l\'envoi de l\'email de réinitialisation.';
          this.isLoading = false;
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    }
  }

  // Profile picture methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.profilePictureError = '';

      // Validate file
      if (!file.type.startsWith('image/')) {
        this.profilePictureError = 'Veuillez sélectionner un fichier image valide.';
        this.selectedFile = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.profilePictureError = 'La taille du fichier ne doit pas dépasser 5MB.';
        this.selectedFile = null;
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile || !this.currentUser) {
      console.error('Missing selectedFile or currentUser:', { selectedFile: !!this.selectedFile, currentUser: !!this.currentUser });
      return;
    }

    console.log('Starting profile picture upload for user:', this.currentUser.email);
    console.log('Selected file:', this.selectedFile.name, 'Size:', this.selectedFile.size, 'Type:', this.selectedFile.type);

    this.isUploadingPicture = true;
    this.profilePictureError = '';
    this.clearMessages();

    // Resize and convert to base64
    this.profilePictureService.resizeImage(this.selectedFile, 300, 300, 0.8)
      .then((resizedBase64) => {
        console.log('Image resized successfully. Base64 length:', resizedBase64.length);
        console.log('Base64 preview:', resizedBase64.substring(0, 100) + '...');

        // Upload to server - properly subscribe to the Observable
        this.profilePictureService.updateProfilePicture(this.currentUser!.email, resizedBase64)
          .subscribe({
            next: (response) => {
              console.log('Profile picture upload successful:', response);
              this.successMessage = 'Photo de profil mise à jour avec succès!';
              this.isUploadingPicture = false;
              this.selectedFile = null;
              this.profilePicturePreview = null;

              // Reset file input
              const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
              if (fileInput) {
                fileInput.value = '';
              }

              // Refresh the profile picture display
              this.loadUserProfile();

              setTimeout(() => {
                this.successMessage = '';
              }, 5000);
            },
            error: (error) => {
              console.error('Error uploading profile picture:', error);
              console.error('Error details:', {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                error: error.error
              });

              let errorMessage = 'Erreur lors de la mise à jour de la photo de profil.';
              if (error.error && error.error.error) {
                errorMessage = error.error.error;
              } else if (error.status === 413) {
                errorMessage = 'Image trop volumineuse. Veuillez choisir une image plus petite.';
              } else if (error.status === 400) {
                errorMessage = 'Format d\'image invalide ou données corrompues.';
              } else if (error.status === 401) {
                errorMessage = 'Session expirée. Veuillez vous reconnecter.';
              }

              this.profilePictureError = errorMessage;
              this.isUploadingPicture = false;

              setTimeout(() => {
                this.profilePictureError = '';
              }, 5000);
            }
          });
      })
      .catch((error) => {
        console.error('Error resizing image:', error);
        this.profilePictureError = 'Erreur lors du traitement de l\'image.';
        this.isUploadingPicture = false;
      });
  }

  cancelProfilePictureUpload(): void {
    this.selectedFile = null;
    this.profilePicturePreview = null;
    this.profilePictureError = '';

    // Reset file input
    const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  goBack(): void {
    this.authService.redirectToDashboard();
  }
}
