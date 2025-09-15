import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConseilDTO } from './conseil/ConseilDTO';
import { Cons, Observable } from 'rxjs';
import { Utilisateur } from '../utilisateur/Utilisateur';
import { Salle } from './salle/Salle';
import { Conseil } from './conseil/Conseil';
import { ConseilUtilisateur } from './conseil/ConseilUtilisateur';
import { Option } from './option/Option';
import { Classe } from './classe/Classe';

@Injectable({
  providedIn: 'root'
})
export class ConseilService {
private baseURL="http://localhost:8090/conseils";
private baseURL1="http://localhost:8088/auth";
  constructor(private http:HttpClient) { }

  addConseil(conseil: ConseilDTO): Observable<ConseilDTO> {
    return this.http.post<ConseilDTO>(`${this.baseURL}/ajouterConseil`,conseil);
  }

getUsers(): Observable<Utilisateur[]> {




  return this.http.get<Utilisateur[]>(`${this.baseURL1}/allUsers`);
}
assignerUtilisateursAuConseil(conseilId: number, conseilUtilisateurs: ConseilUtilisateur[]): Observable<any> {
  const url = `${this.baseURL}/assignerUtilisateurs/${conseilId}`;
  return this.http.put(url, conseilUtilisateurs);
}

  addSalle(salle: Salle): Observable<Salle> {
    return this.http.post<Salle>(`${this.baseURL}/addSalle`,salle);
  }

    getSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.baseURL}/getSalle`);
  }
     getConseil(): Observable<Conseil[]> {
    return this.http.get<Conseil[]>(`${this.baseURL}/getConseil`);
  }

  // Temporary method to get participants for a specific conseil
  getConseilParticipants(UtilisateurId: number): Observable<ConseilUtilisateur[]> {
    return this.http.get<ConseilUtilisateur[]>(`${this.baseURL}/getConseilById/${UtilisateurId}`);
  }

  getConseilById(id: number): Observable<Conseil> {
    return this.http.get<Conseil>(`${this.baseURL}/getConseil/${id}`);
  }



  DeleteConseil(id: number): Observable<any> {
  return this.http.delete(`${this.baseURL}/deleteConseil/${id}`);
  }
updateConseil(conseil: Conseil): Observable<Conseil> {
  return this.http.put<Conseil>(`${this.baseURL}/updateConseil`, conseil);
}

updateEtatConseil(id: number, etat: boolean): Observable<any> {
  return this.http.put(`http://localhost:8090/conseils/updateEtatConseil/${id}`, etat, {
    headers: { 'Content-Type': 'application/json' }
  });
}


  EnvoyerMail(conseil: Conseil): Observable<Conseil> {
    return this.http.post<Conseil>(`${this.baseURL}/EnvoyerMail`,conseil);
  }

updateMessage(conseilId: number, utilisateurId: number, message: string, justification: string): Observable<any> {
  const url = `${this.baseURL}/updateMessage/${conseilId}/${utilisateurId}`;
  const body = {
    message: message,
    justification: justification
  };

  return this.http.put(url, body, {
    headers: { 'Content-Type': 'application/json' }
  });
}

updateDeroulement(conseilId: number, message: string): Observable<any> {
  const url = `${this.baseURL}/updateDeroulement/${conseilId}`;

  return this.http.put(url, message, {
    headers: { 'Content-Type': 'text/plain' }  // important : type texte
  });
}
// Méthodes pour les options et classes
getOptions(): Observable<Option[]> {
  return this.http.get<Option[]>(`${this.baseURL}/options`);
}

getClassesByOption(optionId: number): Observable<Classe[]> {
  return this.http.get<Classe[]>(`${this.baseURL}/classes/option/${optionId}`);
}

addOption(option: Option): Observable<Option> {
  return this.http.post<Option>(`${this.baseURL}/options`, option);
}

addClasse(classe: Classe): Observable<Classe> {
  return this.http.post<Classe>(`${this.baseURL}/classes`, classe);
}

// Méthode pour importer des données Excel
importExcelData(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.baseURL}/importExcel`, formData);
}

}
