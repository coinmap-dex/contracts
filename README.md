# Coinmap-Dex Smart Contract

CoinmapDex platform allows users create limit order for any token on BSC network. The order information will be stored off-chain. CoinmapDex bot will continuously monitor the price of token on PancakeSwap and execute the order as soon as the price satisfied (with small fee).

This repository contains the on-chain contract that will execute swap requests using DEX platform and send platform fee to CoinmapDex treasury (fee rate is configurable by contract owner with maximum limit to 5%)

The contract does not hold user fund (token is not locked). User only need to approve and has enough token on time the price satisfied. User can cancel an order anytime using an on-chain transaction.

## Requirement

- Nodejs
- Yarn

## Setup

- Clone the repo

```bash
$ git clone https://github.com/coinmap-dex/contracts
$ pushd contracts
```

- Install dependencies

```bash
$ yarn
```

- Compile contract

```bash
$ yarn compile
or
$ yarn compile --force
```

You expect to see artifacts folder generated

- Deploy contract

```bash
$ yarn mainnet:deploy # for bsc mainnet or
$ yarn testnet:deploy # for bsc testnet
```

- Run the test

```bash
$ yarn test
```

- (Optional) Verify contract

- Sign up for bscscan account: https://bscscan.com/register
- Generate api token: https://bscscan.com/myapikey

```bash
$ export ETHERSCAN_API_KEY=<bscscan_api_token>
$ yarn mainnet:verify # for bsc mainnet or
$ yarn testnet:verify # for bsc testnet
```
