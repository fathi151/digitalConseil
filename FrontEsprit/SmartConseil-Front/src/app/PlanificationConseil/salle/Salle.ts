import { Conseil } from "../conseil/Conseil";

export class Salle {
    id!: number;
    nomSalle!: string;
    etage!: number;
    capacite!: number;
    equipement!: string;
    description!: string;
    conseils!: Conseil[];

  }