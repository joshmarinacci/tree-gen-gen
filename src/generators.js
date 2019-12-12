import {randSpread} from './utils.js'

export class SpreadGenerator {
    constructor(base) {
        this.base = base
        this.spread = 0
    }
    generate(random) {
        return randSpread(random, this.base, this.spread)
    }
}

export class FixedGenerator {
    constructor(defaultValue) {
        this.value = defaultValue
    }
    generate(random) {
        return this.value
    }
}

export class FixedPickGenerator {
    constructor(defaultValue, values) {
        this.value = defaultValue
        this.values = values
    }
    generate(random) {
        return this.value
    }
}

export class RandomPickGenerator {
    constructor(defaultValue, values) {
        this.value = defaultValue
        this.values = values
    }
    generate(random) {
        const n = Math.floor(random()*this.values.length)
        return this.values[n]
    }
}


export const GENERATOR_TYPES = {
    fixed: 'fixed',
    spread:'spread',
    pick:'pick',
    randomPick: 'randomPick'

}
export const GENERATOR_LIST = [
    {
        cls: FixedGenerator,
        title:'Fixed Number',
        key:GENERATOR_TYPES.fixed
    },
    {
        cls: SpreadGenerator,
        title:'Spread Number',
        key:GENERATOR_TYPES.spread
    },
    {
        cls: FixedPickGenerator,
        title:'Pick One',
        key:GENERATOR_TYPES.pick
    },
    {
        cls:RandomPickGenerator,
        title:'Pick One Randomly',
        key:GENERATOR_TYPES.randomPick
    }
]

export const GENERATOR_MAP = {}
GENERATOR_LIST.forEach(el => GENERATOR_MAP[el.key] = el)


export function fixup(obj) {
    if(obj._type) {
        const cls = GENERATOR_MAP[obj._type].cls
        obj.gen = new cls(obj.defaultValue, obj.values)
        return
    }

    const keys = Object.keys(obj);
    for(let i=0; i<keys.length; i++) {
        const key = keys[i]
        if(key === 'seed') continue
        if(key === 'title') continue
        if(key === 'algorithm') continue
        if(key === '_title') continue
        if(key === 'gen') continue
        fixup(obj[key])
    }
}
