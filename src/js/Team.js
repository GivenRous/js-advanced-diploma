import { generateTeam } from "./generators";
import { AddFunctions } from "./utils";
import Bowman from "./Characters/Bowman";
import Magician from "./Characters/Magician";
import Swordsman from "./Characters/Swordsman";
import Daemon from "./Characters/Daemon";
import Undead from "./Characters/Undead";
import Vampire from "./Characters/Vampire";

export default class Team {
  constructor() {
    this.characters = null;
  }

  #allowedTypesPlayerStart = [Bowman, Swordsman];
  #allowedTypesPlayer = [Bowman, Swordsman, Magician];
  #allowedTypesPlayerComp = [Daemon, Undead, Vampire];

  playerStartTeam() {
    this.characters = generateTeam(this.#allowedTypesPlayerStart, 1, 1, 2);
  }

  loadGameTeam(team) {
    this.characters = [];
    team.forEach((item) => {
      const className = item.type[0].toUpperCase() + item.type.slice(1);
      const char = this.createClass(className, item.level);

      char.attack = item.attack;
      char.defence = item.defence;
      char.health = item.health;

      this.characters.push(char);
    });
  }

  createClass(name, level) {
    switch (name) {
      case "Bowman":
        return new Bowman(level);
      case "Swordsman":
        return new Swordsman(level);
      case "Magician":
        return new Magician(level);
      case "Daemon":
        return new Daemon(level);
      case "Undead":
        return new Undead(level);
      case "Vampire":
        return new Vampire(level);
    }
    return false;
  }

  compStartTeam() {
    this.characters = generateTeam(this.#allowedTypesPlayerComp, 1, 1, 2);
  }

  playerUpdateTeam(level, numberOfCharacters) {
    let minLevelNewCharacters = 1;
    let countNewCharacters = 0;
    let maxLevelNewCharacters = 0;

    if (level === 2) {
      countNewCharacters = 1;
      maxLevelNewCharacters = 1;
    }
    if (level === 3) {
      countNewCharacters = 1;
      maxLevelNewCharacters = 1;
    }
    if (level === 4) {
      countNewCharacters = 1;
      maxLevelNewCharacters = 1;
    }
    if (level > 4) {
      minLevelNewCharacters = 1;

      if (numberOfCharacters === 6) {
        countNewCharacters = 1;
      }
      if (numberOfCharacters <= 5) {
        countNewCharacters = 1;
      }
      if (numberOfCharacters > 6) {
        return false;
      }
      maxLevelNewCharacters = level;
    }

    const newCharasters = generateTeam(
      this.#allowedTypesPlayer,
      minLevelNewCharacters,
      maxLevelNewCharacters,
      countNewCharacters
    );

    newCharasters.forEach((item) => {
      this.updatesCharacteristics(item);
      this.characters.push(item);
    });

    return this.characters;
  }

  compUpdateTeam(level, count) {
    let minCharLevel = 1;
    this.characters = generateTeam(
      this.#allowedTypesPlayerComp,
      minCharLevel,
      level,
      count
    );
  }

  updatesCharacteristics(character) {
    if (character.level > 1) {
      for (let i = 1; i < character.level; i += 1) {
        AddFunctions.levelUpAttackDefence(character);
      }
    }
  }
}
