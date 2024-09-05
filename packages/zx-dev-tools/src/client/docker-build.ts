import { Command } from 'commander';
import { Zx } from './client';
import { getPkg, log } from './utils';
import spawn from 'cross-spawn';
import { exit } from 'process';
export interface DockerBuildInfo {
  /** 镜像路径 */
  path: string;
  /** 环境 */
  env?: 'test' | 'demo' | 'stable';
  /** 是否强制安装依赖 */
  forceInstall?: boolean;
}
/**
 * docker打包项目
 * @param { Command } program
 */
export default function reloadDocker(program: Command, $: Zx): void {
  program
    .command('docker-build')
    .option('-p, --path <string>', 'docker image path')
    .option('-e, --env <string>', 'env', 'test')
    .option('-f, --forceInstall', 'force install dependencies')
    .description('Docker build frontend project')
    .action(async (info: DockerBuildInfo) => {
      if (!info.path) {
        log('Please enter the path of the docker service');
        return;
      }
      const dockerRegPath = info.path;
      const env = info.env;
      const { name, version } = getPkg();
      log(`name:${name},version:${version}`);
      const image = `${name}:${env}-${version}`;
      log(`pnpm config set registry https://registry.npmmirror.com --global`);
      await $`pnpm config set registry https://registry.npmmirror.com --global`;

      const res = await $`zx-tools pkg-dep-change`;
      if (res.stdout.includes('true') || info.forceInstall) {
        log(`pnpm install start`);
        await $`pnpm install`;
        const { status } = spawn.sync('pnpm', ['install'], {
          stdio: 'inherit',
        });
        log(`pnpm install end`);
      }

      log(`pnpm build start`);
      await $`pnpm build:${env}`;
      log(`pnpm build end`);

      log(`image full path:${dockerRegPath}${image}`);
      log(`docker build start`);
      await $`docker build -t ${image} .`;
      await $`docker tag ${image} ${dockerRegPath}${image}`;
      await $`docker push ${dockerRegPath}${image}`;
      log(`docker build end`);
    });
}
