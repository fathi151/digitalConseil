import { Component, OnInit } from '@angular/core';
import { RectificationService, RectificationRequest, RectificationResponse, SmsVerification } from '../rectification/rectification.service';
import { AuthService } from '../services/auth.service';
import { FormDataService } from '../services/form-data.service';

@Component({
  selector: 'app-grade-correction',
  templateUrl: './grade-correction.component.html',
  styleUrls: ['./grade-correction.component.css'],
  standalone: false
})
export class GradeCorrectionComponent implements OnInit {
  // Form data
  formData: RectificationRequest = {
    etudiantPrenom: '',
    etudiantNom: '',
    classe: '',
    option: '',
    ancienneNote: 0,
    nouvelleNote: 0,
    justification: ''
  };

  // SMS verification
  smsVerification: SmsVerification = {
    rectificationId: 0,
    smsCode: ''
  };

  // State management
  showSmsModal = false;
  isSubmitting = false;
  isVerifying = false;
  submissionSuccess = false;
  verificationSuccess = false;
  errorMessage = '';
  successMessage = '';

  // Data
  myRequests: RectificationResponse[] = [];
  history: RectificationResponse[] = [];

  // Form dropdown data
  secteurs: string[] = [];
  options: string[] = [];
  classes: string[] = [];
  justifications: string[] = [];

  // Selected values for cascading dropdowns
  selectedSecteur: string = '';
  selectedOption: string = '';


  constructor(
    private rectificationService: RectificationService,
    private authService: AuthService,
    private formDataService: FormDataService
  ) {}

  ngOnInit(): void {
    this.initializeFormData();
    this.loadMyRequests();
    this.loadHistory();
  }

  initializeFormData(): void {
    this.secteurs = this.formDataService.getSecteurs();
    this.justifications = this.formDataService.getJustifications();
  }

  onSecteurChange(): void {
    this.options = this.formDataService.getOptionsBySecteur(this.selectedSecteur);
    this.selectedOption = '';
    this.formData.option = '';
    this.classes = [];
    this.formData.classe = '';
  }

  onOptionChange(): void {
    this.classes = this.formDataService.getClassesByOption(this.selectedOption);
    this.formData.option = this.selectedOption;
    this.formData.classe = '';
  }

  loadMyRequests(): void {
    this.rectificationService.getMyRequests().subscribe({
      next: (data) => {
        this.myRequests = data;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
      }
    });
  }

  loadHistory(): void {
    this.rectificationService.getHistory().subscribe({
      next: (data) => {
        this.history = data;
      },
      error: (error) => {
        console.error('Error loading history:', error);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.rectificationService.create(this.formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submissionSuccess = true;
        this.successMessage = 'Demande de rectification créée avec succès. Veuillez vérifier votre SMS.';
        
        // Show SMS verification modal
        this.smsVerification.rectificationId = response.id;
        this.showSmsModal = true;
        
        // Reset form
        this.resetForm();
        
        // Reload data
        this.loadMyRequests();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Rectification creation error:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);

        let errorMsg = 'Erreur lors de la création de la demande: ';
        if (error.status === 0) {
          errorMsg += 'Impossible de contacter le serveur. Vérifiez que le service de rectification est démarré sur le port 8089.';
        } else if (error.status === 401) {
          errorMsg += 'Non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMsg += 'Accès refusé. Vérifiez vos permissions.';
        } else {
          errorMsg += error.error?.message || error.message || `Erreur ${error.status}`;
        }
        this.errorMessage = errorMsg;
      }
    });
  }

  onVerifySms(): void {
    if (!this.smsVerification.smsCode) {
      this.errorMessage = 'Veuillez saisir le code SMS';
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';

    this.rectificationService.verifySms(this.smsVerification).subscribe({
      next: (response) => {
        this.isVerifying = false;
        if (response.verified) {
          this.verificationSuccess = true;
          this.successMessage = 'Vérification SMS réussie. Votre demande a été soumise.';
          this.showSmsModal = false;
          this.loadMyRequests();
        } else {
          this.errorMessage = response.message || 'Code SMS invalide';
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.errorMessage = 'Erreur lors de la vérification SMS: ' + (error.error?.message || error.message);
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.etudiantPrenom.trim()) {
      this.errorMessage = 'Le prénom de l\'étudiant est requis';
      return false;
    }
    if (!this.formData.etudiantNom.trim()) {
      this.errorMessage = 'Le nom de l\'étudiant est requis';
      return false;
    }
    if (!this.formData.classe.trim()) {
      this.errorMessage = 'La classe est requise';
      return false;
    }
    if (!this.formData.option.trim()) {
      this.errorMessage = 'L\'option est requise';
      return false;
    }
    if (this.formData.ancienneNote < 0 || this.formData.ancienneNote > 20) {
      this.errorMessage = 'L\'ancienne note doit être entre 0 et 20';
      return false;
    }
    if (this.formData.nouvelleNote < 0 || this.formData.nouvelleNote > 20) {
      this.errorMessage = 'La nouvelle note doit être entre 0 et 20';
      return false;
    }
    if (!this.formData.justification.trim()) {
      this.errorMessage = 'La justification est requise';
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.formData = {
      etudiantPrenom: '',
      etudiantNom: '',
      classe: '',
      option: '',
      ancienneNote: 0,
      nouvelleNote: 0,
      justification: ''
    };
    this.selectedSecteur = '';
    this.selectedOption = '';
    this.options = [];
    this.classes = [];
  }

  closeSmsModal(): void {
    this.showSmsModal = false;
    this.smsVerification.smsCode = '';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE_SMS':
        return 'badge-warning';
      case 'EN_ATTENTE':
        return 'badge-info';
      case 'ACCEPTEE':
        return 'badge-success';
      case 'REFUSEE':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'EN_ATTENTE_SMS':
        return 'En attente SMS';
      case 'EN_ATTENTE':
        return 'En attente';
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'REFUSEE':
        return 'Refusée';
      default:
        return status;
    }
  }
}
