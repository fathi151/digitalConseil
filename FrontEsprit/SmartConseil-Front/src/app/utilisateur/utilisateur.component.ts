import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { UtilisateurService } from './utilisateur.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Utilisateur } from './Utilisateur';
import { Subject, Observable } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-utilisateur',
    templateUrl: './utilisateur.component.html',
    styleUrls: ['./utilisateur.component.css'],
    standalone: false
})
export class UtilisateurComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('video') videoElementRef!: ElementRef<HTMLVideoElement>;
emailPasswordVerified: boolean = false;
faceVerified: boolean = false;

  methode: 'password' | 'face' = 'password';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  cameraStarted = false;
  cameraStream: MediaStream | null = null;
  showWebcam: boolean = false;  
  
  resultMessage: string = '';

  private trigger: Subject<void> = new Subject<void>();
  public triggerObservable: Observable<void> = this.trigger.asObservable();
  webcamImage: WebcamImage | null = null;
  user: Utilisateur = new Utilisateur();

  constructor(
    private userService: UtilisateurService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    localStorage.clear();
   
  }

  ngAfterViewInit(): void {
    if (this.methode === 'face') {
      this.startCamera();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['methode']) {
      const newValue = changes['methode'].currentValue;
      if (newValue === 'face') {
        this.startCamera();
      } else if (newValue === 'password') {
        this.stopCamera();
      }
    }
  }

  setMethode(type: 'password' | 'face') {
    this.methode = type;

    if (type === 'face') {
      setTimeout(() => this.startCamera(), 0);
    } else if (type === 'password') {
      this.stopCamera();
    }
  }

onLogin(): void {
  // Cas où l'identifiant est déjà validé, mais pas le face ID
  if (this.emailPasswordVerified && !this.faceVerified) {
    this.errorMessage = '✅ Identifiants valides. Veuillez valider votre Face ID.';
    return;
  }

    const loginRequest = { email: this.email, password: this.password };

    this.userService.login(loginRequest).subscribe(
      (response) => {
        // The AuthService will handle storing the user data and redirecting
        this.authService.redirectToDashboard();
      },
      (error) => {
        console.error('Erreur de connexion :', error);
        this.errorMessage = 'Nom d’utilisateur ou mot de passe incorrect';
      }
    );
  }


  startCamera(): void {
    if (this.cameraStarted || !this.videoElementRef) return;

    const video = this.videoElementRef.nativeElement;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        this.cameraStream = stream;
        this.cameraStarted = true;
      })
      .catch((error) => {
        console.error('Erreur accès caméra :', error);
        alert("Impossible d'accéder à la caméra");
      });
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
      this.cameraStarted = false;

      if (this.videoElementRef?.nativeElement) {
        this.videoElementRef.nativeElement.srcObject = null;
      }
    }
  }
triggerSnapshot(): void {
  console.log("Snapshot triggered");
  this.trigger.next();
}

handleImage(webcamImage: WebcamImage): void {
  this.webcamImage = webcamImage;
  console.log("Image captured:", webcamImage);
  const headers = {
    'Content-Type': 'application/json'
  };

  this.http.post('http://127.0.0.1:5000/verify-face', {
    image: webcamImage.imageAsDataUrl
  }, {
    headers: headers,
    withCredentials: true
  }).subscribe((res: any) => {
    this.resultMessage = res.verified ? "✅ Face Verified!" : "❌ Verification Failed";

    if (res.verified) {
      this.faceVerified = true;

      // Naviguer uniquement si email+password validés aussi
      if (this.emailPasswordVerified && this.faceVerified) {
        this.router.navigate(['/conseil']);
      }
    } else {
      this.faceVerified = false;
    }
  }, error => {
    console.error("Verification error:", error);
    this.resultMessage = "❌ Error during verification.";
  });
}

}
