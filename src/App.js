import React, {Component, useState} from 'react'
import './App.css';
import {hsvToCanvas, randRange, randSpread, sfc32, toRad, xmur3} from './utils.js'


class SpreadGenerator {
  constructor(base, spread) {
    this.base = base
    this.spread = 0
  }
  generate(random) {
    return randSpread(random, this.base, this.spread)

  }
}

let mainDoc = {
  title:'a doc',
  maxDepth:{
    _type:'fixed',
    _title:'max depth',
    value:4
  },
  trunk: {
    _title: 'Trunk',
    width: {
      _type:'fixed',
      _title:'width',
      value:10,
    },
    height: {
      _title:'Height',
      _type:'fixed',
      value:70,
    },
    type: {
      _title:'Shape',
      _type:'pick',
      value:'trapezoid',
      values:['rectangle','trapezoid']
    },
    attenuation: {
      _title:'Attenuation',
      _type:'spread',
      base:0.8,
      spread:0.1,
    }
  },
  leaf: {
    _title: 'Leaves',
    size: {
      _title:'Size',
      _type: 'spread',
      defaultValue:20,
      gen: new SpreadGenerator(20),
    },
    type: {
      _title:'shape',
      _type: 'pick',
      value:'square',
      values:['square','circle','triangle','ellipse'],
    },
    angle: {
      _title:'Angle',
      _type:'spread',
      base:0,
      spread:45,
    }
  },
  branch: {
    _title: 'Branches',
    angle: {
      _type:'spread',
      base:25,
      spread:8
    }
  },
}

const VBox = ({children}) => <div className='vbox'>{children}</div>
const HBox = ({children}) => <div className='hbox'>{children}</div>

const FixedValueEditor = ({def, update}) => {
  return <div className='hbox'>
    <label className='title'>{def._title}</label>
    <input type='number'
         value={def.value}
         onChange={(e)=>{
           def.value = e.target.value
           update()
         }}
    />
  </div>
}

const RandomSpreadEditor = ({def,update}) => {
  if(def.gen) {
    return <HBox>
      <label className='sub'>base</label>
      <input type='number' value={def.gen.base} onChange={(e) => {
        def.gen.base = parseFloat(e.target.value)
        update()
      }}/>
      <label className='sub'>spread</label>
      <input type='number' value={def.gen.spread}
             onChange={(e)=>{
               def.gen.spread = parseFloat(e.target.value)
               update()
             }}
      />
    </HBox>
  }
  return <HBox>
    <label className='title'>{def._title}</label>
    <label className='sub'>base</label>
    <input type='number' value={def.base}
           onChange={(e)=>{
             def.base = parseFloat(e.target.value)
             update()
           }}
    />
    <label className='sub'>spread</label>
    <input type='number' value={def.spread}
           onChange={(e)=>{
             def.spread = parseFloat(e.target.value)
             update()
           }}
    />
  </HBox>
}

const PickEditor = ({def,update}) => {
  return <HBox>
    <label className='title'>{def._title}</label>
    <select value={def.value} onChange={(e)=>{
      def.value = e.target.value
      update()
    }}>
      {def.values.map(val => {
        return <option value={val} key={val}>{val}</option>
      })}
    </select>
  </HBox>
}

function changeGeneratorType(def, targetKey, value) {
  console.log("changing to",def,targetKey,value)
  const old = def[targetKey]
  if(value === 'spread') {
    def[targetKey] = {
      _title: old._title,
      _type: 'spread',
      base:old.value,
      spread:0,
    }
  }
  if(value === 'fixed') {
    def[targetKey] = {
      _title: old._title,
      _type: 'fixed',
      value:old.base,
    }
  }
}

const TypePicker = ({def, targetKey, update}) => {
  const type = def[targetKey]._type
  return <select value={type} onChange={(e)=>{
    changeGeneratorType(def,targetKey,e.target.value)
    update()
  }}>
    <option>fixed</option>
    <option>spread</option>
  </select>
}

const Group = ({def,update}) => {
  const chs = []
  Object.keys(def).forEach((key,i)=>{
    if(key.startsWith('_')) return
    const ch = def[key]
    if(!ch._type) return
    if(ch._type === 'fixed')  {
      const ed = <FixedValueEditor key={key} def={ch} update={update}/>
      const typePicker = <TypePicker def={def} targetKey={key} update={update}/>
      const wrapper = <HBox key={key}>{typePicker}{ed}</HBox>
      chs.push(wrapper)
      return
    }
    if(ch._type === 'spread')  {
      const ed = <RandomSpreadEditor key={key} def={ch} update={update}/>
      const typePicker = <TypePicker def={def} targetKey={key} update={update}/>
      const wrapper = <HBox key={key}>{typePicker}{ed}</HBox>
      chs.push(wrapper)
      return
    }
    if(ch._type === 'pick')  return chs.push(<PickEditor key={key} def={ch} update={update}/>)
  })
  return <VBox>
    <b>{def._title}</b>
    {chs}
  </VBox>
}
const DocEditor = ({doc,update}) => {
  return <div className='vbox'>
    <h3>{doc.title}</h3>
    <FixedValueEditor def={doc.maxDepth}  update={update}/>
    <Group def={doc.trunk} update={update}/>
    <Group def={doc.leaf} update={update}/>
    <Group def={doc.branch} update={update}/>
  </div>
}

const PHASES = {
  TRUNK:'TRUNK',
  LEAF:'LEAF'
}

class CanvasView extends Component {
  componentDidMount() {
    this.redraw()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.redraw()
  }
  render() {
    return <canvas ref={(canvas)=>this.canvas = canvas} width={300} height={300}/>
  }

  redraw() {
    const ctx = this.canvas.getContext('2d')
    this.ctx = ctx
    const w = this.canvas.width
    const h = this.canvas.height
    //background
    ctx.fillStyle = '#cccccc'
    ctx.fillRect(0,0,w,h)

    //floor
    ctx.fillStyle = '#d0d0d0'
    ctx.fillRect(0,h-10,w,10)
    this.props.doc.seed = 'apple';//""+Math.random()

    // draw the two phases
    this.firstTrunk(PHASES.TRUNK,this.props.doc)
    this.firstTrunk(PHASES.LEAF,this.props.doc)
  }

  firstTrunk(phase,opts) {
    const w = this.canvas.width
    const h = this.canvas.height
    this.phase = phase
    this.ctx.save()
    this.ctx.translate(w/2,h-10)
    this.ctx.scale(1,-1)
    const seed = xmur3(opts.seed)
    opts.random =sfc32(seed(),seed(),seed(),seed())
    let width = opts.trunk.width.value
    let height = opts.trunk.height.value

    // opts.trunk.color.value = randRange(opts.random,0,1)
    // opts.leaf.color.value = 1.0-opts.trunk.color.value
    // if(opts.leaf.color.value < 0) opts.leaf.color.value = opts.leaf.color.value + 1.0
    const o2 = {
      trunkColor: randRange(opts.random,0,1),
    }
    o2.leafColor = 1.0-o2.trunkColor
    if(o2.leafColor < 0) o2.leafColor = o2.leafColor + 1.0
    this.trunk(this.ctx, width, height, opts.maxDepth.value, opts, o2)
    this.ctx.restore()

  }

  branch(ctx, w, h,depth, opts,o2) {
    const angle = toRad(opts.branch.angle.base)
    const spread = toRad(opts.branch.angle.spread)
    ctx.save()
    ctx.rotate(randSpread(opts.random,+angle,spread))
    this.trunk(ctx,w,h,depth-1, opts,o2)
    ctx.restore()
    ctx.save()
    ctx.rotate(randSpread(opts.random,-angle,spread))
    this.trunk(ctx,w,h,depth-1, opts,o2)
    ctx.restore()
  }

  trunk(ctx, w, h, depth, opts, o2) {
      const nw = w * opts.trunk.attenuation.base
      const nh = h * randSpread(opts.random,opts.trunk.attenuation.base,opts.trunk.attenuation.spread)

      if(this.phase === PHASES.TRUNK) {
        const step = 0.5/opts.maxDepth.value
        ctx.fillStyle = hsvToCanvas(o2.trunkColor,0.8,1.0-depth*step)
        if(opts.trunk.type.value === 'rectangle') {
          ctx.fillRect(-w / 2, 0, w, nh)
        }
        if(opts.trunk.type.value === 'trapezoid') {
          ctx.beginPath()
          ctx.moveTo(-w/2,0)
          ctx.lineTo(-nw/2,nh)
          ctx.lineTo(nw/2,nh)
          ctx.lineTo(w/2,0)
          ctx.fill()
        }
      }
      ctx.save()
      ctx.translate(0,nh)
      if(depth === 0) this.leaf(ctx,nw, nh,opts,o2)
      if(depth > 0) this.branch(ctx,nw,nh,depth, opts,o2)
      ctx.restore()
  }

  leaf(ctx, w,h, opts,o2) {
    ctx.save()
    const angle = randSpread(opts.random,opts.leaf.angle.base, opts.leaf.angle.spread)
    ctx.rotate(toRad(angle))
    const sat = randSpread(opts.random,0.5,0.2)
    ctx.fillStyle = hsvToCanvas(o2.leafColor,sat,1.0)
    let s = 0
    if(opts.leaf.size.gen) {
      s = opts.leaf.size.gen.generate(opts.random)
    } else {
      randSpread(opts.random, opts.leaf.size.base, opts.leaf.size.spread)
    }
    if(s <0) s = 0

    if(this.phase !== PHASES.LEAF) {
      return ctx.restore()
    }
    if(opts.leaf.type.value === 'square') {
      ctx.fillRect(-s, -s, s * 2, s * 2)
    }
    if(opts.leaf.type.value === 'circle') {
      ctx.beginPath()
      ctx.arc(0,0,s,0,toRad(360))
      ctx.fill()
    }
    if(opts.leaf.type.value === 'triangle') {
      ctx.beginPath()
      for(let i=0; i<=3; i++) {
        let theta = toRad(360/3*i)
        let x = s*Math.sin(theta)
        let y = s*Math.cos(theta)
        if(i === 0) ctx.moveTo(x,y)
        ctx.lineTo(x,y)
      }
      ctx.fill()
    }
    if(opts.leaf.type.value === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(0,0,s,s/2,0,0,toRad(360))
      ctx.fill()
    }
    ctx.restore()
  }

}

const App = () => {
  const [count, setCount] = useState(0)
  return (
    <HBox>
      <DocEditor doc={mainDoc} update={()=> setCount(count+1)}/>
      <CanvasView doc={mainDoc}/>
    </HBox>
  );
}

export default App;
