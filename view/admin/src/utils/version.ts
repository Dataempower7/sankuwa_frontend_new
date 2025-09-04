const { VITE_IS_MERCHANT, VITE_IS_PRO, VITE_IS_OVERSEAS, VITE_IS_B2B } = import.meta.env;
//是否多商户
export function isMerchant() {
    return VITE_IS_MERCHANT == 1;
}
//是否企业版
export function isPro() {
    return VITE_IS_PRO == 1;
}
//是否跨境版
export function isOverseas() {
    return VITE_IS_OVERSEAS == 1;
}
//是否跨境版
export function isB2b() {
    return VITE_IS_B2B == 1;
}