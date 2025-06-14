import ora, { type Ora } from 'ora';

export class SpinnerManager {
  private static activeSpinner: Ora | null = null;

  static start(text: string): Ora {
    if (SpinnerManager.activeSpinner) {
      SpinnerManager.activeSpinner.stop();
    }
    
    SpinnerManager.activeSpinner = ora(text).start();
    return SpinnerManager.activeSpinner;
  }

  static succeed(text?: string): void {
    if (SpinnerManager.activeSpinner) {
      SpinnerManager.activeSpinner.succeed(text);
      SpinnerManager.activeSpinner = null;
    }
  }

  static fail(text?: string): void {
    if (SpinnerManager.activeSpinner) {
      SpinnerManager.activeSpinner.fail(text);
      SpinnerManager.activeSpinner = null;
    }
  }

  static warn(text?: string): void {
    if (SpinnerManager.activeSpinner) {
      SpinnerManager.activeSpinner.warn(text);
      SpinnerManager.activeSpinner = null;
    }
  }

  static stopAll(): void {
    if (SpinnerManager.activeSpinner) {
      SpinnerManager.activeSpinner.stop();
      SpinnerManager.activeSpinner = null;
    }
  }
} 