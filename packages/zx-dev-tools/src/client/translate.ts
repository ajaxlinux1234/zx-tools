import { Command } from 'commander';
import { Zx } from './client';

/**
 * 项目自动化翻译
 * @param { Command } program
 */
export default function reloadDocker(program: Command, $: Zx): void {
  program
    .command('translate')
    .description('project auto translate')
    .action(async (info) => {});
}
