import { DIFFICULTY } from '../constants';

export class DifficultyManager {
  private startY: number;

  constructor(startY: number) {
    this.startY = startY;
  }

  getHeightClimbed(currentY: number): number {
    return Math.max(0, this.startY - currentY);
  }

  getPlatformHeight(pixelHeight: number): number {
    return Math.floor(pixelHeight / DIFFICULTY.HEIGHT_PER_PLATFORM);
  }

  getScrollSpeed(heightClimbed: number): number {
    if (heightClimbed < DIFFICULTY.FLOOR_START_HEIGHT) {
      return 0;
    }

    const progressRange = DIFFICULTY.MAX_DIFFICULTY_HEIGHT - DIFFICULTY.FLOOR_START_HEIGHT;
    const progress = Math.min((heightClimbed - DIFFICULTY.FLOOR_START_HEIGHT) / progressRange, 1);

    return DIFFICULTY.INITIAL_SCROLL_SPEED + (DIFFICULTY.MAX_SCROLL_SPEED - DIFFICULTY.INITIAL_SCROLL_SPEED) * progress;
  }
}
