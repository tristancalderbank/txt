
function parseQueryString(str) {
    const ret = Object.create(null);

    if (typeof str !== 'string') {
        return ret;
    }

    str = str.trim().replace(/^(\?|#|&)/, '');

    if (!str) {
        return ret;
    }

    str.split('&').forEach((param) => {
        const parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        let key = parts.shift();
        let val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
            ret[key] = val;
        } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        } else {
            ret[key] = [ret[key], val];
        }
    });

    return ret;
}

function getAccessTokenFromUrl() {
    return parseQueryString(window.location.hash).access_token;
}

function getBlobText(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.readAsText(blob);
    });
}

function arrayToMap(array, key) {
    const map = {};
    array.forEach((item) => {
        map[item[key]] = item;
    });

    return map;
}

function sortByAlph(prop, a, b) {
    if (a[prop] > b[prop]) {
        return 1;
    }
    if (a[prop] < b[prop]) {
        return -1;
    }
    return 0;
}

export default {
    getBlobText,
    getAccessTokenFromUrl,
    arrayToMap,
    sortByAlph
}
;
