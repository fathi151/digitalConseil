import { Utilisateur } from "src/app/utilisateur/Utilisateur";

export class ConseilDTO {

    id!: number;
  date!: Date;
    heure!: string;

  duree!: string;
  description!: string;

  optionId!: number;
  classeIds!: number[];
  salleId!: number;
  presidentId!:number
raporteurId!:number
  etat!: boolean;
  deroulement!: string;
}
