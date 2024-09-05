import { execSync } from 'child_process';
import require$$0 from 'fs';
import { l as log } from '../utils-BG60KKUp.js';
import 'path';
import 'url';
import 'util';
import 'fs/promises';
import 'constants';
import 'stream';
import 'assert';
import 'zx';

function reloadDocker(program) {
  program.command("pkg-dep-change").description("Check package.json dependency changed").action(async () => {
    const hasChanged = hasPackageJsonDependencyChanged();
    console.log(
      hasChanged ? log("true: package.json dependency changed") : log("false: package.json dependency not changed")
    );
  });
}
function hasPackageJsonDependencyChanged() {
  try {
    const lastCommitSha = execSync("git rev-parse HEAD").toString().trim();
    try {
      execSync(`git diff --name-only ${lastCommitSha}^ ${lastCommitSha}`);
    } catch (error) {
      return true;
    }
    const diffOutput = execSync(
      `git diff --name-only ${lastCommitSha}^ ${lastCommitSha}`
    ).toString();
    if (diffOutput.includes("package.json")) {
      const currentPackageJsonContent = require$$0.readFileSync("package.json", "utf8");
      const currentPackageJson = JSON.parse(currentPackageJsonContent);
      const previousPackageJsonContent = execSync(
        `git show ${lastCommitSha}^:package.json`
      ).toString();
      const previousPackageJson = JSON.parse(previousPackageJsonContent);
      const dependenciesChanged = JSON.stringify(currentPackageJson.dependencies) !== JSON.stringify(previousPackageJson.dependencies);
      const devDependenciesChanged = JSON.stringify(currentPackageJson.devDependencies) !== JSON.stringify(previousPackageJson.devDependencies);
      return dependenciesChanged || devDependenciesChanged;
    }
    return false;
  } catch (error) {
    console.error("Error checking dependency changes:", error);
    return false;
  }
}

export { reloadDocker as default };
