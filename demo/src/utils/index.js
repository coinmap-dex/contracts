import { formatEther, formatUnits } from '@ethersproject/units';
import { tokens } from "../configs/list.json";
import { BigNumber } from '@ethersproject/bignumber'

export function getTokenName(address) {
    return tokens.filter(i => i.address == address)[0].symbol
}

export function amountToBN(amount, token) {
    const decimals = tokens.filter(i => i.address == token)[0].decimals
    return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals));
}

export function formatAmount(x, token, f = 4) {
    const decimals = tokens.filter(i => i.address == token)[0].decimals
    let s = formatUnits(x, decimals);
    const dot = s.indexOf(".");
    if (dot >= 0) s = s.substr(0, dot + 1 + f);
    return s;
}

export function formatBalance(x, f = 4) {
    let s = formatEther(x);
    const dot = s.indexOf(".");
    if (dot >= 0) s = s.substr(0, dot + 1 + f);
    return s;
}

export function numberWithCommas(x) {
    if (!x) return "0";
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}