import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Conseil } from '../PlanificationConseil/conseil/Conseil';
import { Utilisateur } from '../utilisateur/Utilisateur';
import { ConseilService } from '../PlanificationConseil/conseil.service';
import * as XLSX from 'xlsx';
import { ExcelImportService } from '../PlanificationConseil/excel-import/excel-import.service';

@Component({
  selector: 'app-rappoteur-conseils',
  templateUrl: './rappoteur-conseils.component.html',
  styleUrls: ['./rappoteur-conseils.component.css']
})
export class RappoteurConseilsComponent {
  conseils: Conseil[] = [];
  users: Utilisateur[] = [];
  token: string | null = null;
  nom: string | null = null;
  id: string | null = null;
  role: string | null = null;
     joursSemaine: { label: string, date: Date }[] = [];
  selectedDate!: Date;
  conseilsFiltres: Conseil[] = [];


  userAcceptanceStatus: { [conseilId: number]: 'accepted' | 'rejected' | 'pending' } = {};

  // Pour la justification du rejet
  showJustificationInput: { [conseilId: number]: boolean } = {};
  justificationText: { [conseilId: number]: string } = {};

  // Gestion de l'état des séances
  conseilStatus: { [conseilId: number]: 'pas-debute' | 'en-cours' | 'termine' } = {};

  // Liste des participants en ligne pour chaque session
  participantsEnLigne: { [conseilId: number]: string[] } = {};

  showCalendarModal: boolean = false;
  currentCalendarDate: Date = new Date();
  calendarDays: any[] = [];
  calendarMonths: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  conseilsFiler!: Conseil[];



  constructor(
    private conseilService: ConseilService,
    private injector: Injector,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.token = sessionStorage.getItem('token');
    this.nom = sessionStorage.getItem('username');
    this.id = sessionStorage.getItem('id');
    this.role = sessionStorage.getItem('role');

    console.log("Token:", this.token);
    console.log("Nom:", this.nom);
    console.log("ID:", this.id);
    console.log("Rôle:", this.role);

    this.getConseilsByUtilisateurId();
    this.GetALLUtilisateur();
    this.genererSemaine(new Date());



  }

getConseilsByUtilisateurId(): void {
  const utilisateurId = Number(this.id);
  console.log("ID utilisateur courant :", utilisateurId);

  this.conseilService.getConseil().subscribe((allConseils: Conseil[]) => {
    console.log("Tous les conseils reçus du backend :", allConseils);

    allConseils.forEach(c => {
      console.log(`Conseil ${c.id} => utilisateurs :`, c.raporteurId);
    });

  this.conseils = allConseils.filter(conseil => {

    return conseil.raporteurId === Number(this.id);
});
this.conseilsFiler = this.conseils.filter(conseil => conseil.etat === true);



  });
}


  genererSemaine(date: Date) {
    const debutSemaine = new Date(date);
    debutSemaine.setDate(date.getDate() - date.getDay() + 1); // lundi

    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    this.joursSemaine = [];

    for (let i = 0; i < 7; i++) {
      const jour = new Date(debutSemaine);
      jour.setDate(debutSemaine.getDate() + i);
      this.joursSemaine.push({ label: labels[i], date: jour });
    }
  }

  onSelectDate(date: Date) {
    this.selectedDate = date;
    this.filtrerConseils();
  }



filtrerConseils() {
  this.conseilsFiltres = this.conseils.filter(conseil => {
    const d1 = new Date(conseil.date);
    const d2 = this.selectedDate;
    return (
      conseil.etat === true &&
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  });
}
transformerHeure(conseil: Conseil): Date | null {
  if (conseil.heure) {
    return new Date(conseil.heure);
  }
  return null;
}
getNomUtilisateur(id: number): string {
  const user = this.users.find(u => u.id === id);
  return user ? user.username : 'Inconnu';
}


GetALLUtilisateur() {
  this.conseilService.getUsers().subscribe(data => {
    console.log(data);
    this.users = data;
  });
}

// Calendar popup methods
openCalendarModal() {
  this.showCalendarModal = true;
  this.generateCalendar();
}

closeCalendarModal() {
  this.showCalendarModal = false;
}

generateCalendar() {
  const year = this.currentCalendarDate.getFullYear();
  const month = this.currentCalendarDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
  startDate.setDate(firstDay.getDate() - daysToSubtract);

  this.calendarDays = [];
  const currentDate = new Date(startDate);

  // Generate 6 weeks (42 days) to fill the calendar grid
  for (let i = 0; i < 42; i++) {
    const dayInfo = {
      date: new Date(currentDate),
      day: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: this.isToday(currentDate),
      conseils: this.getConseilsForDate(currentDate)
    };

    this.calendarDays.push(dayInfo);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

getConseilsForDate(date: Date): Conseil[] {
  return this.conseils.filter(conseil => {
    const conseilDate = new Date(conseil.date);
    return conseilDate.getDate() === date.getDate() &&
           conseilDate.getMonth() === date.getMonth() &&
           conseilDate.getFullYear() === date.getFullYear();
  });
}

previousMonth() {
  this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
  this.generateCalendar();
}

nextMonth() {
  this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
  this.generateCalendar();
}

selectCalendarDate(dayInfo: any) {
  if (dayInfo.isCurrentMonth) {
    this.selectedDate = new Date(dayInfo.date);
    this.filtrerConseils();
    this.closeCalendarModal();
  }
}

goToToday() {
  this.currentCalendarDate = new Date();
  this.generateCalendar();
}

// Methods for accepting/rejecting conseils - Allow toggling
accepterConseil(conseilId: number) {
  console.log('Accepter conseil avec ID:', conseilId);

  const currentStatus = this.getAcceptanceStatus(conseilId);

  // If already accepted, toggle back to pending, otherwise accept
  if (currentStatus === 'accepted') {
    this.userAcceptanceStatus[conseilId] = 'pending';
    this.conseilService.updateMessage(conseilId, Number(this.id), 'pending', '').subscribe({
      next: (response) => {
        console.log('Status updated to pending:', response);
        alert('Réponse annulée - En attente de votre décision');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  } else {
    this.userAcceptanceStatus[conseilId] = 'accepted';
    this.conseilService.updateMessage(conseilId, Number(this.id), 'accepted', '').subscribe({
      next: (response) => {
        console.log('Status updated to accepted:', response);
        alert('Conseil accepté!');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  // TODO: Implement API call to update the conseil status
  // this.conseilService.updateAcceptanceStatus(conseilId, this.userAcceptanceStatus[conseilId]).subscribe(...)
}

rejeterConseil(conseilId: number) {
  console.log('Rejeter conseil avec ID:', conseilId);

  const currentStatus = this.getAcceptanceStatus(conseilId);

  // If already rejected, toggle back to pending, otherwise show justification input
  if (currentStatus === 'rejected') {
    this.userAcceptanceStatus[conseilId] = 'pending';
    this.showJustificationInput[conseilId] = false;
    this.justificationText[conseilId] = '';
    this.conseilService.updateMessage(conseilId,Number(this.id),'pending','').subscribe();
    alert('Réponse annulée - En attente de votre décision');
  } else {
    // Show justification input instead of immediately rejecting
    this.showJustificationInput[conseilId] = true;
  }
}

// Soumettre le rejet avec justification
submitRejectionWithJustification(conseilId: number) {
  const justification = this.justificationText[conseilId] || '';

  if (justification.trim() === '') {
    alert('Veuillez saisir une justification pour le rejet');
    return;
  }

  this.userAcceptanceStatus[conseilId] = 'rejected';
  this.conseilService.updateMessage(conseilId, Number(this.id), 'rejected', justification).subscribe({
    next: (response) => {
      console.log('Rejet envoyé avec justification:', response);
      this.showJustificationInput[conseilId] = false;
      alert('Conseil rejeté avec justification!');
    },
    error: (error) => {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors de l\'envoi du rejet');
    }
  });
}

// Annuler la saisie de justification
cancelJustification(conseilId: number) {
  this.showJustificationInput[conseilId] = false;
  this.justificationText[conseilId] = '';
}

getAcceptanceStatus(conseilId: number): 'accepted' | 'rejected' | 'pending' {
  return this.userAcceptanceStatus[conseilId] || 'pending';
}

hasUserResponded(conseilId: number): boolean {
  const status = this.getAcceptanceStatus(conseilId);
  return status === 'accepted' || status === 'rejected';
}


demarrerConseil(conseilId: number) {
  if (confirm('Êtes-vous sûr de vouloir démarrer cette séance de conseil ?')) {
    this.conseilStatus[conseilId] = 'en-cours';

    alert('Séance démarrée avec succès !');
  }
}

rejoindreSeance(conseilId: number) {
  console.log(`🚀 Navigation vers la session ${conseilId}`);

  
  this.router.navigate(['/session-conseil', conseilId]);
}





getConseilStatus(conseilId: number): 'pas-debute' | 'en-cours' | 'termine' {
  return this.conseilStatus[conseilId] || 'pas-debute';
}


getStatusText(status: string): string {
  switch (status) {
    case 'pas-debute': return 'Pas débuté';
    case 'en-cours': return 'En cours';
    case 'termine': return 'Terminé';
    default: return 'Pas débuté';
  }
}


getStatusColor(status: string): string {
  switch (status) {
    case 'pas-debute': return '#6b7280'; // Gris
    case 'en-cours': return '#6b7280'; // Gris (comme pas débuté)
    case 'termine': return '#6b7280'; // Gris (comme pas débuté)
    default: return '#6b7280';
  }
}



/**
 * Méthode pour simuler des participants (pour les tests sans backend WebSocket)
 */
private simulateParticipants(conseilId: number, currentUser: string): void {
  console.log('🧪 Simulation des participants pour les tests');

  // Simuler quelques participants fictifs
  const fakeParticipants = [
    currentUser,
    'Prof. Martin',
    'Dr. Dubois',
    'M. Lefebvre'
  ];

  // Ajouter les participants avec un délai pour simuler l'arrivée progressive
  setTimeout(() => {
    this.participantsEnLigne[conseilId] = [currentUser];
    console.log('👤 Premier participant ajouté:', currentUser);
  }, 500);

  setTimeout(() => {
    this.participantsEnLigne[conseilId] = [currentUser, 'Prof. Martin'];
    console.log('👥 Deuxième participant ajouté');
  }, 1500);

  setTimeout(() => {
    this.participantsEnLigne[conseilId] = fakeParticipants;
    console.log('👥👥 Tous les participants simulés ajoutés:', fakeParticipants);
  }, 3000);
}

/**
 * Méthode pour obtenir le nombre de participants connectés
 */
getParticipantsCount(conseilId: number): number {
  return this.participantsEnLigne[conseilId]?.length || 0;
}

// Add this method to export eleve data for a conseil to Excel
exportExcelForConseil(conseilId: number) {

  const excelImportService = this.injector.get(ExcelImportService);
  excelImportService.getExcelDataEleveByConseilId(conseilId).subscribe((eleves: any[]) => {
    if (!eleves || eleves.length === 0) {
      alert('Aucune donnée élève à exporter pour ce conseil.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(eleves);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataEleve');
    XLSX.writeFile(workbook, `data_eleve_conseil_${conseilId}.xlsx`);
  }, error => {
    alert('Erreur lors de la récupération des données élève.');
  });
}

}