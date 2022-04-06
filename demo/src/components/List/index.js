import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import useAxios from "../../hooks/useAxios";
import useCoinmapDex from "../../hooks/useCoinmapDex";
import { getTokenName, formatAmount } from "../../utils";

function List() {
  const context = useWeb3React();
  const { account } = context;
  const { response } = useAxios({
    method: 'get',
    url: `https://api.dextrading.io/api/v1/limitorder?account=${account}`,
    headers: JSON.stringify({ accept: '*/*' }),
  });
  const { cancelOrder } = useCoinmapDex();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (response !== null) {
      setData(response);
    }
  }, [response]);

  return (
    <div className="column container">
      <div className="title is-4">YOUR ORDERS</div>

      <table className="table is-bordered is-striped  is-fullwidth">
        <thead>
          <th>Pay Token</th>
          <th>Pay Amount</th>
          <th>Buy Token</th>
          <th>Buy Amount</th>
          <th>Deadline</th>
          <th>Status</th>
        </thead>
        <tbody>
          {data.map((v, k) => {
            return (<tr>
              <td>{getTokenName(v.payToken)}</td>
              <td>{formatAmount(v.payAmount, v.payToken)}</td>
              <td>{getTokenName(v.buyToken)}</td>
              <td>{formatAmount(v.buyAmount, v.buyToken)}</td>
              <td>{new Date(v.deadline * 1000).toGMTString()}</td>
              <td>
                {v.status == 0 &&
                  <span class="tag is-success">
                    Open <button class="delete is-small"
                      onClick={async () => {
                        await cancelOrder(account, v.salt)
                      }}></button>
                  </span>}
                {v.status == 1 && <span class="tag is-primary">Filled</span>}
                {v.status == 2 && <span class="tag is-warning">Canceled</span>}
              </td>
            </tr>)
          })}
        </tbody>
      </table>
    </div>
  );
}

export default List;
