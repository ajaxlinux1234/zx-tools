import { execSync } from 'child_process';
import { Command } from 'commander';
import fs from 'fs';
import { log } from './utils';

/**
 * 检测当前项目的package.json依赖是否有改动
 * @param { Command } program
 */
export default function reloadDocker(program: Command): void {
  program
    .command('pkg-dep-change')
    .description('Check package.json dependency changed')
    .action(async () => {
      // 调用函数并输出结果
      const hasChanged = hasPackageJsonDependencyChanged();
      console.log(
        hasChanged
          ? log('true: package.json dependency changed')
          : log('false: package.json dependency not changed'),
      );
    });
}

/**
 * 获取最近一次提交中 package.json 是否有变化
 * @returns {boolean} 如果 package.json 有依赖修改，则返回 true；否则返回 false
 */
function hasPackageJsonDependencyChanged(): Boolean {
  try {
    // 获取最近一次提交的 SHA
    const lastCommitSha = execSync('git rev-parse HEAD').toString().trim();
    try {
      execSync(`git diff --name-only ${lastCommitSha}^ ${lastCommitSha}`);
    } catch (error) {
      return true;
    }
    // 获取从上次提交到现在的差异
    const diffOutput = execSync(
      `git diff --name-only ${lastCommitSha}^ ${lastCommitSha}`,
    ).toString();

    // 检查 package.json 是否在差异中
    if (diffOutput.includes('package.json')) {
      // 读取 package.json 文件
      const currentPackageJsonContent = fs.readFileSync('package.json', 'utf8');
      const currentPackageJson = JSON.parse(currentPackageJsonContent);

      // 获取上一个提交的 package.json 内容
      const previousPackageJsonContent = execSync(
        `git show ${lastCommitSha}^:package.json`,
      ).toString();
      const previousPackageJson = JSON.parse(previousPackageJsonContent);

      // 检查 dependencies 和 devDependencies 是否有修改
      const dependenciesChanged =
        JSON.stringify(currentPackageJson.dependencies) !==
        JSON.stringify(previousPackageJson.dependencies);
      const devDependenciesChanged =
        JSON.stringify(currentPackageJson.devDependencies) !==
        JSON.stringify(previousPackageJson.devDependencies);

      // 如果 dependencies 或 devDependencies 有任何修改，则返回 true
      return dependenciesChanged || devDependenciesChanged;
    }

    // 如果 package.json 没有修改，则返回 false
    return false;
  } catch (error) {
    console.error('Error checking dependency changes:', error);
    return false;
  }
}
