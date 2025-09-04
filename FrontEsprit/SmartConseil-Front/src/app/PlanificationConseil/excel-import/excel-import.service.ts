import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExcelData } from './ExcelData';

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {
  private baseURL = "http://localhost:8090/conseils";

  constructor(private http: HttpClient) { }

  // Méthode pour importer un fichier Excel
  importExcelFile(file: File,conseilId:number): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseURL}/importExcel/${conseilId}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
    importExcelFileEleve(file: File,conseilId:number): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseURL}/importExcelEleve/${conseilId}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  // Méthode pour récupérer les données importées
  getImportedData(): Observable<ExcelData[]> {
    return this.http.get<ExcelData[]>(`${this.baseURL}/excelData`);
  }

  // Méthode pour récupérer les données élève par conseilId
  getExcelDataEleveByConseilId(conseilId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/excelDataEleve/${conseilId}`);
  }
}