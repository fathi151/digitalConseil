import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../web-socket-service.service';
import { ConseilService } from '../conseil.service';
import { Conseil } from '../conseil/Conseil';

@Component({
  selector: 'app-session-conseil',
  templateUrl: './session-conseil.component.html',
  styleUrls: ['./session-conseil.component.css']
})
export class SessionConseilComponent implements OnInit, OnDestroy {
  conseilId!: number;
  conseil?: Conseil;
  participants: string[] = [];
  currentUser: string = '';
  isConnected: boolean = false;
  private wsService?: WebSocketService;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private conseilService: ConseilService,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du conseil depuis l'URL
    this.route.params.subscribe(params => {
      this.conseilId = +params['id'];
      this.loadConseilDetails();
      this.initializeSession();
    });

    // Récupérer les informations utilisateur
    this.currentUser = sessionStorage.getItem('username') || 'Utilisateur';
  }

  private loadConseilDetails(): void {
    this.conseilService.getConseilById(this.conseilId).subscribe({
      next: (conseil) => {
        this.conseil = conseil;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du conseil:', error);
      }
    });
  }

  private async initializeSession(): Promise<void> {
    try {
      // Lazy inject WebSocket service
      if (!this.wsService) {
        this.wsService = this.injector.get(WebSocketService);
      }

      // Se connecter au WebSocket
      const connected = await this.wsService.connect();
      
      if (connected) {
        this.isConnected = true;
        this.wsService.setRoomId('seance-' + this.conseilId);

        // S'abonner aux mises à jour des participants
        this.wsService.onRoomUpdate((participants) => {
          console.log('✅ Participants reçus:', participants);
          this.participants = participants;
        });

        // Rejoindre la session
        setTimeout(() => {
          this.wsService!.join(this.currentUser);
          console.log('🚀 Utilisateur rejoint la session:', this.conseilId);
        }, 100);

      } else {
        console.warn('WebSocket non disponible, mode simulation activé');
        this.simulateParticipants();
      }
    } catch (error) {
      console.error('Erreur WebSocket:', error);
      this.simulateParticipants();
    }
  }

  private simulateParticipants(): void {
    // Simulation pour les tests
    const fakeParticipants = [
      this.currentUser,
      'Prof. Martin',
      'Dr. Dubois',
      'M. Lefebvre',
      'Mme. Rousseau'
    ];

    setTimeout(() => {
      this.participants = [this.currentUser];
    }, 500);

    setTimeout(() => {
      this.participants = [this.currentUser, 'Prof. Martin'];
    }, 1500);

    setTimeout(() => {
      this.participants = fakeParticipants;
    }, 3000);
  }

  quitterSession(): void {
    if (this.wsService && this.isConnected) {
      this.wsService.leave(this.currentUser);
    }
    this.router.navigate(['/enseignant-conseil']);
  }

  ngOnDestroy(): void {
    if (this.wsService && this.isConnected) {
      this.wsService.leave(this.currentUser);
      this.wsService.disconnect();
    }
  }
}
