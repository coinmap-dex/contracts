# Realbox Smart Contract

## Requirement

- Nodejs
- Yarn

## Addresses

BSC Testnet

- RealboxToken: 0x744520afd8046737CF40d3c1268b3Bf9792AF930
- RealboxNFT: 0x30911b392B843c3E08D675E9142F3e77b4eFCAD5
- RealboxVaultFactory: 0x375B3bd0A212e13CDfbf0008cF3fB6b0216a1024

## Setup

Clone the repo

```bash
$ git clone https://github.com/realbox-io/smart-contract contract
$ pushd contract
```

Install dependencies

```bash
$ yarn
```

Compile contract

```bash
$ yarn compile
```

Deploy contract

```bash
$ yarn mainnet:deploy # for bsc mainnet or
$ yarn testnet:deploy # for bsc testnet
```

(Optional) Verify contract

- Sign up for bscscan account: https://bscscan.com/register
- Generate api token: https://bscscan.com/myapikey

```bash
$ export ETHERSCAN_API_KEY=<bscscan_api_token>
$ yarn mainnet:verify # for bsc mainnet or
$ yarn testnet:verify # for bsc testnet
```
