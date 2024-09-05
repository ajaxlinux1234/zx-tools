import { Command } from 'commander';
import { Zx } from './client';
import { asyncReadDirFile, log, readDirFile } from './utils';
import { join } from 'path';
import { readJSONSync, writeJSONSync } from 'fs-extra';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';

interface I18nOptimize {
  /** 要检测的路径 */
  path: string;
  /** 国际化文件路径 */
  i18nPath: string;
}

/**
 * 查找项目中多余的国际化的,是否自动删除
 * @param { Command } program
 */
export default function i18nOptimize(program: Command, $: Zx): void {
  program
    .command('i18n-optimize')
    .option('-p, --path <string>', 'Path to Check', process.cwd())
    .option('-i18n, --i18nPath <string...>', 'I18n paths', [
      join(process.cwd(), 'src/locale/en-US/common.json'),
      join(process.cwd(), 'src/locale/zh-CN/common.json'),
    ])
    .description('Check for unused texts, auto-delete?')
    .action(async (info: I18nOptimize) => {
      const i18nEnJSON = readJSONSync(info.i18nPath[0]);
      const flattenI18nEn = flatten(i18nEnJSON);
      const i18nZhJSON = readJSONSync(info.i18nPath[1]);
      const flattenI18nZh = flatten(i18nZhJSON);
      const beCheckPathFileMap: Record<string, string> = {};
      const unUseList: string[] = [];
      await asyncReadDirFile(info.path, {
        onFile(path) {
          if (!path.endsWith('.vue')) {
            return;
          }
          beCheckPathFileMap[path] = readFileSync(path, 'utf-8');
        },
      });
      Object.entries(flattenI18nEn).forEach(([key]) => {
        if (Object.values(beCheckPathFileMap).every((fileStr: string) => !fileStr.includes(key))) {
          unUseList.push(key);
        }
      });
      if (!unUseList.length) {
        return log('no unUseList');
      }
      log(`unUseList: ${unUseList}`);
      const questions: any = [
        {
          type: 'confirm',
          name: 'DeleteUnUseKey',
          message: 'Delete unused keys?',
          default: true,
        },
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
      writeJSONSync(info.i18nPath[0], unFlattenI18nEn, {
        spaces: 2,
      });
      writeJSONSync(info.i18nPath[1], unFlattenI18nZh, {
        spaces: 2,
      });
      answers.DeleteUnUseKey && log('i18n-optimize success');
    });
}

function flatten(obj: Record<string, any>, prefix = ''): Record<string, any> {
  let result: Record<string, any> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flatten(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

interface FlattenedObject {
  [key: string]: string | number | boolean | null | object;
}

function unFlatten(obj: FlattenedObject): object {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === undefined) {
        current[k] = {};
      }
      current = current[k] as Record<string, any>;
    }

    current[keys[keys.length - 1]] = obj[key];
  });

  return result;
}
