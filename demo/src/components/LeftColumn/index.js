import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { useEagerConnect, useInactiveListener } from "../../hooks/useInjected";
import { injected, supportedChainIds } from "../../configs/connectors";
import { Link, useLocation } from "react-router-dom";
import Create from "./create";

const addBscChain = {
  method: 'wallet_addEthereumChain',
  params: [
    {
      chainId: '0x61',
      chainName: 'BSC Testnet',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
      blockExplorerUrls: ['https://testnet.bscscan.com']
    }]
};

function Menu() {
  const { pathname } = useLocation()
  const context = useWeb3React();
  const {
    connector,
    account,
    activate,
    deactivate,
    chainId,
    library
  } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  const supportedChain = supportedChainIds.includes(chainId)

  return (
    <aside className="column is-one-third leftcolumn is-unselectable">
      <h1 className="title">
        <Link to="/">COINMAP DEX</Link>
      </h1>
      {account && !supportedChain && (
        <button
          style={{ marginBottom: 1 + "em" }}
          className="button is-medium is-info is-fullwidth"
          onClick={() => {
            library.provider.request(addBscChain)
          }}
        >
          <span>Switch to BSC</span>
          <span className="icon is-medium">
            <i className="fas fa-angle-right"></i>
          </span>
        </button>
      )}
      {!account && (
        <button
          style={{ marginBottom: 1 + "em" }}
          className="button is-medium is-success is-fullwidth"
          onClick={() => {
            setActivatingConnector(injected);
            activate(injected);
          }}
        >
          <span>Connect Wallet</span>
          <span className="icon is-medium">
            <i className="fas fa-angle-right"></i>
          </span>
        </button>
      )}
      <div className="container">
        {account && supportedChain && (<>
          <p className="title is-4">
            Welcome,
            <a
              href={`https://bscscan.com/address/${account}`}
              target={"blank_"}
            >{` ${account.substring(0, 6)}...${account.substring(
              account.length - 6
            )}`}</a>
          </p>
          <p className="subtitle is-5">
            <a onClick={() => { deactivate(); }}> logout </a>
          </p>
        </>)}
        <Create />
      </div>
    </aside>
  );
}

export default Menu;
