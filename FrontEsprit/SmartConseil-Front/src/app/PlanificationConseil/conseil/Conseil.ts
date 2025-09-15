import { Option } from "../option/Option"
import { Salle } from "../salle/Salle"
import { ConseilUtilisateur } from "./ConseilUtilisateur"

export class Conseil {


id!:number
date!:Date
duree!:string
    heure!: string
    option!:Option

description!:string
salle!:Salle|null
classes!:string

presidentId!:number
raporteurId!:number
etat!:boolean

  conseilUtilisateurs!: ConseilUtilisateur[] 
    deroulement!: string;
    token!: string;


}