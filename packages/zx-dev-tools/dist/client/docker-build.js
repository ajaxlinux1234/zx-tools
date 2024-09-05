import { l as log, g as getPkg } from '../utils-BG60KKUp.js';
import { s as spawn } from '../index-uS3HAKzt.js';
import 'path';
import 'url';
import 'util';
import 'fs/promises';
import 'fs';
import 'constants';
import 'stream';
import 'assert';
import 'zx';
import 'child_process';

function reloadDocker(program, $) {
  program.command("docker-build").option("-p, --path <string>", "docker image path").option("-e, --env <string>", "env", "test").option("-f, --forceInstall", "force install dependencies").description("Docker build frontend project").action(async (info) => {
    if (!info.path) {
      log("Please enter the path of the docker service");
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
    if (res.stdout.includes("true") || info.forceInstall) {
      log(`pnpm install start`);
      await $`pnpm install`;
      spawn.sync("pnpm", ["install"], {
        stdio: "inherit"
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

export { reloadDocker as default };
