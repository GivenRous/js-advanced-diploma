import Bowman from '../Characters/Bowman';
import Magician from '../Characters/Magician';
import Swordsman from '../Characters/Swordsman';
import Daemon from '../Characters/Daemon';
import Undead from '../Characters/Undead';
import Vampire from '../Characters/Vampire';

test.each([
  [Bowman, '\u{1F396} 1 \u{2694} 25 \u{1F6E1} 25 \u{2764} 50'],
  [Magician, '\u{1F396} 1 \u{2694} 10 \u{1F6E1} 40 \u{2764} 50'],
  [Swordsman, '\u{1F396} 1 \u{2694} 40 \u{1F6E1} 10 \u{2764} 50'],
  [Daemon, '\u{1F396} 1 \u{2694} 10 \u{1F6E1} 10 \u{2764} 50'],
  [Undead, '\u{1F396} 1 \u{2694} 40 \u{1F6E1} 10 \u{2764} 50'],
  [Vampire, '\u{1F396} 1 \u{2694} 25 \u{1F6E1} 25 \u{2764} 50'],
])('create childs Character', (Obj, expected) => {
  const char = new Obj(1);
  const result = `\u{1F396} ${char.level} \u{2694} ${char.attack} \u{1F6E1} ${char.defence} \u{2764} ${char.health}`;
  expect(result).toEqual(expected);
});
