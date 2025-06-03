import { shuffleArray } from '../js/gameLogic.js';

describe('shuffleArray', () => {
  test('output length equals input length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr.slice());
    expect(result.length).toBe(arr.length);
  });

  test('all original elements appear in the result', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr.slice());
    // Sort both arrays to compare regardless of order
    expect(result.sort()).toEqual(arr.slice().sort());
  });
});
