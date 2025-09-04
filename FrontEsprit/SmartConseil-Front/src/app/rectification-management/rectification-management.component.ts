import { Component, OnInit } from '@angular/core';
import { RectificationService, RectificationResponse, StatusUpdate } from '../rectification/rectification.service';
import { AuthService } from '../services/auth.service';
import { FilterService, FilterConfig } from '../services/filter.service';

@Component({
  selector: 'app-rectification-management',
  templateUrl: './rectification-management.component.html',
  styleUrls: ['./rectification-management.component.css'],
  standalone: false
})
export class RectificationManagementComponent implements OnInit {
  // Data
  pendingRequests: RectificationResponse[] = [];
  filteredPendingRequests: RectificationResponse[] = [];
  processedHistory: RectificationResponse[] = [];
  filteredProcessedHistory: RectificationResponse[] = [];

  // State management
  isProcessing = false;
  errorMessage = '';
  successMessage = '';

  // Modal state
  showProcessModal = false;
  selectedRequest: RectificationResponse | null = null;
  processAction: 'ACCEPTEE' | 'REFUSEE' = 'ACCEPTEE';
  refusalReason = '';

  // Filter configurations
  rectificationFilterConfig: FilterConfig = {
    searchFields: ['etudiantPrenom', 'etudiantNom', 'classe', 'option', 'justification', 'enseignantUsername'],
    filterFields: [
      { key: 'status', label: 'Statut', type: 'select' },
      { key: 'option', label: 'Option', type: 'select' },
      { key: 'classe', label: 'Classe', type: 'select' }
    ]
  };

  constructor(
    private rectificationService: RectificationService,
    private authService: AuthService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.loadPendingRequests();
    this.loadProcessedHistory();
  }

  loadPendingRequests(): void {
    this.rectificationService.getPendingRequests().subscribe({
      next: (data) => {
        this.pendingRequests = data.filter(req => req.status === 'EN_ATTENTE');
        this.filteredPendingRequests = [...this.pendingRequests];
      },
      error: (error) => {
        console.error('Error loading pending requests:', error);
        this.errorMessage = 'Erreur lors du chargement des demandes en attente';
      }
    });
  }

  loadProcessedHistory(): void {
    this.rectificationService.getProcessedHistory().subscribe({
      next: (data) => {
        this.processedHistory = data.filter(req =>
          req.status === 'ACCEPTEE' || req.status === 'REFUSEE'
        );
        this.filteredProcessedHistory = [...this.processedHistory];
      },
      error: (error) => {
        console.error('Error loading processed history:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'historique';
      }
    });
  }

  onPendingFilterChange(filterData: { searchTerm: string, filters: any }): void {
    this.filteredPendingRequests = this.filterService.filterData(
      this.pendingRequests,
      filterData.searchTerm,
      filterData.filters,
      this.rectificationFilterConfig
    );
  }

  onHistoryFilterChange(filterData: { searchTerm: string, filters: any }): void {
    this.filteredProcessedHistory = this.filterService.filterData(
      this.processedHistory,
      filterData.searchTerm,
      filterData.filters,
      this.rectificationFilterConfig
    );
  }

  openProcessModal(request: RectificationResponse, action: 'ACCEPTEE' | 'REFUSEE'): void {
    this.selectedRequest = request;
    this.processAction = action;
    this.refusalReason = '';
    this.showProcessModal = true;
    this.errorMessage = '';
  }

  closeProcessModal(): void {
    this.showProcessModal = false;
    this.selectedRequest = null;
    this.refusalReason = '';
    this.errorMessage = '';
  }

  confirmProcess(): void {
    if (!this.selectedRequest) return;

    if (this.processAction === 'REFUSEE' && !this.refusalReason.trim()) {
      this.errorMessage = 'Le motif de refus est requis';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const statusUpdate: StatusUpdate = {
      status: this.processAction,
      motifRefus: this.processAction === 'REFUSEE' ? this.refusalReason : undefined
    };

    this.rectificationService.updateStatus(this.selectedRequest.id, statusUpdate).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.successMessage = `Demande ${this.processAction === 'ACCEPTEE' ? 'acceptée' : 'refusée'} avec succès`;
        this.closeProcessModal();
        this.loadPendingRequests();
        this.loadProcessedHistory();
      },
      error: (error) => {
        this.isProcessing = false;
        this.errorMessage = 'Erreur lors du traitement: ' + (error.error?.message || error.message);
      }
    });
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

  calculateNoteDifference(ancienne: number, nouvelle: number): number {
    return nouvelle - ancienne;
  }

  getNoteDifferenceClass(difference: number): string {
    if (difference > 0) return 'text-success';
    if (difference < 0) return 'text-danger';
    return 'text-muted';
  }

  getNoteDifferenceIcon(difference: number): string {
    if (difference > 0) return '↗';
    if (difference < 0) return '↘';
    return '→';
  }

  formatNoteDifference(difference: number): string {
    if (difference > 0) return `+${difference.toFixed(2)}`;
    return difference.toFixed(2);
  }
}
