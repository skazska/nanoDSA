const myNumbers = require('./small-numbers');

/**
 * non strict implementation of DSA
 * used sources:
 * https://en.wikipedia.org/wiki/Digital_Signature_Algorithm
 * http://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf
 *
 */

/**
 * generates private and public keys
 * @param {{q: number, p: number, g: number}} params - shared DSA params, can be generated with shared-params.generateSharedParams, all parties should use same params
 * @returns {{pub: number, pri: number}}
 */
function generateKeys(params) {
    //Choose a secret key x by some random method, where 0 < x < q.
    //Calculate the public key y = g ^ x mod p.

    let priKey = 0;
    let pubKey = 0;

    do {
        priKey = params.q - Math.round(Math.random() * params.q * 3 / 4);
        pubKey = myNumbers.modPow(params.g, priKey, params.p);
    } while (pubKey < 100);

    return {
        pub: pubKey,
        pri: priKey
    }
}

/**
 * generates digital signature for data and hash function using private key and shared DSA params
 * @param {{q: number, p: number, g: number}} params shared DSA params
 * @param {{number}} xKey - private key
 * @param {string} message - data to sign
 * @param {function} generateHash - hash function (should accept {string} and return [number])
 * @returns {[{r: number, s: number}]}
 */
function doSign(params, xKey, message, generateHash) {
    // Let H be the hashing function and m the message:
    // Generate a random per-message value k where 1<k<q
    // Calculate r = (g^k mod p) mod q
    // In the unlikely case that r=0, start again with a different random k
    // Calculate s = k^(-1) * ( H (m) + xr) mod q
    // In the unlikely case that s=0, start again with a different random k
    // The signature is (r,s)
    // The first two steps amount to creating a new per-message key. The modular exponentiation here is the most
    // computationally expensive part of the signing operation, and it may be computed before the message hash is known.
    // The modular inverse k^(-1) mod q is the second most expensive part, and it may also be computed before the
    // message hash is known. It may be computed using the extended Euclidean algorithm or using Fermat's little theorem
    // as k^(q-2) mod q .

    let hash = generateHash(message);

    return hash.map(h => {
        let done = false;
        let r = 0;
        let s = 0;
        do {
            let k = 0;
            let kInverse = 0;

            do {
                // Generate a random per-message value k where 1<k<q
                k = params.q - Math.round(Math.random() * params.q);

                // Calculate r = (g^k mod p) mod q
                r = myNumbers.modPow(params.g, k, params.p) % params.q;

                // Calculate s = (k^(-1) * ( H (m) + xKey * r)) mod q
                // (k^(-1) x) mod q -- if q is prime --> x^(q-2) mod q
                if (r) kInverse = myNumbers.mInverse(k, params.q);

            } while (r === 0 || kInverse === 0); // In the unlikely case that r=0, start again with a different random k

            // Calculate s = (k^(-1) * ( H (m) + xKey * r)) mod q
            s = ( h + 1 + xKey * r ) * kInverse % params.q;
            if (s) done = true;
        } while (!done);
        return {r: r, s: s}
    });
}

/**
 * verifies digital signature for data and hash function using public key and shared DSA params
 * @param {{q: number, p: number, g: number}} params shared DSA params
 * @param {{number}} yKey - public key
 * @param {[{r: number, s: number}]} sign - digital signature
 * @param {string} message - data to sign
 * @param {function} generateHash - hash function (should accept {string} and return [number])
 * @returns {boolean}
 */
function verify(params, yKey, sign, message, generateHash) {
    // Reject the signature if 0<r<q or 0<s<q is not satisfied.
    // Calculate w = s ^ (-1) mod q
    // Calculate u_1 = H(m) * w mod q
    // Calculate u_2 = r * w mod q
    // Calculate v = ( (g^u_1 * y^u_2) mod p) mod q
    // The signature is valid if and only if v = r
    const hash = generateHash(message);
    if (sign.length !== hash.length) return false;

    return sign.every(({r, s}, i) => {
        if (!(0 < r && r < params.q && 0 < s && s < params.q)) return false;

        let w = myNumbers.mInverse(s, params.q);
        let u2 = r * w % params.q;
        let keyU2Mod = myNumbers.modPow(yKey, u2, params.p);

        let h = hash[i];
        if (h === null) return false;

        let u1 = (h + 1) * w % params.q;
        let v = ((myNumbers.modPow(params.g, u1, params.p) * keyU2Mod) % params.p) % params.q;

        return v === r;
    });

}

module.exports = {
    doSign: doSign,
    verify: verify,
    generateKeys: generateKeys
};
