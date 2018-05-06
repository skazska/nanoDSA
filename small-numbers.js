const FOUND_PRIMES = require('./found-primes');

/**
 * non strict implementation of some number theory algorithms
 * used sources:
 * https://en.wikipedia.org/wiki/Modular_exponentiation
 * https://stackoverflow.com
 *
 */

/**
 * returns base ^ exponent % modulus
 * @param base
 * @param exponent
 * @param modulus
 * @returns {number}
 */
function modPow(base, exponent, modulus) {

    let result = 1;

    while (exponent > 0) {
        if ((exponent & 1) === 1) {
            // multiply in this bit's contribution while using modulus to keep result small
            result = (result * base) % modulus;
        }
        // move to the next bit of the exponent, square (and mod) the base accordingly
        exponent = exponent >>> 1;
        base = (base * base) % modulus;
    }

    return result;
}

// console.log('4 pow 1 mod 7', modPow(4, 1, 7));
// console.log('4 pow 2 mod 7', modPow(4, 2, 7));
// console.log('4 pow 3 mod 7', modPow(4, 3, 7));
// console.log('4 pow 4 mod 7', modPow(4, 4, 7));


/**
 * returns multiplicative order of *base* modulo *modulus*
 * @param base
 * @param modulus
 * @param max
 * @returns {number}
 */
function mOrder(base, modulus, max) {
    for (let i = 1; i < max || Number.MAX_SAFE_INTEGER; i++) {
        if (modPow(base, i, modulus) === 1) return i;
    }
    return 0;
}

// console.log('4 mOrd 7', mOrder(4, 7, 20));

/**
 * find prime multipliers of number
 * n - number
 * addFactor - multiplier processor
 */
function factorize(n, addFactor) {
    let remainder = 0;
    let i = 0;
    let multiplier = FOUND_PRIMES[i];

    //go through prime multipliers
    while (multiplier <= n) {
        do {
            remainder = n % multiplier;
            if (!remainder) {
                n /= multiplier;
                addFactor(multiplier);
            }
        } while (!remainder);
        multiplier = FOUND_PRIMES[++i];
    }
}

/**
 * returns all prime multipliers in array
 * @param n
 * @returns {Array}
 */
function factorizeArray(n) {
    let factors = [];
    factorize(n, factor => {
        factors.push(factor);
    });
    return factors;
}

/**
 * returns multipliers as counts in hash
 * @param n
 */
function factorizeHash(n) {
    let factors = {};
    factorize(n, factor => {
        if (factors[factor]) {
            factors[factor] += 1;
        } else {
            factors[factor] = 1;
        }
    });
    return factors;
}

/**
 * evals multiplicative modulo inverse
 *     This algorithm or an algorithm that produces an equivalent result shall be used to compute the
 *     multiplicative inverse z–1 mod a, where 0 < z < a, 0 < z–1 < a, and a is a prime number. In this
 *     Standard, z is either k or s, and a is either q or n.
 *
 * @param k The value to be inverted mod a (i.e., either k or s).
 * @param q domain parameter and (prime) modulus (i.e., either q or n).
 * @returns {{status: boolean, inverse: number}} status and k^(–1) The multiplicative inverse of k mod q, if it exists.
 */
function mInverse (k, q) {
//     1. Verify that q and k are positive integers such that k < q; if not, return an ERROR
//     indication.
//     2. Set i = q, j = k, y2 = 0, and y1 = 1.
//     3. quotient = [ i/j ].
//     4. remainder = i –( j * quotient).
//     5. y = y2 –(y1 * quotient).
//     6. Set i = j, j = remainder, y2 = y1, and y1 = y.
//     7. If (j > 0), then go to step 3.
//     8. If (i ≠ 1), then return an ERROR indication.
//     9. Return SUCCESS and y2 mod q.

    //asuming q is prime  this solution can be reduced to inverse = k^(q-2) mod q
    // noinspection UnnecessaryLocalVariableJS
    // console.log(''+k+' mInverse '+q, inverse, ',  '+inverse+' * '+k+' mod '+q, inverse*k%q);

    return modPow(k, (q-2), q);
}


// console.log('2 factorize', factorizeArray(2));
// console.log('3 factorize', factorizeArray(3));
// console.log('4 factorize', factorizeArray(4));
// console.log('5 factorize', factorizeHash(5));
// console.log('6 factorize', factorizeHash(6));
// console.log('7 factorize', factorizeHash(7));

module.exports = {
    modPow: modPow,
    mOrder: mOrder,
    factorize: factorize,
    factorizeHash: factorizeHash,
    factorizeArray: factorizeArray,
    mInverse: mInverse
};