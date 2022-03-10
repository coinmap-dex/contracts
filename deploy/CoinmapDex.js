module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  await deploy("CoinmapDex", {
    from: deployer,
    args: [deployer],
    log: true,
  })
}

module.exports.tags = ["CoinmapDex"]