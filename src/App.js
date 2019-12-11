import React, {useState} from 'react'
import './App.css'
import {CanvasView} from './CanvasView.js'
import {
  GENERATOR_TYPES,
  GENERATOR_LIST,
  fixup, GENERATOR_MAP
} from './generators.js'



let mainDoc = {
  seed: 'apple',
  title:'a doc',
  maxDepth:{
    _type:GENERATOR_TYPES.fixed,
    _title:'max depth',
    defaultValue:4,
  },
  trunk: {
    _title: 'Trunk',
    width: {
      _type:GENERATOR_TYPES.fixed,
      _title:'width',
      defaultValue:10,
    },
    height: {
      _title:'Height',
      _type:GENERATOR_TYPES.fixed,
      defaultValue:70,
    },
    type: {
      _title:'Shape',
      _type:GENERATOR_TYPES.pick,
      defaultValue:'trapezoid',
      values:['rectangle','trapezoid']
    },
    attenuation: {
      _title:'Attenuation',
      _type:GENERATOR_TYPES.fixed,
      defaultValue:0.8,
    }
  },
  leaf: {
    _title: 'Leaves',
    size: {
      _title:'Size',
      _type: GENERATOR_TYPES.spread,
      defaultValue:20,
    },
    type: {
      _title:'shape',
      _type: GENERATOR_TYPES.pick,
      defaultValue:'square',
      values:['square','circle','triangle','ellipse'],
    },
    angle: {
      _title:'Angle',
      _type:GENERATOR_TYPES.spread,
      defaultValue: 0,
    }
  },
  branch: {
    _title: 'Branches',
    angle: {
      _title:'branch angle',
      _type:GENERATOR_TYPES.spread,
      defaultValue: 25,
    }
  },
}


fixup(mainDoc)

const VBox = ({children}) => <div className='vbox'>{children}</div>
const HBox = ({children}) => <div className='hbox'>{children}</div>

const FixedValueEditor = ({def, update}) => {
  return <input type='number' value={def.gen.value}
           onChange={(e)=>{
             def.gen.value = parseFloat(e.target.value)
             update()
           }}
    />
}

const RandomSpreadEditor = ({def,update}) => {
  return <HBox>
    <label className='sub'>base</label>
    <input type='number' value={def.gen.base} onChange={(e) => {
      def.gen.base = parseFloat(e.target.value)
      update()
    }}/>
    <label className='sub'>spread</label>
    <input type='number' value={def.gen.spread}
           onChange={(e) => {
             def.gen.spread = parseFloat(e.target.value)
             update()
           }}
    />
  </HBox>
}

const PickEditor = ({def,update}) => {
  return <select value={def.value} onChange={(e)=>{
    def.gen.value = e.target.value
    update()
  }}>
    {def.values.map(val => {
      return <option value={val} key={val}>{val}</option>
    })}
  </select>
}

const RandomPickEditor = ({def,update}) => {
  return <select value={def.value} onChange={(e)=>{
    def.gen.value = e.target.value
    update()
  }}>
    {def.values.map(val => {
      return <option value={val} key={val}>{val}</option>
    })}
  </select>
}

const TypePicker = ({def, targetKey, update}) => {
  const type = def[targetKey]._type
  return <select value={type} onChange={(e)=>{
    const obj = def[targetKey]
    const cls = GENERATOR_MAP[e.target.value].cls
    obj._type = e.target.value
    obj.gen = new cls(obj.defaultValue, obj.values)
    update()
  }}>
    {GENERATOR_LIST.map((t => {
      return <option key={t.key} value={t.key}>{t.title}</option>
    }))}
  </select>
}

const GroupRow = ({parent, def, targetKey, update}) => {
  let ed = ""
  if(def._type === GENERATOR_TYPES.fixed) {
    ed = <FixedValueEditor key={targetKey} def={def} update={update}/>
  }
  if(def._type === GENERATOR_TYPES.spread) {
    ed = <RandomSpreadEditor key={targetKey} def={def} update={update}/>
  }
  if(def._type === GENERATOR_TYPES.pick) {
    ed = <PickEditor key={targetKey} def={def} update={update}/>
  }
  if(def._type === GENERATOR_TYPES.randomPick) {
    ed = <RandomPickEditor key={targetKey} def={def} update={update}/>
  }
  return <HBox>
    <label>{def._title}</label>
    <TypePicker def={parent} targetKey={targetKey} update={update}/>
    {ed}
  </HBox>
}
const Group = ({def,update}) => {
  const chs = []
  Object.keys(def).forEach((key,i)=>{
    if(key.startsWith('_')) return
    const ch = def[key]
    if(!ch._type) return
    chs.push(<GroupRow key={key} parent={def} def={ch} targetKey={key} update={update}/>)
  })
  return <VBox>
    <b>{def._title}</b>
    {chs}
  </VBox>
}
const DocEditor = ({doc,update}) => {
  return <div className='vbox'>
    <h3>{doc.title}</h3>
    <button onClick={()=>{
     doc.seed = ""+Math.random()
      update()
    }}>Randomize</button>

    <HBox>
      <label>max depth</label>
      <FixedValueEditor def={doc.maxDepth}  update={update}/>
    </HBox>
    <Group def={doc.trunk} update={update}/>
    <Group def={doc.leaf} update={update}/>
    <Group def={doc.branch} update={update}/>
  </div>
}

class Observable {
  constructor(data) {
    this.callbacks = []
    this.data = data
  }
  on(type,cb) {
    this.callbacks.push(cb)
  }
  trigger = (e) => {
    this.callbacks.forEach(cb => cb(e))
  }
}

class CanvasGallery {
  constructor() {
    this.data = []
  }
  add(canvas) {
    this.data.push(canvas.toDataURL())
  }
}


const saver = new Observable()
const gallery = new CanvasGallery()

const Gallery = ({gallery})=>{
  return <ul className='gallery'>
    {gallery.data.map((img,i)=>{
      return <li key={i}><img width={100} height={100} src={img}/></li>
    })}
  </ul>
}

const App = () => {
  const [count, setCount] = useState(0)
  const forceUpdate = ()=>setCount(count+1)
  return (
      <VBox>
        <HBox>
          <DocEditor doc={mainDoc} update={forceUpdate}/>
          <CanvasView doc={mainDoc} saveTrigger={saver} gallery={gallery} update={forceUpdate}/>
          <button onClick={saver.trigger}>save</button>
        </HBox>
        <Gallery gallery={gallery}/>
      </VBox>
  );
}

export default App;
