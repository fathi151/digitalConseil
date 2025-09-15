import { Component, OnInit } from '@angular/core';

export interface CouncilSession {
  id: string;
  className: string;
  status: 'pending' | 'active' | 'closed';
  startTime?: string;
  endTime?: string;
  room?: string;
  token?: string;
}

export interface Student {
  id: string;
  name: string;
  average: number;
  subject?: string;
}

export interface SpecialCase {
  id: string;
  studentName: string;
  type: 'redemption_general' | 'redemption_subject';
  status: 'processed' | 'unprocessed';
  details?: string;
}

export interface Council {
  id: string;
  className: string;
  status: 'pending' | 'active' | 'closed';
  topStudents?: Student[];
  specialCases?: SpecialCase[];
  participants?: string[];
  startTime?: string;
  endTime?: string;
}

export interface Statistics {
  successRate: number;
  below10Percent: number;
  above15Percent: number;
  classAverage: number;
  specialCases: number;
}

export interface Vote {
  studentId: string;
  teacherId: string;
  vote: 'approve' | 'reject';
  timestamp: Date;
}

@Component({
  selector: 'app-council-management',
  templateUrl: './council-management.component.html',
  styleUrls: ['./council-management.component.css']
})
export class CouncilManagementComponent implements OnInit {
  
  // User role simulation - in real app, this would come from authentication service
  userRole: 'jury_president' | 'teacher' = 'jury_president';
  currentUserId: string = 'user123';
  
  // Current date
  currentDate: Date = new Date();
  
  // Modal states
  showTokenModal: boolean = false;
  showAbsenceModal: boolean = false;
  
  // Form data
  accessToken: string = '';
  absenceReason: string = '';
  absenceDetails: string = '';
  
  // Data arrays
  councilSessions: CouncilSession[] = [];
  councils: Council[] = [];
  votes: Vote[] = [];
  
  // Statistics
  statistics: Statistics = {
    successRate: 0,
    below10Percent: 0,
    above15Percent: 0,
    classAverage: 0,
    specialCases: 0
  };

  constructor() { }

  ngOnInit(): void {
    this.initializeData();
    this.calculateStatistics();
  }

  initializeData(): void {
    // Initialize sample council sessions
    this.councilSessions = [
      {
        id: '1',
        className: '3INFO1',
        status: 'active',
        startTime: '09:00',
        room: 'A101',
        token: 'ABC123XY'
      },
      {
        id: '2',
        className: '3INFO2',
        status: 'pending',
        room: 'A102'
      },
      {
        id: '3',
        className: '2INFO1',
        status: 'closed',
        startTime: '14:00',
        endTime: '16:00',
        room: 'B201'
      }
    ];

    // Initialize sample councils with detailed data
    this.councils = [
      {
        id: '1',
        className: '3INFO1',
        status: 'active',
        topStudents: [
          { id: 's1', name: 'Ahmed Ben Ali', average: 18.5 },
          { id: 's2', name: 'Fatma Trabelsi', average: 17.8 },
          { id: 's3', name: 'Mohamed Gharbi', average: 16.9 }
        ],
        specialCases: [
          {
            id: 'sc1',
            studentName: 'Sami Bouaziz',
            type: 'redemption_general',
            status: 'unprocessed',
            details: 'Moyenne générale: 8.2/20'
          },
          {
            id: 'sc2',
            studentName: 'Leila Mansouri',
            type: 'redemption_subject',
            status: 'processed',
            details: 'Mathématiques: 7.5/20'
          }
        ],
        startTime: '09:00'
      },
      {
        id: '2',
        className: '3INFO2',
        status: 'pending',
        topStudents: [
          { id: 's4', name: 'Youssef Karray', average: 17.2 },
          { id: 's5', name: 'Nour Hadded', average: 16.5 },
          { id: 's6', name: 'Karim Sassi', average: 15.8 }
        ],
        specialCases: [
          {
            id: 'sc3',
            studentName: 'Ines Mejri',
            type: 'redemption_general',
            status: 'unprocessed',
            details: 'Moyenne générale: 8.7/20'
          }
        ]
      },
      {
        id: '3',
        className: '2INFO1',
        status: 'closed',
        topStudents: [
          { id: 's7', name: 'Mariem Zouari', average: 19.1 },
          { id: 's8', name: 'Rami Jebali', average: 18.3 },
          { id: 's9', name: 'Salma Rekik', average: 17.6 }
        ],
        specialCases: [],
        startTime: '14:00',
        endTime: '16:00'
      }
    ];
  }

  calculateStatistics(): void {
    // Sample statistics calculation
    this.statistics = {
      successRate: 78.5,
      below10Percent: 12.3,
      above15Percent: 45.7,
      classAverage: 13.2,
      specialCases: this.councils.reduce((total, council) => 
        total + (council.specialCases?.length || 0), 0)
    };
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'En cours';
      case 'closed': return 'Fermé';
      case 'pending': return 'En attente';
      default: return status;
    }
  }

  // Modal methods
  openTokenModal(): void {
    this.showTokenModal = true;
    this.accessToken = '';
  }

  closeTokenModal(): void {
    this.showTokenModal = false;
    this.accessToken = '';
  }

  validateToken(): void {
    // Check if token matches any active session
    const activeSession = this.councilSessions.find(
      session => session.status === 'active' && session.token === this.accessToken
    );
    
    if (activeSession) {
      alert(`Accès autorisé au conseil de la classe ${activeSession.className}`);
      this.closeTokenModal();
      // Here you would typically navigate to the council interface
    } else {
      alert('Token invalide ou session non active');
    }
  }

  // Council management methods
  startCouncilSession(): void {
    // Logic to start a new council session
    console.log('Starting council session...');
  }

  startCouncilForClass(className: string): void {
    const council = this.councils.find(c => c.className === className);
    if (council) {
      council.status = 'active';
      council.startTime = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Generate token for teachers
      const token = this.generateToken();
      const session = this.councilSessions.find(s => s.className === className);
      if (session) {
        session.status = 'active';
        session.token = token;
        session.startTime = council.startTime;
      }
      
      alert(`Conseil démarré pour la classe ${className}. Token: ${token}`);
    }
  }

  closeCouncilForClass(className: string): void {
    const council = this.councils.find(c => c.className === className);
    if (council) {
      council.status = 'closed';
      council.endTime = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const session = this.councilSessions.find(s => s.className === className);
      if (session) {
        session.status = 'closed';
        session.endTime = council.endTime;
        session.token = undefined;
      }
      
      alert(`Conseil fermé pour la classe ${className}`);
    }
  }

  viewCouncilDetails(className: string): void {
    const council = this.councils.find(c => c.className === className);
    if (council) {
      // Here you would typically navigate to a detailed view
      console.log('Viewing details for:', council);
      alert(`Affichage des détails pour la classe ${className}`);
    }
  }

  generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Voting methods
  canVoteForClass(className: string): boolean {
    // Check if teacher can vote for this class (teaches a subject in this class)
    return true; // Simplified for demo
  }

  getStudentsForVoting(className: string): Student[] {
    // Return students that the current teacher can vote for
    return [
      { id: 'v1', name: 'Student A', average: 8.5, subject: 'Mathematics' },
      { id: 'v2', name: 'Student B', average: 7.8, subject: 'Physics' }
    ];
  }

  hasVoted(studentId: string): boolean {
    return this.votes.some(vote => 
      vote.studentId === studentId && vote.teacherId === this.currentUserId
    );
  }

  voteForStudent(studentId: string, vote: 'approve' | 'reject'): void {
    if (this.hasVoted(studentId)) {
      alert('Vous avez déjà voté pour cet étudiant');
      return;
    }

    this.votes.push({
      studentId,
      teacherId: this.currentUserId,
      vote,
      timestamp: new Date()
    });

    alert(`Vote enregistré: ${vote === 'approve' ? 'Approuvé' : 'Rejeté'}`);
  }

  // Absence justification methods
  justifyAbsence(className: string): void {
    this.showAbsenceModal = true;
    this.absenceReason = '';
    this.absenceDetails = '';
  }

  closeAbsenceModal(): void {
    this.showAbsenceModal = false;
    this.absenceReason = '';
    this.absenceDetails = '';
  }

  submitAbsenceJustification(): void {
    if (!this.absenceReason) {
      alert('Veuillez sélectionner un motif d\'absence');
      return;
    }

    // Here you would typically send this to a backend service
    console.log('Absence justification:', {
      reason: this.absenceReason,
      details: this.absenceDetails,
      teacherId: this.currentUserId,
      timestamp: new Date()
    });

    alert('Justification d\'absence soumise avec succès');
    this.closeAbsenceModal();
  }
}
