import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ConseilService } from '../conseil.service';
import { Utilisateur } from 'src/app/utilisateur/Utilisateur';
import { Conseil } from '../conseil/Conseil';
import { ConseilDTO } from '../conseil/ConseilDTO';
import { Salle } from '../salle/Salle';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modifier-cons',
  templateUrl: './modifier-cons.component.html',
  styleUrls: ['./modifier-cons.component.css']
})
export class ModifierConsComponent implements OnInit {

  Users: Utilisateur[] = [];
  ConseilForm!: FormGroup;
  Salles: Salle[] = [];
  conseilId!: number;
  conseil!: Conseil;
  durees: string[] = [
    '1h00',
    '1h30',
    '2h00',
    '2h30',
    '3h00'
  ];

  constructor(
    private formBuilder: FormBuilder,
    HttpClient: HttpClientModule,
    private conseilService: ConseilService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.GetAllSalle();
    this.GetAlluser();

    // Récupérer l'ID du conseil depuis l'URL
    this.route.params.subscribe(params => {
      this.conseilId = +params['id'];
      this.loadConseilData();
    });

    this.initializeForm();
  }

  initializeForm(): void {
    this.ConseilForm = new FormGroup({
      classes: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      heure: new FormControl('', Validators.required),
      duree: new FormControl('', Validators.required),
      salleId: new FormControl('', Validators.required),
      presidentId: new FormControl('', Validators.required),
      rapporteurId: new FormControl('', Validators.required),
      description: new FormControl('')
    });
  }

  loadConseilData(): void {

    this.conseilService.getConseil().subscribe(data => {
      this.conseil = data.find(c => c.id === this.conseilId)!;
      if (this.conseil) {
        this.populateForm();
      }
    });
  }

  populateForm(): void {
    // Pré-remplir le formulaire avec les données existantes
    this.ConseilForm.patchValue({
      classes: this.conseil.classes,
      date: this.formatDateForInput(this.conseil.date),
      heure: this.conseil.heure,
      duree: this.conseil.duree,
      salleId: this.conseil.salle?.id || '',
      presidentId: this.conseil.presidentId,
      rapporteurId: this.conseil.raporteurId,
      description: this.conseil.description,
      etat: this.conseil.etat
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getPresidents(): Utilisateur[] {
    return this.Users.filter(user => user.role === 'PRESIDENT');
  }

  getRapporteurs(): Utilisateur[] {
    return this.Users.filter(user => user.role === 'RAPPORTEUR');
  }

  onSubmit() {
    if (this.ConseilForm.valid) {
      let formValue = this.ConseilForm.value;

      let conseilModifie: Conseil = {
        id: this.conseilId,
        date: new Date(formValue.date),
        duree: formValue.duree,
        description: formValue.description,
        classes: formValue.classes,
        salle: this.Salles.find(s => s.id === formValue.salleId) || null,
        heure: formValue.heure,
        presidentId: formValue.presidentId,
        raporteurId: formValue.rapporteurId,
        conseilUtilisateurs: this.conseil.conseilUtilisateurs || [],
        etat: this.conseil.etat,
        deroulement: this.conseil.deroulement,
        token: this.conseil.token,
        option: this.conseil.option
      };

      console.log('Conseil à modifier:', conseilModifie);

      this.conseilService.updateConseil(conseilModifie).subscribe(
        data => {
          console.log('Conseil modifié avec succès', data);
          alert('Conseil modifié avec succès !');
          this.router.navigate(['/conseil']);
        },
        error => {
          console.error('Erreur lors de la modification:', error);
          alert('Erreur lors de la modification du conseil');
        }
      );
    }
  }

  GetAlluser() {
    this.conseilService.getUsers().subscribe(data => {
      console.log(data);
      this.Users = data;
    });
  }

  GetAllSalle() {
    this.conseilService.getSalles().subscribe(data => {
      console.log(data);
      this.Salles = data;
    });
  }

  onCancel() {
    this.router.navigate(['/conseil']);
  }
}
