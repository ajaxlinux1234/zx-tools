function translateVue3(program, $) {
  program.command("translate-vue3").option("-n, --name <string>", "name of service").description("translate vue3 project").action(async (info) => {
  });
}

export { translateVue3 as default };
