import chalk from 'chalk';

import app from './app';

const port = 3000;

try {
  app.listen(port, (): void => {
    console.log(chalk.green(`Connected successfully on port ${port} 🚀`));
  });
} catch (error) {
  console.error(chalk.red(`❌ Error occured: ${(error as Error).message}`));
}
