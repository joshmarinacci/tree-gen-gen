import {randSpread} from './utils.js'

export class SpreadGenerator {
    constructor(base,_skip,obj) {
        this.base = base
        this.spread = 0
        if(obj && 'base' in obj) this.base = obj.base
        if(obj && 'spread' in obj) this.spread = obj.spread
    }
    generate(random) {
        return randSpread(random, this.base, this.spread)
    }
}

export class FixedGenerator {
    constructor(defaultValue,_skip,obj) {
        this.value = defaultValue
        if(obj && 'value' in obj) this.value = obj.value
    }
    generate(random) {
        return this.value
    }
}

export class FixedPickGenerator {
    constructor(defaultValue, values,obj) {
        this.value = defaultValue
        this.values = values
        if(obj && 'value' in obj) this.value = obj.value
    }
    generate(random) {
        return this.value
    }
}

export class RandomPickGenerator {
    constructor(defaultValue, values, obj) {
        this.value = defaultValue
        this.values = values
        if(obj && 'value' in obj) this.value = obj.value
    }
    generate(random) {
        const n = Math.floor(random()*this.values.length)
        return this.values[n]
    }
}

export class RangeGenerator {
    constructor(min,max,obj) {
        this.min = min
        this.max = max
        if(obj && 'min' in obj) this.min = obj.min
        if(obj && 'max' in obj) this.max = obj.max
    }
    generate(random) {
        return this.min + random()*(this.max-this.min)
    }
}


export const GENERATOR_TYPES = {
    fixed: 'fixed',
    spread:'spread',
    pick:'pick',
    randomPick: 'randomPick',
    range:'range',

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
    },
    {
        cls:RangeGenerator,
        title:'Within Range',
        key:GENERATOR_TYPES.range
    }
]

export const GENERATOR_MAP = {}
GENERATOR_LIST.forEach(el => GENERATOR_MAP[el.key] = el)


export function fixup(obj) {
    if(obj._type) {
        const cls = GENERATOR_MAP[obj._type].cls
        obj.gen = new cls(obj.defaultValue, obj.values,obj)
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
