import { useCallback, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { useErc20TokenContract } from "./useContracts";
import useReadLocalStorage from "./useReadLocalStorage";

const useToken = (address) => {
  const { account } = useWeb3React();
  const token = useErc20TokenContract(address)

  const [isApproved, setApprove] = useState(false)
  const blocknumber = useReadLocalStorage('blocknumber')

  const fetchAllowance = useCallback(async () => {
    if (token) {
      const allowance = await token.allowance(account, '0x0bAD3B7B185974c0DF0C346aB0A3bb9e8cE15580')
      setApprove(allowance.gt("1000000000000000000"));
    }
  }, [account, token, blocknumber])

  useEffect(() => {
    fetchAllowance()
  }, [fetchAllowance, account, token, blocknumber])

  const approve = useCallback(
    async () => {
      try {
        return await token?.approve('0x0bAD3B7B185974c0DF0C346aB0A3bb9e8cE15580', "1000000000000000000000000")
      } catch (e) {
        console.error(e)
        return null
      }
    },
    [token]
  )

  return { isApproved, approve, blocknumber }
}

export default useToken
