import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import { Zx } from './client';
import { execa } from 'execa';
import {
  __dirname,
  copyFolder,
  createDirIfNotExists,
  Logger,
  readDirFile,
  replaceFileContent,
} from './utils';
import { log } from './utils';
import { cd, fs } from 'zx';
import { readJSONSync, remove, writeJSONSync } from 'fs-extra';
import { exit } from 'process';
import spawn from 'cross-spawn';

/**
 * 项目初始化脚手架
 * @param { Command } program
 */
export default function reloadDocker(program: Command, $: Zx): void {
  program
    .command('scaffold')
    .description('project scaffold')
    .action(async (info) => {
      const questions: any = [
        /** 使用vue3,vue2还是react */
        {
          type: 'list',
          name: 'framework',
          message: 'What type of framework is used',
          choices: ['vue3'],
          default: 'vue3',
        },
        /** 项目名称 */
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name',
          default: '',
        },
        /** 打包工具 */
        {
          type: 'list',
          name: 'buildTool',
          message: 'Build tool',
          choices: ['vite'],
          default: 'vite',
        },
        /** 是否多页项目 */
        {
          type: 'confirm',
          name: 'isMultiPageProject',
          message: 'Multi-page project?',
          default: true,
        },
        /** 保存自动格式化 */
        {
          type: 'confirm',
          name: 'autoFormat',
          message: 'Auto format on save file?',
          default: true,
        },
        /** 是否启用前端国际化 */
        {
          type: 'confirm',
          name: 'internationalizationEnabled',
          message: 'Internationalization enabled?',
          default: true,
        },
        // /** 是否安装vscode国际化插件lokalise.i18n-ally */
        // {
        //   type: 'confirm',
        //   name: 'installVscodeInternationalPlugin',
        //   message: 'Install the VSCode internationalization plugin?',
        //   default: true,
        // },
        /** 是否使用阿里云上传sdk */
        {
          type: 'confirm',
          name: 'isUseUploadSDK',
          message: 'Use aliyun upload sdk?',
          default: false,
        },
        /** 包管理工具 */
        {
          type: 'list',
          name: 'pkgManager',
          message: 'Type of package management',
          choices: ['pnpm', 'yarn', 'npm'],
          default: 'pnpm',
        },
      ];

      inquirer
        .prompt(questions)
        .then(async (answers) => {
          const scaffold = new Scaffold();
          const {
            genFramework,
            genBuildTools,
            genProjectName,
            genMultiPageProject,
            genAutoFormat,
            genInternationalization,
            genUpload,
            genPkgManager,
          } = scaffold;

          const answerMap: Map<string, (val: any, $: Zx) => Promise<void>> = new Map([
            ['vue3', genFramework],
            ['buildTools', genBuildTools],
            ['projectName', genProjectName],
            ['isMultiPageProject', genMultiPageProject],
            ['autoFormat', genAutoFormat],
            ['internationalizationEnabled', genInternationalization],
            ['isUseUploadSDK', genUpload],
            ['pkgManager', genPkgManager],
          ]);
          const answerList = Object.entries(answers);
          for await (const [key, value] of answerList) {
            const val = value as any;
            if (answerMap.has(val)) {
              await answerMap.get(val)?.call(scaffold, val, $);
            } else {
              await answerMap.get(key)?.call(scaffold, val, $);
            }
          }
        })
        .catch((error) => {
          if (error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
            console.error("Prompt couldn't be rendered in the current environment.");
          } else {
            // Something else went wrong
            console.error('Something else went wrong.');
          }
        });
    });
}

@Logger
class Scaffold {
  /** 项目完整路径名 */
  proName: string;

  get viteBaseConPath() {
    return path.join(this.proName, 'config', 'vite.config.base.ts');
  }
  async genFramework(projectName: string) {
    log('Use vue3');
  }

  async genBuildTools() {
    log('Use vite');
  }
  async genProjectName(projectName: string) {
    const proName = projectName || 'vue3-project';
    await createDirIfNotExists(proName);
    this.proName = path.join(process.cwd(), proName);
    await copyFolder(path.join(__dirname, '../src/template/vue3'), this.proName);
    readDirFile(this.proName, {
      onFile: (path) => {
        const content = fs.readFileSync(path, 'utf-8');
        const newContent = content.replace(/\$projectName/g, proName);
        fs.writeFileSync(path, newContent);
      },
    });
  }

  async genMultiPageProject(isMultiPageProject: any) {
    if (isMultiPageProject) {
      return;
    }
    await replaceFileContent(this.viteBaseConPath, (line) =>
      line.includes('viteMpa') ? ' ' : line,
    );
    const viteMpaPluginPath = path.join(this.proName, 'config', 'plugin', 'vite-plugin-mpa.js');
    await fs.promises.unlink(viteMpaPluginPath);
  }

  async genAutoFormat(isAutoFormat: boolean) {
    if (isAutoFormat) {
      return;
    }
    const autoFormatJSONPath = path.join(this.proName, '.vscode', 'settings.json');
    const res = readJSONSync(autoFormatJSONPath);
    res['editor.formatOnSave'] = false;
    writeJSONSync(autoFormatJSONPath, res, {
      spaces: 2,
    });
  }

  async genInternationalization(internationalizationEnabled: boolean) {
    if (internationalizationEnabled) {
      return;
    }
    await remove(path.join(this.proName, 'src', 'locale'));
    await replaceFileContent(path.join(this.proName, 'src', 'views', 'demo', 'demo.vue'), (line) =>
      line.includes('i18n') ? ' ' : line,
    );
  }

  async genUpload(isUseUploadSDK: boolean) {
    if (isUseUploadSDK) {
      return;
    }
    await replaceFileContent(this.viteBaseConPath, (line) =>
      line.includes('aliyunUploadSdkCopyPlugin') ? ' ' : line,
    );
    await replaceFileContent(
      path.join(this.proName, 'config', 'plugin', 'getAllEntries.ts'),
      (line) => (line.includes('.min.js') || line.includes('injectScript') ? ' ' : line),
    );
    await replaceFileContent(path.join(this.proName, 'template', 'template.ejs'), (line) =>
      line.includes('.min.js') ? ' ' : line,
    );
    await fs.promises.unlink(
      path.join(this.proName, 'config', 'plugin', 'aliyun-upload-sdk-copy-plugin.js'),
    );
    await remove(path.join(this.proName, 'aliyun-upload-sdk'));
  }

  async genPkgManager(pkgManager: 'pnpm' | 'yarn' | 'npm') {
    cd(this.proName);
    const { status } = spawn.sync(pkgManager, ['install'], {
      stdio: 'inherit',
    });
    exit(status ?? 0);
  }
}
