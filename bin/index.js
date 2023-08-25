#!/usr/bin/env node
console.log("我是入口文件....");
const program = require("commander");
const chalk = require("chalk");
const Inquirer = require("inquirer");
// 获取create模块
const createModel = require("../lib/create");
// 给提示增加
program.on("--help", () => {
  console.log();
  console.log(
    `Run ${chalk.cyan(
      "yang <command> --help"
    )} for detailed usage of given command.
  `
  );
});
program
  .command("create <project-name>")
  .description("create a new project")
  .option("-f, --force", "overwrite target directory if it exists")
  .option("-a, --all", "just only for test")
  .action((projectName, options) => {
    // 引入create模块，并传入参数
    createModel(projectName, options);
    //   // 获取一些项目信息
    // Inquirer
    //   .prompt([
    //     {
    //       name: "author",
    //       message: "你的名字是：",
    //     },
    //     {
    //       name: "version",
    //       message: "版本号",
    //       default: "1.0.0",
    //     },
    //     {
    //       name: "description",
    //       message: "项目描述",
    //       default: "a web project template with Babel & ESLint",
    //     },
    //   ])
    //   .then((res) => {
    //     // 拿到信息参数
    //     console.log(123,res);
    //   });
  });

// 获取当前版本号
const version = require("../package.json").version;

program
  // 配置脚手架名称
  .name("yang")
  // 配置命令格式
  .usage(`<command> [option]`)
  // 配置版本号
  .version(version);

program.parse(process.argv);
