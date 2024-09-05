import { Command } from 'commander';
import { Zx } from './client';
import { log } from './utils';
/**
 * 重载docker镜像
 * @param { Command } program
 */
export default function dockerReload(program: Command, $: Zx): void {
  program
    .command('docker-reload')
    .option('-n, --name <string>', 'name of service')
    .description('Reload docker containers')
    .action(async (info) => {
      if (!info.name) {
        log('Please enter the name of the docker service');
        return;
      }
      await $`docker service scale idc_${info.name}=0`;
      await $`docker service scale idc_${info.name}=1`;
      log(`Reload docker containers ${info.name} success`);
    });
}
