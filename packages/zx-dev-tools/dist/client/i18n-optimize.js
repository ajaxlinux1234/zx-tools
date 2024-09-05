import { a as lib, b as asyncReadDirFile, l as log } from '../utils-BG60KKUp.js';
import { join } from 'path';
import { readFileSync } from 'fs';
import { i as inquirer } from '../index-BGXSqE6q.js';
import 'url';
import 'util';
import 'fs/promises';
import 'constants';
import 'stream';
import 'assert';
import 'zx';
import 'node:readline';
import 'node:tty';
import 'node:process';
import 'node:async_hooks';
import 'tty';
import 'child_process';
import 'buffer';
import 'string_decoder';
import 'crypto';

function i18nOptimize(program, $) {
  program.command("i18n-optimize").option("-p, --path <string>", "Path to Check", process.cwd()).option("-i18n, --i18nPath <string...>", "I18n paths", [
    join(process.cwd(), "src/locale/en-US/common.json"),
    join(process.cwd(), "src/locale/zh-CN/common.json")
  ]).description("Check for unused texts, auto-delete?").action(async (info) => {
    const i18nEnJSON = lib.readJSONSync(info.i18nPath[0]);
    const flattenI18nEn = flatten(i18nEnJSON);
    const i18nZhJSON = lib.readJSONSync(info.i18nPath[1]);
    const flattenI18nZh = flatten(i18nZhJSON);
    const beCheckPathFileMap = {};
    const unUseList = [];
    await asyncReadDirFile(info.path, {
      onFile(path) {
        if (!path.endsWith(".vue")) {
          return;
        }
        beCheckPathFileMap[path] = readFileSync(path, "utf-8");
      }
    });
    Object.entries(flattenI18nEn).forEach(([key]) => {
      if (Object.values(beCheckPathFileMap).every((fileStr) => !fileStr.includes(key))) {
        unUseList.push(key);
      }
    });
    if (!unUseList.length) {
      return log("no unUseList");
    }
    log(`unUseList: ${unUseList}`);
    const questions = [
      {
        type: "confirm",
        name: "DeleteUnUseKey",
        message: "Delete unused keys?",
        default: true
      }
    ];
    const answers = await inquirer.prompt(questions);
    if (answers.DeleteUnUseKey) {
      unUseList.forEach((flattenKey) => {
        delete flattenI18nEn[flattenKey];
        delete flattenI18nZh[flattenKey];
      });
    }
    const unFlattenI18nEn = unFlatten(flattenI18nEn);
    const unFlattenI18nZh = unFlatten(flattenI18nZh);
    lib.writeJSONSync(info.i18nPath[0], unFlattenI18nEn, {
      spaces: 2
    });
    lib.writeJSONSync(info.i18nPath[1], unFlattenI18nZh, {
      spaces: 2
    });
    answers.DeleteUnUseKey && log("i18n-optimize success");
  });
}
function flatten(obj, prefix = "") {
  let result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flatten(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}
function unFlatten(obj) {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const keys = key.split(".");
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === void 0) {
        current[k] = {};
      }
      current = current[k];
    }
    current[keys[keys.length - 1]] = obj[key];
  });
  return result;
}

export { i18nOptimize as default };
