import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, type = 'swordsman') {
    super(level, type);
    if (type !== 'swordsman') {
      throw new Error('Некорректный тип персонажа');
    } else {
      this.type = type;
    }
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
  }
}
