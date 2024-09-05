import { cd } from 'zx';
import { l as log } from '../utils-BG60KKUp.js';
import 'path';
import 'url';
import 'util';
import 'fs/promises';
import 'fs';
import 'constants';
import 'stream';
import 'assert';

function reloadDocker(program, $) {
  program.command("docker-deploy").option("-p, --path <string>", "docker image path").option("-pro, --projectName <string>", "project name").description("Reload docker containers").action(async (info) => {
    if (!info.path) {
      log("Path of dockerfile is required");
      return;
    }
    if (!info.projectName) {
      log("name of service is required");
      return;
    }
    cd("/opt/dev/idc");
    const { stdout: oEnv } = await $`cat /opt/dev/idc/.env |grep -i ${info.projectName}|awk -F '=' '{print $2}'`;
    const env = oEnv.replace("\n", "");
    log(`env:${env}`);
    const updateCommand = `docker service update --image ${info.path}${info.projectName}:${env} idc_${info.projectName}`;
    log(`${updateCommand} start`);
    await $`docker service update --image ${info.path}${info.projectName}:${env} idc_${info.projectName}`;
    log(`${updateCommand} end`);
    if (env.includes("test") || env.includes("dev")) {
      await $`zx-tools docker-reload -n ${info.projectName}`;
    }
  });
}

export { reloadDocker as default };
