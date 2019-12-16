export function xmur3(str) {
    if(!str) str = 'noseed'
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}
export function sfc32(a, b, c, d) {
    return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}
export const toRad = (deg) => deg/180*Math.PI
export const randRange = (random, min, max) => min + random()*(max-min)
export const randSpread = (random, base, spread) => randRange(random,base-spread,base+spread)

// https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
export function hsvToRgb(h, s, v){
    let r, g, b

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

export function hsvToCanvas(h, s, v) {
    const rgb = hsvToRgb(h,s,v)
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}



export class Observable {
    constructor(data) {
        this.callbacks = []
        this.data = data
    }
    on(type,cb) {
        this.callbacks.push(cb)
    }
    off(type,cb) {
        this.callbacks = this.callbacks.filter(n => n !== cb)
    }
    trigger = (e) => {
        this.data = e
        this.callbacks.forEach(cb => cb(e))
    }
    getData() {
        return this.data
    }
    setData(data) {
        this.data = data
        console.log("updating data without triggering listeners")
    }
}
