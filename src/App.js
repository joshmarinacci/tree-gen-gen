import React, {useState} from 'react'
import './App.css'
import {randSpread} from './utils.js'
import {CanvasView} from './CanvasView.js'


class SpreadGenerator {
  constructor(base) {
    this.base = base
    this.spread = 0
  }
  generate(random) {
    return randSpread(random, this.base, this.spread)

  }
}

class FixedGenerator {
  constructor(defaultValue) {
    this.value = defaultValue
  }
  generate(random) {
    return this.value
  }
}


let mainDoc = {
  seed: 'apple',
  title:'a doc',
  maxDepth:{
    _type:'fixed',
    _title:'max depth',
    defaultValue:4,
  },
  trunk: {
    _title: 'Trunk',
    width: {
      _type:'fixed',
      _title:'width',
      defaultValue:10,
    },
    height: {
      _title:'Height',
      _type:'fixed',
      defaultValue:70,
    },
    type: {
      _title:'Shape',
      _type:'pick',
      value:'trapezoid',
      values:['rectangle','trapezoid']
    },
    attenuation: {
      _title:'Attenuation',
      _type:'fixed',
      defaultValue:0.8,
    }
  },
  leaf: {
    _title: 'Leaves',
    size: {
      _title:'Size',
      _type: 'spread',
      defaultValue:20,
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
      defaultValue: 0,
    }
  },
  branch: {
    _title: 'Branches',
    angle: {
      _title:'branch angle',
      _type:'spread',
      defaultValue: 25,
    }
  },
}

function fixup(obj) {
  // console.log("fixing",mainDoc)
  if(obj._type) {
    if(obj._type === 'fixed') {
      obj.gen = new FixedGenerator(obj.defaultValue)
    }
    if(obj._type === 'spread') {
      obj.gen = new SpreadGenerator(obj.defaultValue)
    }
    return
  }

  const keys = Object.keys(obj);
  for(let i=0; i<keys.length; i++) {
    const key = keys[i]
    if(key === 'seed') continue
    if(key === 'title') continue
    if(key === '_title') continue
    if(key === 'gen') continue
    fixup(obj[key])
  }
}

fixup(mainDoc)

const VBox = ({children}) => <div className='vbox'>{children}</div>
const HBox = ({children}) => <div className='hbox'>{children}</div>

const FixedValueEditor = ({def, update}) => {
  return <HBox>
    <label className='title'>{def._title}</label>
    <input type='number' value={def.gen.value}
           onChange={(e)=>{
             def.gen.value = parseFloat(e.target.value)
             update()
           }}
    />
  </HBox>
}

const RandomSpreadEditor = ({def,update}) => {
  return <HBox>
    <label className='title'>{def._title}</label>
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
  if(value === 'spread') {
    def[targetKey]._type = 'spread'
    def[targetKey].gen = new SpreadGenerator(def[targetKey].defaultValue)
  }
  if(value === 'fixed') {
    def[targetKey]._type = 'fixed'
    def[targetKey].gen = new FixedGenerator(def[targetKey].defaultValue)
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
    <button onClick={()=>{
     doc.seed = ""+Math.random()
      update()
    }}>Randomize</button>

    <FixedValueEditor def={doc.maxDepth}  update={update}/>
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
