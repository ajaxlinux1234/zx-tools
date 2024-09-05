import { watch } from 'fs';
import path from 'path';
import { $ } from 'zx';

// 监听指定目录
const directoryPath = path.join(process.cwd(), 'src', 'client');

const watcher = watch(
  directoryPath,
  debounce(async (eventType, filename) => {
    if (filename) {
      console.log(`文件名: ${filename}`);
    }

    switch (eventType) {
      case 'rename':
        console.log('文件或目录被重命名或移动');
        break;
      case 'change':
        console.log('文件内容被修改');
        break;
      default:
        console.log('未知事件');
    }
    try {
      await $`pnpm build`;
    } catch (error) {
      log(`error: ${error}`);
    }
  }, 500),
);

// 错误处理
watcher.on('error', (error) => {
  console.error(`监听时出错:`, error);
});

function debounce(func, wait) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
