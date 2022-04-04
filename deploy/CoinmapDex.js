module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

  await deploy("CoinmapDex", {
    from: deployer,
    args: [PANCAKE_ROUTER, deployer],
    log: true,
  })
}

module.exports.tags = ["CoinmapDex"]