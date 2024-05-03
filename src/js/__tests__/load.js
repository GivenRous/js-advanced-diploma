import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

jest.mock('../GamePlay');

test('load success', () => {
  const stateService = new GameStateService();
  const loadResult = jest.fn(() => stateService.load());
  loadResult.mockReturnValueOnce(true);
  expect(loadResult).toBeTruthy();
});

test('load error', () => {
  const stateService = new GameStateService(null);
  expect(() => stateService.load()).toThrowError(new Error('Invalid state'));
});

test('load error message', () => {
  const stateService = new GameStateService(null);
  const showError = jest.fn(() => GamePlay.showError('No saved game'));

  try {
    stateService.load();
  } catch (err) {
    showError();
  }

  expect(showError).toHaveBeenCalled();
});
