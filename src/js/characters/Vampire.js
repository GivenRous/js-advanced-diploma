import Character from '../Character';

export default class Vampire extends Character {
  constructor(level, type = 'vampire') {
    super(level);
    if (type !== 'vampire') {
      throw new Error('Некорректный тип персонажа');
    } else {
      this.type = type;
    }
    this.attack = 25;
    this.defence = 25;
    this.attackDistance = 2;
    this.moveDistance = 2;
  }
}
