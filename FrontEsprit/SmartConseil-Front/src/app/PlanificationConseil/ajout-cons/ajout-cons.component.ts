import { Component, OnInit } from '@angular/core';
import { FormBuilder,Validators,FormGroup, FormControl } from '@angular/forms';
import { ConseilService } from '../conseil.service';
import { Utilisateur } from 'src/app/utilisateur/Utilisateur';
import { Conseil } from '../conseil/Conseil';
import { ConseilDTO } from '../conseil/ConseilDTO';
import { Salle } from '../salle/Salle';
import { Router } from '@angular/router';
import { Option } from '../option/Option';
import { Classe } from '../classe/Classe';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ExcelImportService } from '../excel-import/excel-import.service';
import { ExcelData } from '../excel-import/ExcelData';
@Component({
  selector: 'app-ajout-cons',
  templateUrl: './ajout-cons.component.html',
  styleUrls: ['./ajout-cons.component.css']
})
export class AjoutConsComponent implements OnInit {

Users:Utilisateur[]=[];
Options: Option[] = [];
Classes: Classe[] = [];
selectedClasseIds: number[] = [];

// ID du conseil créé
conseilId!: number

// Méthode pour naviguer vers la liste des conseils
navigateToConseilList() {
  this.router.navigate(['/conseil']);
}

// Propriétés pour l'import Excel
selectedFile: File | null = null;
progressInfo: number = 0;
importMessage: string = '';
importSuccess: boolean = false;
importError: boolean = false;

selectedFile1: File | null = null;
progressInfo1: number = 0;
importMessage1: string = '';
importSuccess1: boolean = false;
importError1: boolean = false;




importedData: ExcelData[] = [];
showImportedData: boolean = false;

constructor(
  private formBuilder: FormBuilder, 
  private conseilService: ConseilService, 
  private excelImportService: ExcelImportService,
  private router: Router
) { }

ConseilForm!:FormGroup;
  Salles:Salle[]=[];
  durees: string[] = [
    '1h00',
    '1h30',
    '2h00',
    '2h30',
    '3h00'
  ];
  ngOnInit(): void {
    this.GetAllSalle();
    this.GetAlluser();
    this.GetAllOptions();

    console.log(sessionStorage.getItem('token'));

this.ConseilForm = new FormGroup({
  optionId: new FormControl('', Validators.required),
  classeIds: new FormControl([], Validators.required),
  date: new FormControl('', Validators.required),
  heure: new FormControl('', Validators.required),
  duree: new FormControl('', Validators.required),
  salleId: new FormControl('', Validators.required),
    presidentId: new FormControl('', Validators.required),
    rapporteurId: new FormControl('', Validators.required),
  description: new FormControl(''),
  etat: new FormControl(false,Validators.required)
});

  }



  getPresidents(): Utilisateur[] {
  return this.Users.filter(user => user.role === 'president');
}

getRapporteurs(): Utilisateur[] {
  return this.Users.filter(user => user.role === 'rapporteur');
}


onSubmit() {
  let formValue = this.ConseilForm.value;

  let conseil: ConseilDTO = {
    id: 0,
    date: formValue.date,
    duree: formValue.duree,
    description: formValue.description,
    optionId: formValue.optionId,
    classeIds: this.selectedClasseIds,
    salleId: formValue.salleId,
    heure: formValue.heure,
    presidentId: formValue.presidentId,
    raporteurId: formValue.rapporteurId,
    etat:false,
    deroulement:'pas-debute'

  };

  console.log(conseil);

  this.conseilService.addConseil(conseil).subscribe(data => {
    console.log('Conseil ajouté', data);
    // Stocker l'ID du conseil créé
    this.conseilId = data.id;
    console.log('ID du conseil créé:', this.conseilId);
    
    alert('Conseil créé avec succès! Vous pouvez maintenant importer des données Excel pour ce conseil.');
    // Ne pas rediriger immédiatement pour permettre l'import de données
    // this.router.navigate(['/conseil']);
  });
}


GetAlluser()
{
this.conseilService.getUsers().subscribe(data=>{
  console.log(data);

  this.Users=data;});

}


  GetAllSalle(){
this.conseilService.getSalles().subscribe(data=>{
  console.log(data);

  this.Salles=data;})
}

GetAllOptions() {
  this.conseilService.getOptions().subscribe(data => {
    console.log('Options:', data);
    this.Options = data;
  });
}

onOptionChange(optionId: string | number) {
  this.selectedClasseIds = [];
  this.Classes = [];

  const numericOptionId = typeof optionId === 'string' ? parseInt(optionId, 10) : optionId;

  if (numericOptionId && !isNaN(numericOptionId)) {
    this.conseilService.getClassesByOption(numericOptionId).subscribe(data => {
      console.log('Classes for option:', data);
      this.Classes = data;
    });
  }
}

onClasseChange(classeId: number, isChecked: boolean) {
  if (isChecked) {
    if (!this.selectedClasseIds.includes(classeId)) {
      this.selectedClasseIds.push(classeId);
    }
  } else {
    const index = this.selectedClasseIds.indexOf(classeId);
    if (index > -1) {
      this.selectedClasseIds.splice(index, 1);
    }
  }

  // Mettre à jour le FormControl
  this.ConseilForm.patchValue({
    classeIds: this.selectedClasseIds
  });
}

// Méthodes pour l'import Excel
onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
  // Reset des messages
  this.importMessage = '';
  this.importSuccess = false;
  this.importError = false;
  this.progressInfo = 0;
}
onFileSelected1(event: any) {
  this.selectedFile1 = event.target.files[0];
  // Reset des messages
  this.importMessage1 = '';
  this.importSuccess1 = false;
  this.importError1 = false;
  this.progressInfo1 = 0;
}
importExcel() {
  if (!this.selectedFile) {
    this.importMessage = 'Veuillez sélectionner un fichier Excel';
    this.importError = true;
    return;
  }
  


  this.excelImportService.importExcelFile(this.selectedFile,this.conseilId).subscribe(
    (event) => {
      if (event.type === HttpEventType.UploadProgress) {
        if(!event.total)
          return;
        this.progressInfo = Math.round(100 * event.loaded / event.total);
      } else if (event instanceof HttpResponse) {
        this.importMessage = 'Import réussi ! Les données ont été enregistrées et associées au conseil.';
        this.importSuccess = true;

     
        // Afficher les données importées pour ce conseil
        this.getImportedExcelData();
      }
    },
    (err) => {
      this.progressInfo = 0;
      this.importMessage = 'Erreur lors de l\'import: ' + err.message;
      this.importError = true;
    }
  );
}


importExcelEleve() {
  if (!this.selectedFile1) {
    this.importMessage1 = 'Veuillez sélectionner un fichier Excel';
    this.importError1 = true;
    return;
  }
  


  this.excelImportService.importExcelFileEleve(this.selectedFile1,this.conseilId).subscribe(
    (event) => {
      if (event.type === HttpEventType.UploadProgress) {
        if(!event.total)
          return;
        this.progressInfo1 = Math.round(100 * event.loaded / event.total);
      } else if (event instanceof HttpResponse) {
        this.importMessage1 = 'Import réussi ! Les données ont été enregistrées et associées au conseil.';
        this.importSuccess1 = true;

     

       
      }
    },
    (err) => {
      this.progressInfo1 = 0;
      this.importMessage1 = 'Erreur lors de l\'import: ' + err.message;
      this.importError1= true;
    }
  );
}




// Récupérer les données importées pour le conseil actuel
getImportedExcelData() {

    // Si aucun conseil n'est sélectionné, récupérer toutes les données
    this.excelImportService.getImportedData().subscribe(
      (data) => {
        this.importedData = data;
        this.showImportedData = true;
        console.log('Toutes les données importées:', this.importedData);
      },
      (error) => {
        console.error('Erreur lors de la récupération des données importées:', error);
      }
    );
  }


// Basculer l'affichage des données importées
toggleImportedDataDisplay() {
  this.showImportedData = !this.showImportedData;
}

}
