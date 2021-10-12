import { User } from "discord.js";
import { Player } from "./Player";

export enum Side {
  Blue = "Blue",
  Red = "Red",
}

export interface IGame {
  players: Player[];
  isRunning: boolean;
  waitingForDM: boolean;
  maxImpostorCount: number;
  intervalArray: any[];
  side: Side;
}

export const CanardOrders: string[] = [
  "Dans les 30 secondes, utilise tout ton kit de sorts! (sauf les sorts d'invocateurs)",
  "Dans les 30 secondes, utilise ton deuxième summoner spell!",
  "Dans les 30 secondes, utilise ton premier summoner spell!",
  "Casse deux plantes de la jungle maintenant!",
  "Pousse ta team à faire un objectif!",
  "Vole 10 sbires à un de tes alliés",
  "Dive dès que possible!",
  "Back maintenant!",
];

export const ExplorateurOrders: string[] = [
  "Tête la première, vérifie le contenu de 5 hautes herbes du côté ennemi (sans vision)",
  "Rends toi dans l'alcolve de la botlane!",
  "Rends toi dans l'alcolve de la toplane!",
  "Dis bonjour au Baron/Heraut!",
  "Dis bonjour au Dragon!",
  "Va visiter le blue ennemi!",
  "Va visiter le red ennemi!",
  "Visite la base ennemi!",
];

export class Game implements IGame {
  constructor(
    public players: Player[],
    public isRunning: boolean,
    public waitingForDM: boolean,
    public maxImpostorCount: number,
    public intervalArray: any[],
    public side: Side
  ) {
    this.players = players;
    this.isRunning = isRunning;
    this.waitingForDM = waitingForDM;
    this.maxImpostorCount = maxImpostorCount;
    this.intervalArray = intervalArray;
    this.side = side;
  }

  default() {
    this.players = [];
    this.isRunning = false;
    this.waitingForDM = false;
    this.maxImpostorCount = 2;
    this.intervalArray = [];
  }

  setRunning(bool: boolean) {
    this.isRunning = bool;
  }

  setWaitingForDM(bool: boolean) {
    this.waitingForDM = bool;
  }

  addInterval(interval: any) {
    this.intervalArray.push(interval);
  }

  clearIntervals() {
    this.intervalArray.forEach((x) => {
      clearInterval(x);
    });
    this.intervalArray = [];
  }
}
