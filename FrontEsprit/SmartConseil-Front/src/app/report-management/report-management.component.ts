import { Component, OnInit } from '@angular/core';
import { RapportService, RapportRequest, RapportResponse, RapportUpdate } from '../services/rapport.service';
import { AuthService } from '../services/auth.service';
import { FormDataService } from '../services/form-data.service';
import { FilterService, FilterConfig } from '../services/filter.service';

@Component({
  selector: 'app-report-management',
  templateUrl: './report-management.component.html',
  styleUrls: ['./report-management.component.css'],
  standalone: false
})
export class ReportManagementComponent implements OnInit {
  // Data
  myReports: RapportResponse[] = [];
  filteredReports: RapportResponse[] = [];
  drafts: RapportResponse[] = [];
  validatedReports: RapportResponse[] = [];
  
  // Form data
  formData: RapportRequest = {
    titre: '',
    contenu: '',
    option: '' ,
    classe: '',
    secteur: '',
    anneeAcademique: '',
    semestre: ''
  };

  // State management
  isSubmitting = false;
  isUpdating = false;
  isValidating = false;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal state
  showCreateModal = false;
  showEditModal = false;
  showViewModal = false;
  showDeleteModal = false;
  selectedReport: RapportResponse | null = null;
  editFormData: RapportUpdate = {
    titre: '',
    contenu: '',
    option: '' ,
    classe: '',
    secteur: '',
    anneeAcademique: '',
    semestre: ''
  };

  // Current view
  currentView: 'all' | 'drafts' | 'validated' = 'all';

  // Form dropdown data
  secteurs: string[] = [];
  options: string[] = [];
  classes: string[] = [];

  // Filter configuration
  reportFilterConfig: FilterConfig = {
    searchFields: ['titre', 'contenu', 'classe', 'secteur', 'option', 'anneeAcademique'],
    filterFields: [
      { key: 'statut', label: 'Statut', type: 'select' },
      { key: 'secteur', label: 'Secteur', type: 'select' },
      { key: 'semestre', label: 'Semestre', type: 'select' },
      { key: 'anneeAcademique', label: 'Année Académique', type: 'text' }
    ]
  };


  semestres = [
    'Semestre 1',
    'Semestre 2'
  ];

  constructor(
    private rapportService: RapportService,
    private authService: AuthService,
    private formDataService: FormDataService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.initializeFormData();
    this.loadReports();
    this.setCurrentAcademicYear();
  }

  initializeFormData(): void {
    this.secteurs = this.formDataService.getSecteurs();
  }

  setCurrentAcademicYear(): void {
    const currentYear = new Date().getFullYear();
    this.formData.anneeAcademique = `${currentYear}-${currentYear + 1}`;
    this.editFormData.anneeAcademique = `${currentYear}-${currentYear + 1}`;
  }

  loadReports(): void {
    this.loadMyReports();
    this.loadDrafts();
    this.loadValidatedReports();
  }

  loadMyReports(): void {
    this.rapportService.getMyReports().subscribe({
      next: (data) => {
        this.myReports = data;
        this.filteredReports = [...data];
      },
      error: (error) => {
        console.error('Error loading reports:', error);
      }
    });
  }

  onReportFilterChange(filterData: { searchTerm: string, filters: any }): void {
    const currentReports = this.getCurrentReports();
    this.filteredReports = this.filterService.filterData(
      currentReports,
      filterData.searchTerm,
      filterData.filters,
      this.reportFilterConfig
    );
  }

  loadDrafts(): void {
    this.rapportService.getMyDrafts().subscribe({
      next: (data) => {
        this.drafts = data;
      },
      error: (error) => {
        console.error('Error loading drafts:', error);
      }
    });
  }

  loadValidatedReports(): void {
    this.rapportService.getMyValidatedReports().subscribe({
      next: (data) => {
        this.validatedReports = data;
      },
      error: (error) => {
        console.error('Error loading validated reports:', error);
      }
    });
  }

  getCurrentReports(): RapportResponse[] {
    switch (this.currentView) {
      case 'drafts':
        return this.drafts;
      case 'validated':
        return this.validatedReports;
      default:
        return this.myReports;
    }
  }

  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal = true;
    this.errorMessage = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  openEditModal(report: RapportResponse): void {
    this.selectedReport = report;
    this.editFormData = {
      titre: report.titre,
      contenu: report.contenu,
      option: report.option,
      classe: report.classe,
      secteur: report.secteur,
      anneeAcademique: report.anneeAcademique,
      semestre: report.semestre
    };
    this.showEditModal = true;
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedReport = null;
  }

  openViewModal(report: RapportResponse): void {
    this.selectedReport = report;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedReport = null;
  }

  openDeleteModal(report: RapportResponse): void {
    this.selectedReport = report;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedReport = null;
  }

  onSubmit(): void {
    if (!this.validateForm(this.formData)) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.rapportService.createRapport(this.formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Rapport créé avec succès';
        this.closeCreateModal();
        this.loadReports();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Report creation error:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);

        let errorMsg = 'Erreur lors de la création: ';
        if (error.status === 0) {
          errorMsg += 'Impossible de contacter le serveur. Vérifiez que le service de rapport est démarré sur le port 8087.';
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

  onUpdate(): void {
    if (!this.selectedReport || !this.validateForm(this.editFormData)) {
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';

    this.rapportService.updateRapport(this.selectedReport.id, this.editFormData).subscribe({
      next: (_response) => {
        this.isUpdating = false;
        this.successMessage = 'Rapport mis à jour avec succès';
        this.closeEditModal();
        this.loadReports();
      },
      error: (error) => {
        this.isUpdating = false;
        this.errorMessage = 'Erreur lors de la mise à jour: ' + (error.error?.message || error.message);
      }
    });
  }

  onValidate(report: RapportResponse): void {
    this.isValidating = true;
    this.errorMessage = '';

    this.rapportService.validateRapport(report.id).subscribe({
      next: (_response) => {
        this.isValidating = false;
        this.successMessage = 'Rapport validé avec succès';
        this.loadReports();
      },
      error: (error) => {
        this.isValidating = false;
        this.errorMessage = 'Erreur lors de la validation: ' + (error.error?.message || error.message);
      }
    });
  }

  onDelete(): void {
    if (!this.selectedReport) return;

    this.isDeleting = true;
    this.errorMessage = '';

    this.rapportService.deleteRapport(this.selectedReport.id).subscribe({
      next: (_response) => {
        this.isDeleting = false;
        this.successMessage = 'Rapport supprimé avec succès';
        this.closeDeleteModal();
        this.loadReports();
      },
      error: (error) => {
        this.isDeleting = false;
        this.errorMessage = 'Erreur lors de la suppression: ' + (error.error?.message || error.message);
      }
    });
  }

  validateForm(formData: RapportRequest | RapportUpdate): boolean {
    if (!formData.titre.trim()) {
      this.errorMessage = 'Le titre est requis';
      return false;
    }
    if (!formData.contenu.trim()) {
      this.errorMessage = 'Le contenu est requis';
      return false;
    }
    if (!formData.classe.trim()) {
      this.errorMessage = 'La classe est requise';
      return false;
    }
    if (!formData.secteur.trim()) {
      this.errorMessage = 'Le secteur est requis';
      return false;
    }
    if (!formData.anneeAcademique.trim()) {
      this.errorMessage = 'L\'année académique est requise';
      return false;
    }
    if (!formData.semestre.trim()) {
      this.errorMessage = 'Le semestre est requis';
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.formData = {
      titre: '',
      contenu: '',
      option: '' ,
      classe: '',
      secteur: '',
      anneeAcademique: '',
      semestre: ''
    };
    this.setCurrentAcademicYear();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'BROUILLON':
        return 'badge-warning';
      case 'VALIDE':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'BROUILLON':
        return 'Brouillon';
      case 'VALIDE':
        return 'Validé';
      default:
        return status;
    }
  }

  canEdit(report: RapportResponse | null): boolean {
    return report?.statut === 'BROUILLON';
  }

  canDelete(report: RapportResponse | null): boolean {
    return report?.statut === 'BROUILLON';
  }

  canValidate(report: RapportResponse | null): boolean {
    return report?.statut === 'BROUILLON';
  }


  onSecteurChange(): void {
    this.options = this.formDataService.getOptionsBySecteur(this.formData.secteur);
    this.formData.option = '';
    this.classes = [];
    this.formData.classe = '';
  }

  onOptionChange(): void {
    this.classes = this.formDataService.getClassesByOption(this.formData.option);
    this.formData.classe = '';
  }



}
