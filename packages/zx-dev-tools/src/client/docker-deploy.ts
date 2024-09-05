import { Command } from 'commander';
import { cd } from 'zx';
import { Zx } from './client';
import { log } from './utils';
export interface DockerDeployInfo {
  /** 镜像路径 */
  path: string;
  /** 项目名称 */
  projectName: string;
}
/**
 * docker部署
 * @param { Command } program
 */
export default function reloadDocker(program: Command, $: Zx): void {
  program
    .command('docker-deploy')
    .option('-p, --path <string>', 'docker image path')
    .option('-pro, --projectName <string>', 'project name')
    .description('Reload docker containers')
    .action(async (info: DockerDeployInfo) => {
      if (!info.path) {
        log('Path of dockerfile is required');
        return;
      }
      if (!info.projectName) {
        log('name of service is required');
        return;
      }
      cd('/opt/dev/idc');
      const { stdout: oEnv } =
        await $`cat /opt/dev/idc/.env |grep -i ${info.projectName}|awk -F '=' '{print $2}'`;
      const env = oEnv.replace('\n', '');
      log(`env:${env}`);
      const updateCommand = `docker service update --image ${info.path}${info.projectName}:${env} idc_${info.projectName}`;
      log(`${updateCommand} start`);
      await $`docker service update --image ${info.path}${info.projectName}:${env} idc_${info.projectName}`;
      log(`${updateCommand} end`);
      if (env.includes('test') || env.includes('dev')) {
        await $`zx-tools docker-reload -n ${info.projectName}`;
      }
    });
}
