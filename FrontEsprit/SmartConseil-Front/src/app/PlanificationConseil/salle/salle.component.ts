import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConseilService } from '../conseil.service';
import { Salle } from './Salle';
import { Router } from '@angular/router';
import { elementAt } from 'rxjs';

@Component({
  selector: 'app-salle',
  templateUrl: './salle.component.html',
  styleUrls: ['./salle.component.css']
})
export class SalleComponent implements OnInit {
constructor(private formBuilder: FormBuilder,HttpClient:HttpClientModule,private conseilService:ConseilService,private router: Router ) { }

SalleForm!:FormGroup;
Salles:Salle[]=[]
capacites: number[] = Array.from({ length: 40 }, (_, i) => i + 1);


ngOnInit(): void {
  this.GetAllSalle();
  
this.SalleForm=new FormGroup({ 
nomSalle:new FormControl('',Validators.required),
capacite:new FormControl('',Validators.required),
etage:new FormControl('',Validators.required),
equipement:new FormControl('',Validators.required),
description:new FormControl('',Validators.required),
etat:new FormControl(true,Validators.required)
})



}

GetAllSalle(){
this.conseilService.getSalles().subscribe(data=>{
  console.log(data);
  
  this.Salles=data;})
}


onSubmit() {
  if (this.SalleForm.invalid) {
    this.SalleForm.markAllAsTouched();
    return;
  }

  this.SalleForm.value.etat=false
  this.conseilService.addSalle(this.SalleForm.value).subscribe(data => {
    console.log(data);
    alert('✅ Salle ajoutée avec succès !');
    this.GetAllSalle();
    this.SalleForm.reset();
    this.router.navigate(['/conseil']); 
  });
}


}
