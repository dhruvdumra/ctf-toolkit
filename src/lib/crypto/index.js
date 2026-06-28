export * as XOR from './XOR.JS'
export * as SYMMETRIC from './SYMMETRIC.JS'
export * as RSA from './RSA.JS'

import { sym_algos } from './SYMMETRIC.JS'
export const crypto_tools = ['xor', ...sym_algos, 'rsa']
