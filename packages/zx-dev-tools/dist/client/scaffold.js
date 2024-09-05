import { i as inquirer } from '../index-BGXSqE6q.js';
import path from 'path';
import { l as log, c as createDirIfNotExists, d as copyFolder, _ as __dirname, r as readDirFile, e as replaceFileContent, a as lib, L as Logger } from '../utils-BG60KKUp.js';
import { fs, cd } from 'zx';
import { exit } from 'process';
import { s as spawn } from '../index-uS3HAKzt.js';
import 'node:readline';
import 'stream';
import 'node:tty';
import 'node:process';
import 'node:async_hooks';
import 'tty';
import 'fs';
import 'util';
import 'child_process';
import 'buffer';
import 'string_decoder';
import 'crypto';
import 'url';
import 'fs/promises';
import 'constants';
import 'assert';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k = flags & 7, p = !!(flags & 16);
  var j = 0;
  var extraInitializers = array[j] || (array[j] = []);
  var desc = k && ((target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(target , name));
  __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn(it) && (target = it);
  }
  return __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var _Scaffold_decorators, _init;
function reloadDocker(program, $) {
  program.command("scaffold").description("project scaffold").action(async (info) => {
    const questions = [
      /** 使用vue3,vue2还是react */
      {
        type: "list",
        name: "framework",
        message: "What type of framework is used",
        choices: ["vue3"],
        default: "vue3"
      },
      /** 项目名称 */
      {
        type: "input",
        name: "projectName",
        message: "Project name",
        default: ""
      },
      /** 打包工具 */
      {
        type: "list",
        name: "buildTool",
        message: "Build tool",
        choices: ["vite"],
        default: "vite"
      },
      /** 是否多页项目 */
      {
        type: "confirm",
        name: "isMultiPageProject",
        message: "Multi-page project?",
        default: true
      },
      /** 保存自动格式化 */
      {
        type: "confirm",
        name: "autoFormat",
        message: "Auto format on save file?",
        default: true
      },
      /** 是否启用前端国际化 */
      {
        type: "confirm",
        name: "internationalizationEnabled",
        message: "Internationalization enabled?",
        default: true
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
        type: "confirm",
        name: "isUseUploadSDK",
        message: "Use aliyun upload sdk?",
        default: false
      },
      /** 包管理工具 */
      {
        type: "list",
        name: "pkgManager",
        message: "Type of package management",
        choices: ["pnpm", "yarn", "npm"],
        default: "pnpm"
      }
    ];
    inquirer.prompt(questions).then(async (answers) => {
      const scaffold = new Scaffold();
      const {
        genFramework,
        genBuildTools,
        genProjectName,
        genMultiPageProject,
        genAutoFormat,
        genInternationalization,
        genUpload,
        genPkgManager
      } = scaffold;
      const answerMap = /* @__PURE__ */ new Map([
        ["vue3", genFramework],
        ["buildTools", genBuildTools],
        ["projectName", genProjectName],
        ["isMultiPageProject", genMultiPageProject],
        ["autoFormat", genAutoFormat],
        ["internationalizationEnabled", genInternationalization],
        ["isUseUploadSDK", genUpload],
        ["pkgManager", genPkgManager]
      ]);
      const answerList = Object.entries(answers);
      for await (const [key, value] of answerList) {
        const val = value;
        if (answerMap.has(val)) {
          await answerMap.get(val)?.call(scaffold, val, $);
        } else {
          await answerMap.get(key)?.call(scaffold, val, $);
        }
      }
    }).catch((error) => {
      if (error.isTtyError) {
        console.error("Prompt couldn't be rendered in the current environment.");
      } else {
        console.error("Something else went wrong.");
      }
    });
  });
}
_Scaffold_decorators = [Logger];
class Scaffold {
  /** 项目完整路径名 */
  proName;
  get viteBaseConPath() {
    return path.join(this.proName, "config", "vite.config.base.ts");
  }
  async genFramework(projectName) {
    log("Use vue3");
  }
  async genBuildTools() {
    log("Use vite");
  }
  async genProjectName(projectName) {
    const proName = projectName || "vue3-project";
    await createDirIfNotExists(proName);
    this.proName = path.join(process.cwd(), proName);
    await copyFolder(path.join(__dirname, "../src/template/vue3"), this.proName);
    readDirFile(this.proName, {
      onFile: (path2) => {
        const content = fs.readFileSync(path2, "utf-8");
        const newContent = content.replace(/\$projectName/g, proName);
        fs.writeFileSync(path2, newContent);
      }
    });
  }
  async genMultiPageProject(isMultiPageProject) {
    if (isMultiPageProject) {
      return;
    }
    await replaceFileContent(
      this.viteBaseConPath,
      (line) => line.includes("viteMpa") ? " " : line
    );
    const viteMpaPluginPath = path.join(this.proName, "config", "plugin", "vite-plugin-mpa.js");
    await fs.promises.unlink(viteMpaPluginPath);
  }
  async genAutoFormat(isAutoFormat) {
    if (isAutoFormat) {
      return;
    }
    const autoFormatJSONPath = path.join(this.proName, ".vscode", "settings.json");
    const res = lib.readJSONSync(autoFormatJSONPath);
    res["editor.formatOnSave"] = false;
    lib.writeJSONSync(autoFormatJSONPath, res, {
      spaces: 2
    });
  }
  async genInternationalization(internationalizationEnabled) {
    if (internationalizationEnabled) {
      return;
    }
    await lib.remove(path.join(this.proName, "src", "locale"));
    await replaceFileContent(
      path.join(this.proName, "src", "views", "demo", "demo.vue"),
      (line) => line.includes("i18n") ? " " : line
    );
  }
  async genUpload(isUseUploadSDK) {
    if (isUseUploadSDK) {
      return;
    }
    await replaceFileContent(
      this.viteBaseConPath,
      (line) => line.includes("aliyunUploadSdkCopyPlugin") ? " " : line
    );
    await replaceFileContent(
      path.join(this.proName, "config", "plugin", "getAllEntries.ts"),
      (line) => line.includes(".min.js") || line.includes("injectScript") ? " " : line
    );
    await replaceFileContent(
      path.join(this.proName, "template", "template.ejs"),
      (line) => line.includes(".min.js") ? " " : line
    );
    await fs.promises.unlink(
      path.join(this.proName, "config", "plugin", "aliyun-upload-sdk-copy-plugin.js")
    );
    await lib.remove(path.join(this.proName, "aliyun-upload-sdk"));
  }
  async genPkgManager(pkgManager) {
    cd(this.proName);
    const { status } = spawn.sync(pkgManager, ["install"], {
      stdio: "inherit"
    });
    exit(status ?? 0);
  }
}
_init = __decoratorStart();
Scaffold = __decorateElement(_init, 0, "Scaffold", _Scaffold_decorators, Scaffold);
__runInitializers(_init, 1, Scaffold);

export { reloadDocker as default };
