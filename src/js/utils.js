export function calcTileType(index, boardSize) {

  const topLeft = 0;
  const topRigth = (boardSize - 1);
  const bottomLeft = (boardSize ** 2) - boardSize;
  const bottomRight = (boardSize ** 2) - 1;

  if (index === topLeft) {
    return 'top-left';
  }

  if (index === topRigth) {
    return 'top-right'; }

  if (index > topLeft && index < topRigth) {
    return 'top';
  }

  if (index === bottomLeft) {
    return 'bottom-left';
  }

  if (index === bottomRight) {
    return 'bottom-right';
  }

  if (index > bottomLeft && index < bottomRight) {
    return 'bottom';
  }

  if (index % boardSize === topLeft) {
    return 'left';
  }

  if (index % boardSize === topRigth) {
    return 'right';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function distance(char, index, type) {
  let range = null;

  const arrDistance = new Set();
  const boardSize = 8;
  const curIndex = index;

  if (type === 'move') {
    range = char.character.moveDistance;
  }

  if (type === 'attack') {
    range = char.character.attackDistance;
  }

  let maxTop = curIndex;
  let maxTopRight = curIndex;
  let maxRight = curIndex;
  let maxBottomRight = curIndex;
  let maxBottom = curIndex;
  let maxBottomLeft = curIndex;
  let maxLeft = curIndex;
  let maxTopLeft = curIndex;

  for (let i = 0; i < range; i += 1) {
    // top
    if (maxTop >= boardSize) {
      maxTop -= boardSize;
      arrDistance.add(maxTop);
    }

    // top-right
    if (maxTopRight >= boardSize && maxTopRight % boardSize !== boardSize - 1) {
      maxTopRight -= (boardSize - 1);
      arrDistance.add(maxTopRight);
    }

    // right
    if (maxRight % boardSize !== boardSize - 1) {
      maxRight += 1;
      arrDistance.add(maxRight);
    }

    // bottom-right
    if (maxBottomRight <= (boardSize ** 2)
    - boardSize && maxBottomRight % boardSize !== boardSize - 1) {
      maxBottomRight += (boardSize + 1);
      arrDistance.add(maxBottomRight);
    }

    // bottom
    if (maxBottom <= (boardSize ** 2) - boardSize) {
      maxBottom += boardSize;
      arrDistance.add(maxBottom);
    }

    // bottom-left
    if (maxBottomLeft <= (boardSize ** 2) - boardSize && maxBottomLeft % boardSize !== 0) {
      maxBottomLeft += (boardSize - 1);
      arrDistance.add(maxBottomLeft);
    }

    // left
    if (maxLeft % boardSize !== 0) {
      maxLeft -= 1;
      arrDistance.add(maxLeft);
    }

    // top-left
    if (maxTopLeft > boardSize && maxTopLeft % boardSize !== 0) {
      maxTopLeft -= (boardSize + 1);
      arrDistance.add(maxTopLeft);
    }
  }

  if (type === 'attack') {
    const rowStart = Math.floor(maxTop / boardSize);
    const rowEnd = Math.floor(maxBottom / boardSize);
    const colStart = (maxLeft % boardSize);
    const colEnd = (maxRight % boardSize);

    for (let i = rowStart; i <= rowEnd; i += 1) {
      for (let j = colStart; j <= colEnd; j += 1) {
        arrDistance.add(i * boardSize + j);
      }
    }
  }

  return Array.from(arrDistance);
}

export class AddFunctions {
  static compMoveRange(rangeAttackUser, rangeMove, cellCanMove) {
    rangeAttackUser.forEach((itemAttack) => {
      rangeMove.forEach((itemMove) => {
        if (itemMove === itemAttack) {
          cellCanMove.push(itemMove);
        }
      });
    });
  }

  static getRandomNumber(num) {
    return Math.floor(Math.random() * num);
  }

  static isPlayableCharacter(char) {
    if (char.character.type === 'bowman' || char.character.type === 'magician' || char.character.type === 'swordsman') {
      return true;
    }
    return false;
  }

  static levelUp(char) {
    const character = char;
    character.level += 1;

    AddFunctions.levelUpAttackDefence(character);

    character.health += 80;
    if (character.health > 100) {
      character.health = 100;
    }

    Math.round(character.health);

    return character;
  }

  static levelUpAttackDefence(char) {
    const character = char;
    character.attack = Math.round(Math.max(
      character.attack,
      (character.attack * (80 + character.health)) / 100,
    ));
    character.defence = Math.round(Math.max(
      character.defence,
      (character.defence * (80 + character.health)) / 100,
    ));
    return character;
  }

  static statsUpdate(level, points, bestPoints) {
    const statsLevel = document.querySelector('.level');
    const statsPoints = document.querySelector('.points');
    const statsBestPoints = document.querySelector('.best-points');

    statsLevel.innerText = level;
    statsPoints.innerText = points;
    statsBestPoints.innerText = bestPoints;
  }
}
