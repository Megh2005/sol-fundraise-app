const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("TokenModule", (m) => {
  const fund = m.contract("Fundraise");
  return fund;
});

module.exports = DeployModule;
