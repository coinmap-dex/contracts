import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from "@web3-react/core";
import { useMemo } from 'react';
import core from '../configs/core.json';
import { supportedChainIds } from '../configs/connectors';
import erc20abi from '../utils/erc20abi.json';

// account is not optional
export function getSigner(library, account) {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library, account) {
    return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address, ABI, library, account) {
    return new Contract(address, ABI, getProviderOrSigner(library, account))
}

// returns null on errors
export function useContract(address, ABI, withSignerIfPossible = true) {
    const { library, account, chainId } = useWeb3React()
    return useMemo(() => {
        if (!address || !ABI || !library) return null
        if (!supportedChainIds.includes(chainId)) return null
        try {
            return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [address, ABI, library, withSignerIfPossible, account])
}

export function useErc20TokenContract(address) {
    return useContract(address, erc20abi, true)
}

export function useCoinmapDexContract() {
    const c = core.contracts.CoinmapDex;
    return useContract(c.address, c.abi, true)
}
