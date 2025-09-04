import { Component, OnInit } from '@angular/core';
import { Conseil } from '../conseil/Conseil';
import { ConseilService } from '../conseil.service';
import { Utilisateur } from '../../utilisateur/Utilisateur';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-president-coseil',
  templateUrl: './president-coseil.component.html',
  styleUrls: ['./president-coseil.component.css']
})

export class PresidentCoseilComponent implements OnInit {
  currentUser: any = null;
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


  showJustificationInput: { [conseilId: number]: boolean } = {};
  justificationText: { [conseilId: number]: string } = {};


  conseilStatus: { [conseilId: number]: 'pas-debute' | 'en-cours' | 'termine' } = {};

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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialize current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

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
 this.conseilService.getConseil().subscribe(data=>
 {

this.conseils=data.filter(conseil=>conseil.presidentId==Number(this.id) && conseil.etat==true);

console.log(this.conseils);
this.conseils.forEach(
conseil=>
{
this.conseilStatus[conseil.id]=conseil.deroulement as any;



}


)
 }
 )
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
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(firstDay.getDate() - daysToSubtract);

  this.calendarDays = [];
  const currentDate = new Date(startDate);


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
// Méthodes pour gérer l'état des séances
demarrerConseil(conseilId: number) {
  if (confirm('Êtes-vous sûr de vouloir démarrer cette séance de conseil ?')) {
    this.conseilStatus[conseilId] = 'en-cours';
    this.conseilService.updateDeroulement(conseilId, 'en-cours').subscribe();
    alert('Séance démarrée avec succès !');
  }
}

terminerConseil(conseilId: number) {
 
    this.conseilStatus[conseilId] = 'termine';
    this.conseilService.updateDeroulement(conseilId, 'termine').subscribe();
    alert('Séance terminée avec succès !');
  
}

reprendreConseilEnCours(conseilId: number) {
  this.conseilStatus[conseilId] = 'en-cours';
   this.conseilService.updateDeroulement(conseilId, 'en-cours').subscribe();
  alert('Séance reprise !');
}

// Obtenir le statut d'un conseil
getConseilStatus(conseilId: number): 'pas-debute' | 'en-cours' | 'termine' {
  return this.conseilStatus[conseilId] || 'pas-debute';
}

// Obtenir le texte du statut
getStatusText(status: string): string {
  switch (status) {
    case 'pas-debute': return 'Pas débuté';
    case 'en-cours': return 'En cours';
    case 'termine': return 'Terminé';
    default: return 'Pas débuté';
  }
}

// Obtenir la couleur du statut
getStatusColor(status: string): string {
  switch (status) {
    case 'pas-debute': return '#6b7280';
    case 'en-cours': return '#6b7280';
    case 'termine': return '#6b7280'; 
    default: return '#6b7280';
  }
}





}
