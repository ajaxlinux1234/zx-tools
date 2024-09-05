import { l as log } from '../utils-BG60KKUp.js';
import 'path';
import 'url';
import 'util';
import 'fs/promises';
import 'fs';
import 'constants';
import 'stream';
import 'assert';
import 'zx';

function dockerReload(program, $) {
  program.command("docker-reload").option("-n, --name <string>", "name of service").description("Reload docker containers").action(async (info) => {
    if (!info.name) {
      log("Please enter the name of the docker service");
      return;
    }
    await $`docker service scale idc_${info.name}=0`;
    await $`docker service scale idc_${info.name}=1`;
    log(`Reload docker containers ${info.name} success`);
  });
}

export { dockerReload as default };
