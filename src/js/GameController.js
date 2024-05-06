import { AddFunctions } from "./utils";
import { distance } from "./utils";
import cursors from "./cursors";
import GamePlay from "./GamePlay";
import GameState from "./GameState";
import PositionedCharacter from "./PositionedCharacter";
import Team from "./Team";
import themes from "./themes";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.cleanGameProperty();
  }

  init() {
    this.gamePlay.drawUi(themes[this.level]);

    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
    this.addCellListeners();
    this.startGame();
  }

  addCellListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  startGame() {
    AddFunctions.statsUpdate(
      this.level,
      this.points,
      this.gameState.bestPoints
    );
    this.userTeam.playerStartTeam();
    this.compTeam.compStartTeam();
    this.setCharactersArr();
    this.gamePlay.redrawPositions(this.characters);
  }

  newGame() {
    this.cleanGameProperty();
    this.gamePlay.drawUi(themes[this.level]);
    this.clearCellListeners();
    this.addCellListeners();
    this.startGame();
  }

  saveGame() {
    this.gameState.saveDataGame(this);
    this.stateService.save(this.gameState);
    GamePlay.showError("Игра сохранена");
  }

  loadGame() {
    if (this.stateService.storage.length === 0) {
      GamePlay.showError("Нет сохранений");
      return;
    }
    const loadClass = this.stateService.load();
    this.cleanGameProperty();
    this.level = loadClass.gameData.level;
    this.points = loadClass.gameData.points;
    this.gamePlay.drawUi(themes[this.setTheme()]);
    this.userTeam.loadGameTeam(loadClass.gameData.userTeam.characters);
    this.compTeam.loadGameTeam(loadClass.gameData.compTeam.characters);
    const ghostCharacters = [
      ...this.userTeam.characters,
      ...this.compTeam.characters,
    ];

    ghostCharacters.forEach((item, index) => {
      this.characters.push(
        new PositionedCharacter(
          item,
          loadClass.gameData.characters[index].position
        )
      );
    });

    this.clearCellListeners();
    this.addCellListeners();
    this.gamePlay.redrawPositions(this.characters);
    AddFunctions.statsUpdate(
      this.level,
      this.points,
      this.gameState.bestPoints
    );
    GamePlay.showError("Игра загружена");
  }

  onCellClick(index) {
    const characterInCell = this.checkCharacterInCell(index);

    if (characterInCell && AddFunctions.isPlayableCharacter(characterInCell)) {
      if (this.activeCharacterIndex || this.activeCharacterIndex === 0) {
        this.gamePlay.deselectCell(this.activeCharacterIndex);
      }

      this.gamePlay.selectCell(index);
      this.activeCharacterIndex = index;
      this.activeCharacter = characterInCell;
    }

    if (characterInCell && !AddFunctions.isPlayableCharacter(characterInCell)) {
      if (!this.canAttack) {
        if (this.activeCharacter) {
          GamePlay.showError("Противник слишком далеко");
          return;
        }
        GamePlay.showError("Это персонаж противника");
        return;
      }

      if (!this.activeCharacter) return;

      const damage = +Math.max(
        this.activeCharacter.character.attack -
          characterInCell.character.defence,
        this.activeCharacter.character.attack * 0.1
      ).toFixed(1);
      characterInCell.character.health -= damage;
      characterInCell.character.health =
        +characterInCell.character.health.toFixed(1);

      this.gamePlay.deselectCell(this.activeCharacterIndex);
      this.gamePlay.deselectCell(index);

      this.activeCharacterIndex = null;
      this.activeCharacter = null;
      this.canAttack = null;
      this.gamePlay.setCursor(cursors.auto);

      (async () => {
        await this.gamePlay.showDamage(index, damage);

        if (characterInCell.character.health <= 0) {
          this.death(this.compTeam, characterInCell);
        }

        this.gamePlay.redrawPositions(this.characters);

        this.turn = false;

        if (this.compTeam.characters.length > 0) {
          this.whoseTurn();
        } else {
          setTimeout(() => {
            this.gameLoop();
          }, 100);
        }
      })();
    }

    if (!characterInCell && this.canMove != null) {
      this.gamePlay.deselectCell(this.activeCharacter.position);
      this.activeCharacter.position = index;
      this.canMove = null;
      this.activeCharacterIndex = null;
      this.activeCharacter = null;
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.auto);
      this.gamePlay.redrawPositions(this.characters);
      this.turn = false;
      this.whoseTurn();
    }
  }

  onCellEnter(index) {
    const characterInCell = this.checkCharacterInCell(index);

    if (characterInCell) {
      if (AddFunctions.isPlayableCharacter(characterInCell)) {
        this.gamePlay.setCursor(cursors.pointer);
      }
      this.gamePlay.showCellTooltip(
        `\u{1F396} ${characterInCell.character.level} \u{2694} ${characterInCell.character.attack} \u{1F6E1} ${characterInCell.character.defence} \u{2764} ${characterInCell.character.health}`,
        index
      );
    }

    if (this.activeCharacter && !characterInCell) {
      const range = distance(
        this.activeCharacter,
        this.activeCharacterIndex,
        "move"
      );
      range.forEach((item) => {
        if (item === index) {
          this.gamePlay.selectCell(index, "green");
          this.gamePlay.setCursor(cursors.pointer);
          this.canMove = item;
        }
      });

      if (this.activeCharacter && !this.canMove) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }

    if (
      this.activeCharacter &&
      characterInCell &&
      !AddFunctions.isPlayableCharacter(characterInCell)
    ) {
      const range = distance(
        this.activeCharacter,
        this.activeCharacterIndex,
        "attack"
      );

      range.forEach((item) => {
        if (item === index) {
          this.gamePlay.selectCell(index, "red");
          this.gamePlay.setCursor(cursors.crosshair);
          this.canAttack = true;
        }
      });

      if (
        !this.canAttack &&
        !AddFunctions.isPlayableCharacter(characterInCell)
      ) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    const characterInCell = this.checkCharacterInCell(index);
    this.gamePlay.setCursor(cursors.auto);

    if (characterInCell) {
      this.gamePlay.hideCellTooltip(index);
    }

    if (this.activeCharacter && !characterInCell) {
      this.gamePlay.deselectCell(index);
      this.canMove = null;
    }

    if (
      this.activeCharacter &&
      characterInCell &&
      !AddFunctions.isPlayableCharacter(characterInCell)
    ) {
      this.gamePlay.deselectCell(index);
      this.canAttack = null;
    }
  }

  turnComp() {
    let activeCompCharacter = null;
    let willBeAttacked = null;

    this.compTeam.characters.find((compChar) => {
      const posChar = this.characters.find(
        (char) => char.character === compChar
      );

      const rangeAttack = distance(posChar, posChar.position, "attack");

      rangeAttack.find((itemIndex) => {
        const characterInCell = this.checkCharacterInCell(itemIndex);

        if (
          characterInCell &&
          AddFunctions.isPlayableCharacter(characterInCell)
        ) {
          willBeAttacked = characterInCell;
          return willBeAttacked;
        }
        return false;
      });

      if (willBeAttacked) {
        activeCompCharacter = posChar;

        this.gamePlay.selectCell(activeCompCharacter.position);
        this.gamePlay.selectCell(willBeAttacked.position, "red");

        const damage = +Math.max(
          activeCompCharacter.character.attack -
            willBeAttacked.character.defence,
          activeCompCharacter.character.attack * 0.1
        ).toFixed(1);
        willBeAttacked.character.health -= damage;
        willBeAttacked.character.health =
          +willBeAttacked.character.health.toFixed(1);
        (async () => {
          await this.gamePlay.showDamage(willBeAttacked.position, damage);

          this.gamePlay.deselectCell(activeCompCharacter.position);
          this.gamePlay.deselectCell(willBeAttacked.position);

          if (willBeAttacked.character.health <= 0) {
            this.death(this.userTeam, willBeAttacked);
          }

          this.gamePlay.redrawPositions(this.characters);
          this.turn = true;

          if (this.userTeam.characters.length === 0) {
            setTimeout(() => {
              GamePlay.showError("GAME OVER");
              this.clearCellListeners();
            }, 100);
          }
        })();

        return activeCompCharacter;
      }
      return false;
    });

    if (activeCompCharacter) return;

    activeCompCharacter = this.strongCharacter(this.compTeam.characters);

    const rangeMove = distance(
      activeCompCharacter,
      activeCompCharacter.position,
      "move"
    );

    rangeMove.forEach((item, index, array) => {
      const filledCell = this.checkCharacterInCell(item);
      if (filledCell) {
        array.splice(index, 1);
      }
    });

    const rangeAttackUser = new Set();

    this.userTeam.characters.find((userChar) => {
      const posChar = this.characters.find(
        (char) => char.character === userChar
      );

      const range = distance(activeCompCharacter, posChar.position, "attack");

      range.forEach((item) => {
        rangeAttackUser.add(item);
      });
      return false;
    });

    const cellCanMove = [];

    AddFunctions.compMoveRange(rangeAttackUser, rangeMove, cellCanMove);

    if (cellCanMove.length === 0) {
      rangeAttackUser.forEach((item) => {
        this.userTeam.characters.forEach(() => {
          const range = distance(activeCompCharacter, item, "attack");

          range.forEach((itemCell) => {
            rangeAttackUser.add(itemCell);
          });
        });
      });

      AddFunctions.compMoveRange(rangeAttackUser, rangeMove, cellCanMove);
    }

    [activeCompCharacter.position] = cellCanMove;
    this.gamePlay.redrawPositions(this.characters);
    this.turn = true;
  }

  death(team, posCharacter) {
    team.characters.forEach((item, index, array) => {
      if (item === posCharacter.character) {
        array.splice(index, 1);
      }
    });
    this.characters.forEach((item, index, array) => {
      if (item.character === posCharacter.character) {
        array.splice(index, 1);
      }
    });
  }

  gameLoop() {
    this.userTeam.characters.forEach((item) => {
      this.points += item.health;
      this.points = +this.points.toFixed(1);
      this.gameState.saveBestPoints(this.points);
      this.updateBestPoints();
      AddFunctions.levelUp(item);
    });

    GamePlay.showError(`Вы победили! Очки: ${this.points}`);

    this.level += 1;
    this.turn = true;
    this.gamePlay.drawUi(themes[this.setTheme()]);
    this.userTeam.playerUpdateTeam(this.level, this.userTeam.characters.length);
    this.compTeam.compUpdateTeam(this.level, this.userTeam.characters.length);
    this.characters = [];
    this.allowPlayerPositions = [];
    this.allowCompPositions = [];
    this.setCharactersArr();
    this.gamePlay.redrawPositions(this.characters);
    AddFunctions.statsUpdate(
      this.level,
      this.points,
      this.gameState.bestPoints
    );

    this.whoseTurn();
  }

  clearCellListeners() {
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.cellClickListeners = [];
  }

  cleanGameProperty() {
    this.level = 1;
    this.turn = true;
    this.points = 0;
    this.userTeam = new Team();
    this.compTeam = new Team();
    this.allowPlayerPositions = [];
    this.allowCompPositions = [];
    this.characters = [];
    this.activeCharacterIndex = null;
    this.activeCharacter = null;
    this.canAttack = null;
    this.canMove = null;
  }

  strongCharacter(characters) {
    const arr = characters;

    if (arr.length > 1) {
      arr.sort((a, b) => (a.attack > b.attack ? -1 : 1));
    }

    return this.characters.find((item) => item.character === arr[0]);
  }

  checkCharacterInCell(index) {
    return this.characters.find((item) => item.position === index);
  }

  generatePositions(team, positions) {
    team.characters.forEach((item) => {
      const randomPosition = AddFunctions.getRandomNumber(positions.length);
      const newPosition = positions[randomPosition];
      positions.splice(randomPosition, 1);

      this.characters.push(new PositionedCharacter(item, newPosition));
    });
  }

  setCharactersArr() {
    this.getPlayerPositions();
    this.getCompPositions();
    this.generatePositions(this.userTeam, this.allowPlayerPositions);
    this.generatePositions(this.compTeam, this.allowCompPositions);
  }

  getPlayerPositions() {
    for (let i = 0; i < this.gamePlay.boardSize ** 2; ) {
      if (i % 2 === 0) {
        this.allowPlayerPositions.push(i);
        i += 1;
      } else {
        this.allowPlayerPositions.push(i);
        i += 7;
      }
    }
  }

  getCompPositions() {
    for (let i = 6; i < this.gamePlay.boardSize ** 2; ) {
      if (i % 2 === 0) {
        this.allowCompPositions.push(i);
        i += 1;
      } else {
        this.allowCompPositions.push(i);
        i += 7;
      }
    }
  }

  setTheme() {
    let themeNumber = this.level % 4;
    if (themeNumber === 0) {
      themeNumber = 4;
    }
    return themeNumber;
  }

  updateBestPoints() {
    if (this.stateService.storage.length === 0) {
      return;
    }
    const loadData = this.stateService.load();

    if (this.gameState.bestPoints > loadData.bestPoints) {
      loadData.bestPoints = this.gameState.bestPoints;
      this.stateService.save(loadData);
    }
  }
  whoseTurn() {
    if (!this.turn) {
      this.turnComp();
    }
  }
}
