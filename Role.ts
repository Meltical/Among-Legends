export enum Types {
  Impostor = "Impostor",
  Crewmate = "Crewmate",
}

interface IRole {
  type: Types;
  name: string;
  description: string;
  weight: number;
}

export class Role {
  static readonly Canard = new Role("Canard", {
    type: Types.Crewmate,
    name: "Canard",
    description:
      "Toutes les 5 minutes, suivre les ordres reçus par messages privés.",
    weight: 0.1,
  });
  static readonly Taupe = new Role("Taupe", {
    type: Types.Crewmate,
    name: "Taupe",
    description:
      "A la fin de la partie, avoir moins de participation (kills + assists) que tous les autres joueurs",
    weight: 0.15,
  });
  static readonly Faussaire = new Role("Faussaire", {
    type: Types.Crewmate,
    name: "Faussaire",
    description:
      "A la fin de la partie, avoir plus de dégats et moins de morts que tous les autres joueurs",
    weight: 0.2,
  });
  static readonly Fermier = new Role("Fermier", {
    type: Types.Crewmate,
    name: "Fermier",
    description:
      "A la fin de la partie, avoir tué plus de sbires  que tous les autres joueurs (si support: ce nombre est multiplié par 2)",
    weight: 0.15,
  });
  static readonly Inter = new Role("Inter", {
    type: Types.Crewmate,
    name: "Inter",
    description:
      "A la fin de la partie, être mort plus de fois que tous les autres joueurs",
    weight: 0.075,
  });
  static readonly Explorateur = new Role("Explorateur", {
    type: Types.Crewmate,
    name: "Explorateur",
    description:
      "Toutes les 5 minutes, se rendre à la destination indiquée par message privé toutes les 5 minutes en restant vivant",
    weight: 0.1,
  });
  static readonly Fanatic = new Role("Fanatic", {
    type: Types.Crewmate,
    name: "Fanatic",
    description:
      "Rester uniquement sur ta lane pendant les 15 premières minutes de jeu (si jungler: interdiction de gank durant ce temps)",
    weight: 0.15,
  });
  static readonly Berserker = new Role("Berserker", {
    type: Types.Crewmate,
    name: "Berserker",
    description:
      "En cas de dégats reçus de la part d'un ennemi, combattre jusqu'à la mort",
    weight: 0.075,
  });
  static readonly Imposteur = new Role("Imposteur", {
    type: Types.Impostor,
    name: "Imposteur",
    description: "Perdre la game, sans te faire repérer!",
    weight: 1,
  });

  private constructor(
    private readonly key: string,
    public readonly value: IRole
  ) {}

  toString() {
    return this.value.name;
  }

  toDetailedString(): string {
    return this.value.name + " - " + this.value.description;
  }

  toCardString() {
    return (
      "Tu es " + this.value.name + "\nTon objectif: " + this.value.description
    );
  }
}
