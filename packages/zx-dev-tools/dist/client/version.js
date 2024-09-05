import path from 'path';
import { fs } from 'zx';

function reloadDocker(program) {
  program.command("version").description("Get package version").action(async () => {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const pkgStr = await fs.readFile(
      path.resolve(__dirname, "..", "..", "..", "..", "package.json"),
      "utf8"
    );
    const pkg = JSON.parse(pkgStr);
    console.log(pkg.version);
  });
}

export { reloadDocker as default };
