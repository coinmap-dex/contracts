import { formatEther } from '@ethersproject/units';
import list from "../configs/list.json";

export function getTokenName(address) {
    return list.filter(i => i.address == address)[0].name
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