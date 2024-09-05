import { Command } from 'commander';
import { Zx } from './client';
/**
 * vue3项目翻译
 * @param { Command } program
 */
export default function translateVue3(program: Command, $: Zx): void {
  program
    .command('translate-vue3')
    .option('-n, --name <string>', 'name of service')
    .description('translate vue3 project')
    .action(async (info) => {});
}
