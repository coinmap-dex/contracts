import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from 'react';
import useAxios from "../../hooks/useAxios";
import { getTokenName, formatBalance } from "../../utils";

function List() {
  const context = useWeb3React();
  const { account } = context;
  const { response } = useAxios({
    method: 'get',
    url: `https://api.dextrading.io/api/v1/limitorder?account=${account}`,
    headers: JSON.stringify({ accept: '*/*' }),
  });
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
              <td>{formatBalance(v.payAmount)}</td>
              <td>{getTokenName(v.buyToken)}</td>
              <td>{formatBalance(v.buyAmount)}</td>
              <td>{new Date(v.deadline * 1000).toGMTString()}</td>
              <td><span class="tag is-success">
                Open
                <button class="delete is-small"></button>
              </span></td>
            </tr>)
          })}
        </tbody>
      </table>
    </div>
  );
}

export default List;
