function encodeCharCode2Int36(v) {
    return (0 <= v && v < 10) ? (v + 48) : ((10 <= v && v < 36) ? v + 55 : null);
}

function decodeCharCode2Int36(d) {
    return (47 < d && d < 58) ? (d - 48) : ((63 < d && d < 91) ? d - 55 : null);
}

const LEN = 5;
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
        let code = decodeCharCode2Int36(text.charCodeAt(i));
        if (code !== null) {
            codes[pos][partPos] = code;
            partPos += 1;
        }
        if (partPos === LEN) {
            partPos = 0;
            pos += 1;
        }
    }

    if (partPos) {
        for (let i = 0; i < LEN - partPos; i++) {
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

module.exports = {
    vsHash: vsHash,
    decodeCharCode2Int36: decodeCharCode2Int36,
    encodeCharCode2Int36: encodeCharCode2Int36
};