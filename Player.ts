import { User } from "discord.js";
import { Side } from "./Game";
import { Role } from "./Role";

export interface IPlayer {
  user: User;
  role?: Role;
  vote?: Player | string;
  score: number;
  ordersHistory: string[];
}

export class Player implements IPlayer {
  constructor(
    public user: User,
    public score: number,
    public ordersHistory: string[],
    public side: Side,
    public role?: Role,
    public vote?: Player | string
  ) {
    this.user = user;
    this.score = score;
    this.ordersHistory = ordersHistory;
    this.side = side;
    this.role = role;
    this.vote = vote;
  }

  toScore(i: number, withSide: boolean) {
    return withSide
      ? i + ") " + this.side + " - " + this.user.username + " - " + this.score
      : i + ") " + this.user.username + " - " + this.score;
  }

  clearScore() {
    this.score = 0;
  }

  addScore(nbr: number) {
    this.score += nbr;
  }

  setVote(user: Player | string) {
    this.vote = user;
  }

  toRoleReveal() {
    var str = this.user.username + ": " + this.role?.toDetailedString() + "\n";
    this.ordersHistory.forEach((x) => (str += "\t- " + x + "\n"));
    return str;
  }

  reset() {
    this.ordersHistory = [];
    this.role = undefined;
    this.vote = undefined;
  }
}
