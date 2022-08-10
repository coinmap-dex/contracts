const { task } = require("hardhat/config")
const { BigNumber } = require('ethers')

task('accounts', 'Prints the list of accounts', async (_args, hre) => {
	const accounts = await hre.ethers.getSigners();
	for (const account of accounts) {
		console.log(account.address);
	}
});

task("verify", "Test verify")
	.setAction(async (_args, hre) => {
		const dex = (await hre.deployments.get("CoinmapDex")).address
		console.log('CoinmapDex Address:', dex)
		const signer = "0xd82a2a2faaa66d68154edb8cbbfc7c26c2f511dd"
		const signature = "0xf6f507b1e9ef022ddf63745c097436556b0fd7d48a28454906f5f12e744a473b75a7f56ef74d878f19c01cebf4a1cdd0582ef3c35e5a96df2f57c173723ea7541b"
		const cd = await hre.ethers.getContractAt('CoinmapDex', dex)
		const rs = await cd.verify(signer, {
			maker: "0x8ce1780d7C15D747af0BFd8b61F8D11D08BD2A71",
			payToken: "0x8ce1780d7C15D747af0BFd8b61F8D11D08BD2A71",
			buyToken: "0x8ce1780d7C15D747af0BFd8b61F8D11D08BD2A71",
			payAmount: 1000,
			buyAmount: 2000,
			deadline: 1234,
			salt: "0x040df76d63bceff032b130dec597de94f68e0209fca222c2c40d310c79949ec6"
		}, signature);
		console.log(rs)
	})