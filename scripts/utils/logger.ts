import chalk from 'chalk';

export class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  info(message: string) {
    console.log(chalk.blue(`ℹ ${this.prefix}${message}`));
  }

  success(message: string) {
    console.log(chalk.green(`✓ ${this.prefix}${message}`));
  }

  error(message: string) {
    console.log(chalk.red(`✗ ${this.prefix}${message}`));
  }

  warning(message: string) {
    console.log(chalk.yellow(`⚠ ${this.prefix}${message}`));
  }

  step(step: number, total: number, message: string) {
    console.log(chalk.cyan(`[${step}/${total}] ${message}`));
  }

  divider() {
    console.log(chalk.gray('─'.repeat(60)));
  }
}

export const logger = new Logger();
