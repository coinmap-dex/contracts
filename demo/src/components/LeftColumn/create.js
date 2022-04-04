import Web3 from "web3";
import axios from "axios";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from '@ethersproject/bignumber'
import useToken from "../../hooks/useToken";
import { useState } from "react";
import { getTokenName } from "../../utils";
import list from "../../configs/list.json";
import core from '../../configs/core.json';

const signData = (maker, payToken, buyToken, payAmount, buyAmount, deadline, salt) => ({
  method: 'eth_signTypedData_v4',
  params: [maker, JSON.stringify({
    domain: {
      name: "CoinmapDex",
      version: "1",
      chainId: 56,
      verifyingContract: core.contracts.CoinmapDex.address
    },
    primaryType: 'Order',
    message: {
      maker, payToken, buyToken, payAmount, buyAmount, deadline, salt
    },
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      Order: [
        { name: "maker", type: "address" },
        { name: "payToken", type: "address" },
        { name: "buyToken", type: "address" },
        { name: "payAmount", type: "uint256" },
        { name: "buyAmount", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "salt", type: "bytes32" },
      ]
    }
  })]
});

function Create(props) {
  const context = useWeb3React();
  const { account, library } = context;

  const [payAmount, setPayAmount] = useState(1);
  const [buyAmount, setBuyAmount] = useState(1);
  const [payToken, setPayToken] = useState(list[4].address);
  const [buyToken, setBuyToken] = useState(list[1].address);
  const { approve, isApproved } = useToken(payToken);

  const [pendingTx, setPendingTx] = useState(null);
  return (
    <div className="columns">
      <div className="column">
        <div class="card" >
          <div class="card-content">
            <article class="media">
              <div class="media-content">
                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">You pay</label>
                  </div>
                  <div class="field-body">
                    <div class="field has-addons">
                      <div class="control  is-expanded">
                        <input class="input is-fullwidth" type="text" placeholder="Amount of money"
                          value={payAmount} onChange={(e) => setPayAmount(parseInt(e.target.value))} />
                      </div>
                      <div class="control">
                        <div class="select ">
                          <select name="payToken"
                            value={payToken} onChange={(e) => { setPayToken(e.target.value) }}>
                            {list.map((v, k) => (<option value={v.address}>{v.name}</option>))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Receive</label>
                  </div>
                  <div class="field-body">
                    <div class="field has-addons">
                      <div class="control  is-expanded">
                        <input class="input is-fullwidth" type="text" placeholder="Amount of money"
                          value={buyAmount} onChange={(e) => setBuyAmount(parseInt(e.target.value))} />
                      </div>
                      <div class="control">
                        <div class="select ">
                          <select name="buyToken"
                            value={buyToken} onChange={(e) => { setBuyToken(e.target.value) }}>
                            {list.map((v, k) => (<option value={v.address}>{v.name}</option>))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Price</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Amount of money" disabled value={buyAmount / payAmount} />
                      </div>
                    </div>
                    <div class="field">
                      <button class="button">
                        <span class="icon">
                          <i class="fa fa-retweet"></i>
                        </span>
                        <span>{getTokenName(buyToken)} per {getTokenName(payToken)}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label">
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <div class="control">
                        {isApproved
                          ? <button
                            className={`button is-info is-fullwidth ${pendingTx ? "is-loading" : ""}`}
                            disabled={payAmount <= 0 || buyAmount <= 0 || payToken == buyToken}
                            onClick={async () => {
                              setPendingTx(true)
                              const deadline = Math.round(Date.now() / 1000) + 7 * 24 * 60 * 60;
                              const salt = Web3.utils.randomHex(32);
                              const pay = BigNumber.from(payAmount).mul('1000000000000000000').toString();
                              const buy = BigNumber.from(buyAmount).mul('1000000000000000000').toString();
                              const sig = await library.provider.request(signData(account, payToken, buyToken, pay, buy, deadline, salt))
                              await axios.post('https://api.dextrading.io/api/v1/limitorder/create', { account, payToken, buyToken, pay, buy, deadline, salt, sig })
                              setPendingTx(false)
                            }}>
                            Submit order
                            </button>
                          : <button
                            className={`button is-link is-fullwidth ${pendingTx ? "is-loading" : ""}`}
                            onClick={async () => {
                              setPendingTx(true)
                              await approve()
                              setPendingTx(false)
                            }}>
                            Approve {getTokenName(payToken)}
                          </button>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Create;