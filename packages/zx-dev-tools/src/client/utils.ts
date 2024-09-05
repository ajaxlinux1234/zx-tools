import dayjs from 'dayjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import fsPromises, { stat } from 'fs/promises';
import { remove } from 'fs-extra';
import { chalk, fs } from 'zx';

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);

/** 获取项目package.json */
export const getPkg = (): PackageJSON => {
  log(`process.cwd():${process.cwd()}`);
  const pkgStr = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8');
  const pkg = JSON.parse(pkgStr);
  return pkg;
};

export interface PackageJSON {
  /** 项目名称 */
  name: string;
  /** 项目版本号 */
  version: string;
}

export function log(...args: any[]): void {
  const formattedTime = dayjs().format('YYYY/MM/DD hh:mm:ss');
  const formattedArgs = args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      if ('message' in arg) {
        return arg.message;
      }
      return JSON.stringify(arg);
    }
    return arg;
  });

  console.log(
    `\n${chalk.cyan('[zx-tools]')}`,
    chalk.blue(formattedTime),
    ...formattedArgs.map((arg) => chalk.grey(arg)),
  );
}

/**
 * 递归地复制一个文件夹到另一个位置。
 * @param source - 源文件夹路径。
 * @param destination - 目标文件夹路径。
 */
export async function copyFolder(source: string, destination: string): Promise<void> {
  // 检查目标文件夹是否已存在
  try {
    await access(destination);
  } catch (error) {
    // 如果目标文件夹不存在，则创建它
    try {
      await mkdir(destination, { recursive: true });
    } catch (mkdirError) {
      console.error(`Error creating directory ${destination}:`, mkdirError);
    }
  }

  const files = await readdir(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    if (file === '.git') {
      continue; // 忽略 .git 目录
    }
    try {
      const stats = await stat(sourcePath);
      if (stats.isDirectory()) {
        // 如果是文件夹，则递归复制
        await copyFolder(sourcePath, destPath);
      } else {
        // 如果是文件，则直接复制
        await copyFile(sourcePath, destPath);
      }
    } catch (error) {
      console.error(`Error copying file ${sourcePath}:`, error);
    }
  }
}

// 日志装饰器
export function fnLog(target: any, propertyKey: any, descriptor?: PropertyDescriptor): any {
  if (descriptor) {
    // 这是一个实例方法
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      log(`${propertyKey} start`);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.then((res) => {
            log(`${propertyKey} end`);
            return res;
          });
        } else {
          log(`${propertyKey} end`);
          return result;
        }
      } catch (e) {
        console.error(`${propertyKey} end with error: ${e}`);
        throw e;
      }
    };
  } else {
    // 这是一个静态方法或属性
    const originalMethod = target[propertyKey];
    target[propertyKey] = function (...args: any[]) {
      log(`${propertyKey} start`);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.then((res) => {
            log(`${propertyKey} end`);
            return res;
          });
        } else {
          log(`${propertyKey} end`);
          return result;
        }
      } catch (e) {
        console.error(`${propertyKey} end with error: ${e}`);
        throw e;
      }
    };
  }
  return descriptor;
}

// 类装饰器
export function Logger(target: Function) {
  // 遍历类的原型上的所有方法
  for (let key of Object.getOwnPropertyNames(target.prototype)) {
    if (key !== 'constructor') {
      let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
      if (descriptor && typeof descriptor.value === 'function') {
        Object.defineProperty(target.prototype, key, fnLog(target.prototype, key, descriptor));
      }
    }
  }
  // 遍历类自身的所有方法
  for (let key of Object.getOwnPropertyNames(target)) {
    if (typeof target[key] === 'function') {
      target[key] = log(target, key);
    }
  }
}

// 异步检查目录是否存在
export async function createDirIfNotExists(dirPath: string) {
  try {
    await fsPromises.access(dirPath);
    log(`目录已存在: ${dirPath}`);
    await remove(dirPath);
    log(`删除目录: ${dirPath}`);
  } catch (err) {
    log(`${dirPath}不存在`);
  } finally {
    // 如果目录不存在，则创建
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      log(`成功创建目录: ${dirPath}`);
    } catch (mkdirErr) {
      console.error('创建目录失败:', mkdirErr);
    }
  }
}

export const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 定义文本文件扩展名的正则表达式
const isTextFile = /\.(json|js|ts|css|less|html?|tsx?|jsx?|sass|svg)$/;

// 定义文件信息接口
interface FileInfo {
  isTextFile: boolean;
  preFile?: string;
  nextFile?: string;
}

/**
 * 递归地读取目录中的文件，并处理文件或目录。
 * @param dir - 目录路径。
 * @param options - 可选参数。
 * @param level - 递归层级，如果为数字且小于0则停止递归。
 * @param list - 文件列表。
 * @returns 文件列表。
 */
export function readDirFile(
  dir: string,
  options: {
    ignorePath?: string | string[];
    onDir?: (path: string) => boolean;
    onFile?: (path: string, fileInfo: FileInfo) => void;
  },
  level?: number,
  list: string[] = [],
): string[] {
  if (!fs.existsSync(dir)) {
    return list;
  }

  if (typeof level === 'number' && level < 0) {
    return list;
  }

  const stat = fs.statSync(dir);
  const files = stat.isDirectory() ? fs.readdirSync(dir) : [''];

  let ignorePath = options.ignorePath || [
    path.resolve(process.cwd(), '.git'),
    path.resolve(process.cwd(), 'node_modules'),
  ];
  if (typeof ignorePath === 'string') {
    ignorePath = ignorePath.split(',');
  }
  ignorePath = ignorePath
    .filter((i) => i.trim())
    .map((i) => i.split(path.sep))
    .map((i) => i.join('/'));

  files.forEach((filename, index) => {
    let pathname = path.resolve(dir, filename);
    const stat = fs.statSync(pathname);
    pathname = pathname.split(path.sep).join('/');

    if (ignorePath.some((i) => pathname.includes(i))) {
      return;
    }

    if (stat.isDirectory()) {
      const result = typeof options.onDir === 'function' ? options.onDir(pathname) : true;
      if (result !== false) {
        readDirFile(pathname, options, typeof level === 'number' ? level - 1 : level, list);
      }
    } else if (stat.isFile()) {
      if (typeof options.onFile === 'function') {
        const prePath = (files[index - 1] ? path.resolve(dir, files[index - 1]) : null) || '';
        const nextPath = (files[index + 1] ? path.resolve(dir, files[index + 1]) : null) || '';
        options.onFile(pathname, {
          isTextFile: !!pathname.match(isTextFile),
          preFile: prePath,
          nextFile: nextPath,
        });
      }
      list.push(pathname);
    }
  });

  return list;
}

/**
 * 替换文件中的内容。
 * @param filePath - 文件路径。
 * @param searchValue - 要查找的字符串或正则表达式。
 * @param replaceValue - 替换的新值。
 */
export async function replaceFileContent(
  filePath: string,
  searchValue: string | RegExp | ((str: string) => string),
  replaceValue?: string,
): Promise<void> {
  try {
    // 读取文件内容
    const data = await fs.promises.readFile(filePath, 'utf-8');

    // 按行分割
    const lines = data.split('\n');

    // 替换每一行的内容
    const updatedLines = (
      typeof searchValue === 'function'
        ? lines.map((line) => searchValue(line))
        : lines.map((line) => line.replace(searchValue, replaceValue || ''))
    ).filter((one) => one !== ' ');

    // 重新组合
    const updatedData = updatedLines.join('\n');

    // 写回文件
    await fs.promises.writeFile(filePath, updatedData, 'utf-8');
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * 递归地读取目录中的文件，并处理文件或目录。
 * @param dir - 目录路径。
 * @param options - 可选参数。
 * @param level - 递归层级，如果为数字且小于0则停止递归。
 * @param list - 文件列表。
 * @returns 文件列表。
 */
export async function asyncReadDirFile(
  dir: string,
  options: {
    ignorePath?: string | string[];
    onDir?: (path: string) => boolean | Promise<boolean>;
    onFile?: (path: string, fileInfo: FileInfo) => void | Promise<void>;
  },
  level?: number,
  list: string[] = [],
): Promise<string[]> {
  if (!(await fs.stat(dir)).isDirectory()) {
    return list;
  }

  if (typeof level === 'number' && level < 0) {
    return list;
  }

  let ignorePath = options.ignorePath || [
    path.resolve(process.cwd(), '.git'),
    path.resolve(process.cwd(), 'node_modules'),
  ];

  if (typeof ignorePath === 'string') {
    ignorePath = ignorePath.split(',');
  }
  ignorePath = ignorePath
    .filter((i) => i.trim())
    .map((i) => i.split(path.sep))
    .map((i) => i.join('/'));

  const files = await fs.readdir(dir);

  for (const filename of files) {
    let pathname = path.resolve(dir, filename);
    const stat = await fs.stat(pathname);
    pathname = pathname.split(path.sep).join('/');

    if (ignorePath.some((i) => pathname.includes(i))) {
      continue;
    }

    if (stat.isDirectory()) {
      const result = typeof options.onDir === 'function' ? await options.onDir(pathname) : true;
      if (result !== false) {
        await asyncReadDirFile(
          pathname,
          options as any,
          typeof level === 'number' ? level - 1 : level,
          list,
        );
      }
    } else if (stat.isFile()) {
      if (typeof options.onFile === 'function') {
        const prePath =
          (files[files.indexOf(filename) - 1]
            ? path.resolve(dir, files[files.indexOf(filename) - 1])
            : null) || '';
        const nextPath =
          (files[files.indexOf(filename) + 1]
            ? path.resolve(dir, files[files.indexOf(filename) + 1])
            : null) || '';

        await options.onFile(pathname, {
          isTextFile: !!pathname.match(/\.json$/),
          preFile: prePath,
          nextFile: nextPath,
        });
      }
      list.push(pathname);
    }
  }

  return list;
}
