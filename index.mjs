#!/usr/bin/env zx
import { program } from 'commander/esm.mjs';
const modules = import.meta.glob('./lib/*.mjs')

for (const path in modules) {
  const module = await modules[path]();
  module.default(program)
}
program.parse(process.argv)