import { Command } from "commander";
/**
 * 重载docker镜像
 * @param { Command } program 
 */
export default function reloadDocker(program) {
  program.command("reload-docker")
    .description("Reload docker containers")
    .action(() => {
      console.log("Reloading docker containers");
    });
}