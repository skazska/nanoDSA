const nums = require('./small-numbers');
const FOUND_PRIMES = require('./found-primes.js');
//const FOUND_PRIMES = primeRange(9999999);

/**
 * finds q for p
 * @param p
 * @returns {number}
 */
function findQ(p) {
    let factors = Object.keys(nums.factorizeHash(p - 1));

    if (factors.length <= 3) return 0;

    return parseInt(factors[Math.round(Math.random() * (factors.length - 1))]);
}

/**
 * DSA params
 * @param {number} pPrimeIdxMin - leftmost prime number in FOUND_PRIMES (array of prime numbers) to pick prime (defaults to FOUND_PRIMES.length / 2)
 * @param {number} pPrimeIdxMax - rightmost prime number in FOUND_PRIMES (array of prime numbers) to pick prime (defaults to FOUND_PRIMES.length)
 * @returns {{q: number, p: number, g: number}}
 */
function generateSharedParams(pPrimeIdxMin, pPrimeIdxMax) {
    // Decide on a key length L and N. This is the primary measure of the cryptographic strength of the key. The original DSS constrained L to be a multiple of 64 between 512 and 1,024 (inclusive). NIST 800-57 recommends lengths of 2,048 (or 3,072) for keys with security lifetimes extending beyond 2010 (or 2030), using correspondingly longer N.[10] FIPS 186-3 specifies L and N length pairs of (1,024, 160), (2,048, 224), (2,048, 256), and (3,072, 256).[4] N must be less than or equal to the output length of the hash H.
    // Choose an N-bit prime q.
    // Choose an L-bit prime p such that p − 1 is a multiple of q.
    // Choose g, a number whose multiplicative order modulo p is q. This means that q is the smallest positive integer such that gq=1 mod p. This may be done by setting g = h(p − 1)/q mod p for some arbitrary h (1 < h < p − 1), and trying again with a different h if the result comes out as 1. Most choices of h will lead to a usable g; commonly h = 2 is used.
    // The algorithm parameters (p, q, g) may be shared between different users of the system.

    let p = 0;
    let q = 0;
    let g = 0;
    let pPrimeIdxUtilize = {};
    pPrimeIdxMin = pPrimeIdxMin || Math.round(FOUND_PRIMES.length / 2 );
    pPrimeIdxMax = pPrimeIdxMax || Math.round(FOUND_PRIMES.length );
    let minQ = Math.round(FOUND_PRIMES[pPrimeIdxMin] / 20);
    while (q < minQ && q < 502000) {
        let pPrimeIdx = pPrimeIdxMin + Math.round(Math.random() * (pPrimeIdxMax - pPrimeIdxMin));

        if (pPrimeIdxUtilize[pPrimeIdx]) continue;

        pPrimeIdxUtilize[pPrimeIdx] = true;
        p = FOUND_PRIMES[pPrimeIdx];

        q = findQ(p);
    }

    const pow = (p - 1) / q;
    for (let h = 2; h < p - 1; h++) {
        g = nums.modPow(h, pow, p);
        if (g !== 1) break;
    }

    return {
        q: q,
        p: p,
        g: g
    }
}

module.exports = {
    generateSharedParams: generateSharedParams
}