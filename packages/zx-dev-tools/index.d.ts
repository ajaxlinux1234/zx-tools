declare const module: any;

export = module;

declare global {
  interface ImportMeta {
    glob: any; // 将 any 替换为 glob 属性的实际类型
  }
}
