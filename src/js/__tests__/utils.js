import { calcTileType } from '../utils';

const boardSize = 8;

test.each([
  [0, 'top-left'],
  [4, 'top'],
  [7, 'top-right'],
  [56, 'bottom-left'],
  [63, 'bottom-right'],
  [59, 'bottom'],
  [24, 'left'],
  [47, 'right'],
])('return position', (index, expected) => {
  const result = calcTileType(index, boardSize);
  expect(result).toBe(expected);
});
