import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ️  ' + message));
  }

  static success(message: string): void {
    console.log(chalk.green('✅ ' + message));
  }

  static warn(message: string): void {
    console.log(chalk.yellow('⚠️  ' + message));
  }

  static error(message: string, error?: Error): void {
    console.error(chalk.red('❌ ' + message));
    if (error) {
      console.error(chalk.red(error.stack || error.message));
    }
  }

  static title(message: string): void {
    console.log(chalk.cyan.bold('\n🔍 ' + message + '\n'));
  }

  static completion(message: string): void {
    console.log(chalk.green.bold('\n🎉 ' + message + '\n'));
  }
} 