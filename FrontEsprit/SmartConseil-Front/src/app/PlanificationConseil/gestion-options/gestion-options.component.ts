import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConseilService } from '../conseil.service';
import { Option } from '../option/Option';
import { Classe } from '../classe/Classe';

@Component({
  selector: 'app-gestion-options',
  templateUrl: './gestion-options.component.html',
  styleUrls: ['./gestion-options.component.css']
})
export class GestionOptionsComponent implements OnInit {

  optionForm!: FormGroup;
  classeForm!: FormGroup;

  options: Option[] = [];
  classes: Classe[] = [];
  selectedOption: Option | null = null;

  showOptionForm = false;
  showClasseForm = false;

  constructor(
    private formBuilder: FormBuilder,
    private conseilService: ConseilService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadOptions();
  }

  initializeForms() {
    this.optionForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    this.classeForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      optionId: ['', Validators.required]
    });
  }

  loadOptions() {
    this.conseilService.getOptions().subscribe({
      next: (data) => {
        this.options = data;
        console.log('Options chargées:', data);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des options:', error);
      }
    });
  }

  loadClassesForOption(optionId: number) {
    this.conseilService.getClassesByOption(optionId).subscribe({
      next: (data) => {
        this.classes = data;
        console.log('Classes chargées pour l\'option:', data);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  onOptionSelect(option: Option) {
    this.selectedOption = option;
    this.loadClassesForOption(option.id);
    this.classeForm.patchValue({ optionId: option.id });
  }

  onSubmitOption() {
    if (this.optionForm.valid) {
      const newOption: Option = {
        id: 0,
        nom: this.optionForm.value.nom,
        description: this.optionForm.value.description
      };

      this.conseilService.addOption(newOption).subscribe({
        next: (response) => {
          console.log('Option ajoutée:', response);
          this.loadOptions();
          this.optionForm.reset();
          this.showOptionForm = false;
          alert('Option ajoutée avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de l\'option:', error);
          alert('Erreur lors de l\'ajout de l\'option');
        }
      });
    }
  }

  onSubmitClasse() {
    if (this.classeForm.valid && this.selectedOption) {
      const newClasse: Classe = {
        id: 0,
        nom: this.classeForm.value.nom,
        description: this.classeForm.value.description,
        optionId: this.selectedOption.id
      };

      this.conseilService.addClasse(newClasse).subscribe({
        next: (response) => {
          console.log('Classe ajoutée:', response);
          this.loadClassesForOption(this.selectedOption!.id);
          this.classeForm.reset();
          this.classeForm.patchValue({ optionId: this.selectedOption!.id });
          this.showClasseForm = false;
          alert('Classe ajoutée avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la classe:', error);
          alert('Erreur lors de l\'ajout de la classe');
        }
      });
    }
  }

  toggleOptionForm() {
    this.showOptionForm = !this.showOptionForm;
    if (this.showOptionForm) {
      this.showClasseForm = false;
    }
  }

  toggleClasseForm() {
    this.showClasseForm = !this.showClasseForm;
    if (this.showClasseForm) {
      this.showOptionForm = false;
    }
  }

  cancelOptionForm() {
    this.showOptionForm = false;
    this.optionForm.reset();
  }

  cancelClasseForm() {
    this.showClasseForm = false;
    this.classeForm.reset();
    if (this.selectedOption) {
      this.classeForm.patchValue({ optionId: this.selectedOption.id });
    }
  }
}
