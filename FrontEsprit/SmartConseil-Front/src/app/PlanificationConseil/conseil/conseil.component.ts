import { Component, OnInit } from '@angular/core';
import { Conseil } from './Conseil';
import { Router } from '@angular/router';
import { ConseilService } from '../conseil.service';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { Utilisateur } from 'src/app/utilisateur/Utilisateur';

@Component({
  selector: 'app-conseil',
  templateUrl: './conseil.component.html',
  styleUrls: ['./conseil.component.css']
})
export class ConseilComponent implements OnInit {
constructor(private formBuilder: FormBuilder,HttpClient:HttpClientModule,private conseilService:ConseilService,private router: Router ) { }
  conseils:Conseil[]=[] ;
   joursSemaine: { label: string, date: Date }[] = [];
  selectedDate!: Date;
  conseilsFiltres: Conseil[] = [];

  // Calendar popup properties
  showCalendarModal: boolean = false;
  currentCalendarDate: Date = new Date();
  calendarDays: any[] = [];
  calendarMonths: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Participants assignment popup properties
  showParticipantsModal: boolean = false;

  conseilParticipants: { [conseilId: number]: number[] } = {};

  // Participants display modal properties
  showParticipantsDisplayModal: boolean = false;
  selectedConseilForParticipants: any = null;

users:Utilisateur[]=[];




  ngOnInit(): void {
    this.genererSemaine(new Date()); // semaine actuelle
    this.selectedDate = this.joursSemaine[0].date;
    this.filtrerConseils();

    this.GetAllConseil();
    this.GetALLUtilisateur();
    this.getEnseigants();
  }
getNomUtilisateur(id: number): string {
  const user = this.users.find(u => u.id === id);
  return user ? user.username : 'Inconnu';
}

  GetALLUtilisateur(){
    

this.conseilService.getUsers().subscribe(data=>{
  console.log(data);
  
  this.users=data;});
  }

DeleteConseil(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce conseil ?')) {
    this.conseilService.DeleteConseil(id).subscribe(() => {

      this.conseils = this.conseils.filter(c => c.id !== id);

    });
  }
}

modifierConseil(id: number) {
  this.router.navigate(['/modifierConseil', id]);
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

  // Appelée lorsqu’on clique sur un jour
  onSelectDate(date: Date) {
    this.selectedDate = date;
    this.filtrerConseils();
  }

filtrerConseils() {
  this.conseilsFiltres = this.conseils.filter(conseil => {
    const d1 = new Date(conseil.date);
    const d2 = this.selectedDate;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  });
}// Exemple dans ton component
transformerHeure(conseil: Conseil): Date | null {
  if (conseil.heure) {
    return new Date(conseil.heure);
  }
  return null;
}


GetAllConseil() {
  this.conseilService.getConseil().subscribe(data => {
    this.conseils = data;

    this.conseilParticipants = {};
    this.conseils.forEach(conseil => {
      // Use 'participants' property to match backend entity
      if ((conseil as any).participants && Array.isArray((conseil as any).participants)) {
        this.conseilParticipants[conseil.id] = [...(conseil as any).participants.map((cu: any) => cu.utilisateurId)];
      } else {
        this.conseilParticipants[conseil.id] = [];
      }
    });

    this.generateCalendar();
  }, error => {
    console.error('Error loading conseils:', error);
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
  getEnseigants():Utilisateur[] {
return this.users.filter(user => user.role === 'enseignant');
}


Etatchnage(id: number, etat: boolean) {
  this.conseilService.updateEtatConseil(id, etat).subscribe({
    next: () => {
      const conseil = this.conseils.find(c => c.id === id);
      if (conseil) {
        conseil.etat = etat; // ✅ mise à jour locale
      }
    },
    error: (error) => {
      console.error("Erreur mise à jour état :", error);
    }
  });
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

  // Participants assignment methods
  openParticipantsModal() {
    this.showParticipantsModal = true;

    // Initialize participants for each conseil if not already done
    this.conseils.forEach(conseil => {
      if (!this.conseilParticipants[conseil.id]) {
        this.conseilParticipants[conseil.id] = [];
      }
    });
  }

  closeParticipantsModal() {
    this.showParticipantsModal = false;
  }

  isUserAssignedToConseil(conseilId: number, userId: number): boolean {
    return this.conseilParticipants[conseilId]?.includes(userId) || false;
  }

  toggleUserAssignment(conseilId: number, userId: number) {
    if (!this.conseilParticipants[conseilId]) {
      this.conseilParticipants[conseilId] = [];
    }

    const index = this.conseilParticipants[conseilId].indexOf(userId);
    if (index > -1) {
      // Remove user from conseil
      this.conseilParticipants[conseilId].splice(index, 1);
    } else {
      // Add user to conseil
      this.conseilParticipants[conseilId].push(userId);
    }
  }

  getAssignedUsersForConseil(conseilId: number): any[] {
    const assignedUserIds = this.conseilParticipants[conseilId] || [];
    return this.getEnseigants().filter(user => assignedUserIds.includes(user.id));
  }

  getAssignedUsersCount(conseilId: number): number {
    return this.conseilParticipants[conseilId]?.length || 0;
  }


  getConseilNumberParticipant(conseil: Conseil): number {
    return this.conseilParticipants[conseil.id]?.length || 0;
  }






  saveParticipantsAssignments() {
  const updates = Object.entries(this.conseilParticipants).map(([conseilIdStr, userIds]) => {
    const conseilId = parseInt(conseilIdStr);
    const conseil = this.conseils.find(c => c.id === conseilId);

    if (!conseil) return Promise.resolve();

    const conseilUtilisateurs = userIds.map(userId => ({
      id: 0,
      utilisateurId: userId,
      message: "Veuillez confirmer votre présence.",
      confirme: false
    }));





    return this.conseilService.assignerUtilisateursAuConseil(conseilId, conseilUtilisateurs).toPromise();
  });

  Promise.all(updates)
    .then((responses) => {
      console.log('✅ Backend responses:', responses);
      alert('✅ Assignations enregistrées et mails envoyés avec succès !');
      this.closeParticipantsModal();

      // Wait a moment before reloading to ensure backend has processed
      setTimeout(() => {
        console.log('🔄 Reloading data...');
        this.GetAllConseil();
      }, 1000);
    })
    .catch(error => {
      console.error('❌ Erreur lors de l’envoi :', error);
      alert('Erreur lors de l’envoi des assignations ou des mails.');
    });
}



  clearAllAssignments() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les assignations?')) {
      this.conseilParticipants = {};
      this.conseils.forEach(conseil => {
        this.conseilParticipants[conseil.id] = [];
      });
    }
  }

  // Participants display modal methods
  openParticipantsDisplayModal(conseil: any) {
    this.selectedConseilForParticipants = conseil;
    this.showParticipantsDisplayModal = true;
  }

  closeParticipantsDisplayModal() {
    this.showParticipantsDisplayModal = false;
    this.selectedConseilForParticipants = null;
  }

  // Get participant status
  getParticipantStatus(participant: any): string {
    if (participant.message === 'accepted') {
      return 'accepted';
    } else if (participant.message === 'rejected') {
      return 'rejected';
    } else {
      return 'pending';
    }
  }

  // Get status text
  getStatusText(status: string): string {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'pending': return 'En attente';
      default: return 'En attente';
    }
  }

  // Get participants of selected conseil
  getSelectedConseilParticipants(): any[] {
    return (this.selectedConseilForParticipants as any)?.participants || [];
  }

  // Check if there are participants
  hasParticipants(): boolean {
    const participants = this.getSelectedConseilParticipants();
    return participants && participants.length > 0;
  }

}
