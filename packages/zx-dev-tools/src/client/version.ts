import { Command } from 'commander';
import path from 'path';
import { fs } from 'zx';
/**
 * 检测当前版本
 * @param { Command } program
 */
export default function reloadDocker(program: Command): void {
  program
    .command('version')
    .description('Get package version')
    .action(async () => {
      const __dirname = path.dirname(new URL(import.meta.url).pathname);
      const pkgStr = await fs.readFile(
        path.resolve(__dirname, '..', '..', '..', '..', 'package.json'),
        'utf8',
      );
      const pkg = JSON.parse(pkgStr);
      console.log(pkg.version);
    });
}
