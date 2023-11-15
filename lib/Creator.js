const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const Inquirer = require("inquirer");
const ora = require("ora");
const { GET_REPOS, GET_TAGS } = require("./api");
const util = require("util");
const figlet = require("figlet");
// const downloadGitRepo = require("download-git-repo"); //GitHub下载
const downloadGitRepo = require("gitee-repo");//码云下载
const { copyDir } = require("../utils/copy.js");

const cwd = process.cwd();
class Creator {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = options;
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }
  // 创建
  async create() {
    const isOverwrite = await this.handleDirectory();
    if (!isOverwrite) return;
    await this.getCollectRepo(); // 远程拉取

    // 下面注释部分：从tag版本下载模板。async
    // 仓库信息 —— 模板信息
    // let repo = await this.getRepoInfo();
    // // tag信息 —— 版本信息
    // let tag = await this.getTagInfo(repo);
    // // 下载模板
    // await this.downloadTemplate1(repo, tag);
    // // 模板下载成功后提示
    // this.showTemplateHelp()
  }
  // 获取模板信息及用户选择的模板
  // async getRepoInfo() {
  //   // 获取组织下的仓库信息
  //   const loading = ora("waiting for fetching template...");
  //   loading.start();
  //   const { data: repoList } = await GET_REPOS();
  //   loading.succeed();

  //   if (!repoList) return;
  //   // 提取仓库名
  //   const repos = repoList.map((item) => item.name);
  //   // 选取模板信息
  //   let { repo } = await new Inquirer.prompt([
  //     {
  //       name: "repo",
  //       type: "list",
  //       message: "Please choose a template to create project",
  //       choices: repos,
  //     },
  //   ]);
  //   return repo;
  // }
  // 获取tag版本信息及用户选择的版本
  // async getTagInfo(repo) {
  //   const loading = ora("waiting for fetching version...");
  //   loading.start();
  //   const res = await GET_TAGS(repo);
  //   loading.succeed();
  //   if (!res) return;
  //   const tags = res.data && res.data.map((item) => item.name);
  //   // 选取模板信息
  //   let { tag } = await new Inquirer.prompt([
  //     {
  //       name: "tag",
  //       type: "list",
  //       message: "Please choose a version to create project",
  //       choices: tags,
  //     },
  //   ]);
  //   return tag;
  // }
  // 下载仓库tag
  async downloadTemplate1(repo, tag) {
    // git仓库简写方式
    // GitHub - github:owner/name 或者 owner/name
    // GitLab - gitlab:owner/name
    // GitHub - gitee:owner/name 或者 owner/name
    // 模板下载地址
    const templateUrl = `gitee:ytanck/${repo}${tag ? "#" + tag : ""}`;
    const loading = ora("downloading template, please wait...");
    loading.start();
    // 调用 downloadGitRepo 方法将对应模板下载到指定目录
    await this.downloadGitRepo(
      templateUrl,
      path.resolve(process.cwd(), path.join(cwd, this.projectName))
    );
    loading.succeed();
  }
  // 下载仓库template
  async downloadTemplate2(choiceTemplateName) {
    const owner = "ytanck";
    // const owner = "ytking";
    const templateUrl = `${owner}/${choiceTemplateName}`;
    const loading = ora("正在拉取模版...");
    const beginTime = new Date().getTime();
    loading.start();
    await this.downloadGitRepo(
      templateUrl,
      path.join(cwd, this.projectName),
      (err) => {
        if (!err) {
          loading.succeed();
          const time = (new Date().getTime() - beginTime) / 1000;
          console.log(chalk.green(`create project finish in ${time}s`));
          this.showTemplateHelp();
        } else {
          console.log(err);
          loading.fail("request fail, Please try later...");
          ora("远程拉取失败,将从本地template复制模板!");
          this.copyLocalTemplate(); // 本地复制
        }
      }
    );
  }

  // 获取可拉取的仓库列表
  async getCollectRepo() {
    const loading = ora("正在获取模版信息...");
    loading.start();
    try {
      const { data: list } = await GET_REPOS(/* { per_page: 100 } */); //仓库信息
      // const { data: list } = await GET_TAGS('仓库名');//tags信息
      loading.succeed();
      const reposTemplate = list.filter((item) => item.name.includes('template'));//gitee仓库包含template的
      // const reposTemplate = list.filter((item) => item.is_template && item.name);//github拉取设置template了的repo
      let { choiceTemplateName } = await new Inquirer.prompt([
        {
          name: "choiceTemplateName",
          type: "list",
          message: "请选择模版",
          choices: reposTemplate,
        },
      ]);
      console.log("选择了模版：" + choiceTemplateName);
      this.downloadTemplate2(choiceTemplateName);
    } catch (error) {
      console.log(error);
      loading.fail('远程拉取失败,将从本地template复制模板')
      this.copyLocalTemplate();
    }
  }
  // 处理是否有相同目录
  async handleDirectory() {
    const targetDirectory = path.join(cwd, this.projectName);
    // 如果目录中存在了需要创建的目录
    if (fs.existsSync(targetDirectory)) {
      // --force参数强制删除重名目录
      if (this.options.force) {
        await fs.remove(targetDirectory);
      } else {
        let { isOverwrite } = await new Inquirer.prompt([
          // 返回值为promise
          {
            name: "isOverwrite",
            type: "list",
            message: "是否强制覆盖已存在的同名目录？",
            choices: [
              {
                name: "覆盖",
                value: true,
              },
              {
                name: "不覆盖",
                value: false,
              },
            ],
          },
        ]);
        if (isOverwrite) {
          await fs.remove(targetDirectory);
        } else {
          console.log(chalk.red.bold("不覆盖文件夹，创建终止"));
          return false;
        }
      }
    }
    return true;
  }
  // 模版创建成功后的提示
  showTemplateHelp() {
    console.log(
      `\r\nSuccessfully created project ${chalk.cyan(this.projectName)}`
    );
    console.log(`\r\n  cd ${chalk.cyan(this.projectName)}\r\n`);
    console.log("  npm install");
    console.log("  npm run dev\r\n");
    console.log(`
        \r\n
        ${chalk.green.bold(
          figlet.textSync("OK", {
            font: "isometric4",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
          })
        )}
    `);
  }
  // 从本地templates复制
  async copyLocalTemplate() {
    let { type } = await new Inquirer.prompt([
      // 返回值为promise
      {
        name: "type", // 与返回值对应
        type: "list", // list 类型
        message: "Please choose a template!",
        choices: [{ name: "vue" }, { name: "react" }],
      },
    ]);
    copyDir(
      path.resolve(__dirname, `../templates/${type}`),
      path.resolve(process.cwd(), this.projectName),
      (err) => {
        if (!err) {
          ora().succeed("copy template success!");
        } else {
          ora().fail("copy template fail!");
        }
      }
    );
  }
}
module.exports = Creator;
