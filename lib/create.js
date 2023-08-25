const Creator = require("./Creator");

module.exports = async function (projectName, options) {
  const creator = new Creator(projectName, options);
  await creator.create();
};