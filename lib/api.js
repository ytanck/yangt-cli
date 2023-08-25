const axios = require("axios");
const https = require("https");

// 在 axios 请求时，选择性忽略 SSL
const agent = new https.Agent({
  rejectUnauthorized: false,
});



// 获取仓库信息
const getRepoList = (params) => {
  return axios({
    url: "https://api.github.com/users/ytking/repos",
    // url: "https://gitee.com/api/v5/users/ytanck/repos",
    params,
    method: "GET",
    // httpsAgent: agent,
  });
};
// 获取仓库的Tags信息
const getRepoTags = (repo) => {
  return axios.get(`https://gitee.com/api/v5/repos/ytanck/${repo}/tags`);
};
module.exports = {
  getRepoList,
  getRepoTags,
};
