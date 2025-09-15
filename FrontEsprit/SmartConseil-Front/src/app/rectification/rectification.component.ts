import { Component, OnInit } from '@angular/core';
import { Rectification, RectificationService, RectificationRequest, RectificationResponse } from './rectification.service';
import { AuthService } from '../services/auth.service';
import { FormDataService } from '../services/form-data.service';

@Component({
    selector: 'app-rectification',
    templateUrl: './rectification.component.html',
    styleUrls: ['./rectification.component.css'],
    standalone: false
})
export class RectificationComponent implements OnInit {
  rectifications: RectificationResponse[] = [];
  formData: RectificationRequest = {
    etudiantPrenom: '',
    etudiantNom: '',
    classe: '',
    option: '',
    ancienneNote: 0,
    nouvelleNote: 0,
    justification: ''
  };

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
    this.loadAll();
  }

  initializeFormData(): void {
    this.secteurs = this.formDataService.getSecteurs();
    this.justifications = this.formDataService.getJustifications();
  }

  loadAll() {
    this.rectificationService.getAll().subscribe(data => {
      this.rectifications = data;
    });
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

  submit() {
    this.rectificationService.create(this.formData).subscribe(() => {
      this.resetForm();
      this.loadAll();
    });
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
}

