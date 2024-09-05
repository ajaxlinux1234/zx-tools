import { Command } from 'commander';
import { $, Options, Shell } from 'zx';
import dockerBuild from './docker-build';
import dockerDeploy from './docker-deploy';
import dockerReload from './docker-reload';
import pkgDepChange from './pkg-dep-change';
import scaffold from './scaffold';
import translateVue3 from './transform-vue3';
import translate from './translate';
import i18nOptimize from './i18n-optimize';
import version from './version';

const program = new Command();
version(program);
pkgDepChange(program);
dockerReload(program, $);
dockerBuild(program, $);
dockerDeploy(program, $);
scaffold(program, $);
translate(program, $);
translateVue3(program, $);
i18nOptimize(program, $);
program.parse(process.argv);

export type Zx = Shell & Options;
