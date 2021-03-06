const {doSign, verify, generateKeys} = require('./index');

function randomMessage(len) {
    let codes = [];
    for (let i = 0; i < len; i++) {
        codes.push(Math.round(Math.random()*35));
    }
    return codes;
}

const HASH_LEN = 5;
/**
 * hashes string value
 * @param text
 * @returns {Array}
 */
function vsHash(text) {
    let codes = [];
    let pos = 0;
    let partPos = 0;
    for (let i = 0; i < text.length; i++) {
        if (!codes[pos]) codes[pos]=[];
        let code = text[i];
        if (code !== null) {
            codes[pos][partPos] = code;
            partPos += 1;
        }
        if (partPos === HASH_LEN) {
            partPos = 0;
            pos += 1;
        }
    }

    if (partPos) {
        for (let i = 0; i < HASH_LEN - partPos; i++) {
            codes[pos].push(0);
        }
    }

    return [codes.reduce((result, code) => {
        result = result ^ code.reduce((r, v, i) => {
            return r + v * Math.pow(v, i);
        }, 0);
        return result;
    }, 0)];
}

//long test
function longTest() {
    // const params = { q: 208037, p: 6241111, g: 270732 }; //<--good (looks like highest possible q param)
    // const params = { q: 205651, p: 6169531, g: 243430 }; //<-- good
    //need q max 131071? to have 6 digits sign
    // const params = { q: 127481, p: 2294659, g: 262144 }; //<-- good
    // const params  ={ q: 3947, p: 118411, g: 109287 }; //good   <-- most suitable for max (r, s) - 4095 signature to fit in 5 digits (of 36 capacity)
    const params = { q: 1021, p: 153151, g: 45535 }; //good   <-- most suitable for max (r, s) - 1023 signature to fit in 4 digits
    // const params = { q: 1009, p: 932317, g: 730099 };  // r * 2^10 + s for represent
    // const params = { q: 941, p: 103511, g: 51305 }; //good
//const params = generateSharedParams(Math.round(FOUND_PRIMES.length / 3 ), Math.round(FOUND_PRIMES.length * 2 / 3 ));
    console.log('params', params);

    let failCnt = {
        tot: 0,
        fails: 0,
        collisions: 0
    };
    let maxS = 0;
    let maxR = 0;
    let maxPub = 0;
    let maxPri = 0;
    let pubKeys = {
    };

    console.log('********** LONG TEST **********');
    for (let x = 0; x < 5000; x++) {
        let keys = generateKeys(params);
        // if (!x) keys = {"pub":1,"pri":1021};
        maxPri = Math.max(keys.pri, maxPri);
        maxPub = Math.max(keys.pub, maxPub);
        pubKeys[keys.pub] = (pubKeys[keys.pub] || 0) + 1;
        let keyName = '' + x + ': ' + JSON.stringify(keys);
        failCnt[keyName] = { tot: 0, fails: 0, collisions: 0 };
        console.log('*** keys', keyName);
        for (let j = 0; j < 8; j++) {
            let charsName = ''+(10+j)+' chars';
            failCnt[keyName][charsName] = {tot: 0, fails: 0, collisions: 0};

            // if (!x) console.log(charsName)

            for (let i = 0; i < 5000; i++) {
                failCnt.tot += 1;
                failCnt[keyName].tot += 1;
                failCnt[keyName][charsName].tot += 1;

                let fail = false;
                let message = randomMessage(10 + j + 1);

                // if (!x) console.log('sign', message);

                let sign = doSign(params, keys.pri, message, vsHash);
                let messageToTest = message.slice();
                let messageToCollide = randomMessage(10 + j + 1);

                sign.forEach(({r, s}) => {
                    maxR = Math.max(maxR, r);
                    maxS = Math.max(maxS, s);
                });

                // if (!x) console.log('verify', messageToTest);
                if (!verify(params, keys.pub, sign, messageToTest, vsHash)) {
                    console.log(message, sign, 'failed to verify ', messageToTest, i);
                    fail = true;
                }
                // if (!x) console.log('verify', messageToTest);
                if (verify(params, keys.pub, sign, messageToCollide, vsHash)) {
                    // console.log(message, sign, 'failed to verify ', 'SOMEOTHER123', i);
                    if (!failCnt[keyName][charsName]) console.log('*** ', charsName);
                    failCnt.collisions += 1;
                    failCnt[keyName].collisions += 1;
                    failCnt[keyName][charsName].collisions += 1;
                }
                if (fail){
                    if (!failCnt[keyName][charsName]) console.log('*** ', charsName);
                    failCnt.fails += 1;
                    failCnt[keyName].fails += 1;
                    failCnt[keyName][charsName].fails += 1;
                }
            }
        }
    }
    console.log(failCnt);
    console.log('done: total ', failCnt.tot,
        ' failed: ', failCnt.fails,
        ' fail percent: ', failCnt.fails/failCnt.tot*100,
        ' collisions: ', failCnt.collisions,
        ' collision percent: ', failCnt.collisions/failCnt.tot*100
    );
    console.log('maxS: ', maxS, 'maxR: ', maxR, ' maxPub: ', maxPub, ' maxPri: ', maxPri);
    let okDup = Object.keys(pubKeys).filter(key => pubKeys[key] > 1);
    console.log('pubKey dups: ', okDup.length);
}

longTest();

const params = { q: 1021, p: 153151, g: 45535 }; //good   <-- most suitable for max (r, s) - 1023 signature to fit in 4 digits
//let keys = {"pub":858450,"pri":816};
let keys = {"pub":1,"pri":1021};
let sign = 0;


// sign = doSign(params, keys.pri, [1697616], v => v);
// console.log('sign [1697616]', sign);
// console.log(verify(params, keys.pub, sign, [1697616], v => v), 'verify [1697616] ');
//
//
// sign = doSign(params, keys.pri, [1697616, 46656, 1], v => v);
// console.log('sign [1697616, 46656, 1]', sign);
// console.log(verify(params, keys.pub, sign, [1697616, 46656, 1], v => v), 'verify [1697616, 46656, 1] ');
// console.log(verify(params, keys.pub, sign, [1697616, 46656, 2], v => v), 'verify [1697616, 46656, 2] ');
// console.log(verify(params, keys.pub, sign, [1697616, 46651, 1], v => v), 'verify [1697616, 46651, 1] ');
//
//
// sign = doSign(params, keys.pri, '65FLQJTN66SYC78G4', vsHash);
// console.log(vsHash('65FLQJTN66SYC78G4'));
// console.log('sign 65FLQJTN66SYC78G4', sign);
// console.log('verify 65FLQJTN66SYC78G4', verify(params, keys.pub, sign, '65FLQJTN66SYC78G4', vsHash));
// console.log('verify 0123', verify(params, keys.pub, sign, '00123', vsHash));


// sign = doSign(params, keys.pri, '0123-ZTE', vsHash);
// console.log('sign 0123-ZTE', sign);
// console.log('verify 0123-ZTE', verify(params, keys.pub, sign, '0123-ZTE', vsHash));
// console.log('verify 0123ZTE', verify(params, keys.pub, sign, '0123ZTE', vsHash));
// console.log('verify 0123ZTEF', verify(params, keys.pub, sign, '0123ZTEF', vsHash));
// console.log('verify 0123XZTE', verify(params, keys.pub, sign, '0123XZTE', vsHash));
