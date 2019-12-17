import React, {useEffect, useState} from 'react'
import './App.css'
import {CanvasView} from './CanvasView.js'
import {
  GENERATOR_TYPES,
  GENERATOR_LIST,
  fixup, GENERATOR_MAP
} from './generators.js'
import {Observable} from './utils.js'

let mainDoc = new Observable()

function setupTreeDoc() {
  console.log("setting up the tree doc")

  let doc = {
    algorithm:'tree',
    seed: 'apple',
    title: 'a doc',
    maxDepth: {
      _type: GENERATOR_TYPES.fixed,
      _title: 'max depth',
      defaultValue: 4,
    },
    trunk: {
      _title: 'Trunk',
      width: {
        _type: GENERATOR_TYPES.fixed,
        _title: 'width',
        defaultValue: 10,
      },
      height: {
        _title: 'Height',
        _type: GENERATOR_TYPES.fixed,
        defaultValue: 70,
      },
      type: {
        _title: 'Shape',
        _type: GENERATOR_TYPES.pick,
        defaultValue: 'trapezoid',
        values: ['rectangle', 'trapezoid']
      },
      attenuation: {
        _title: 'Attenuation',
        _type: GENERATOR_TYPES.fixed,
        defaultValue: 0.8,
      }
    },
    leaf: {
      _title: 'Leaves',
      size: {
        _title: 'Size',
        _type: GENERATOR_TYPES.spread,
        defaultValue: 20,
      },
      type: {
        _title: 'shape',
        _type: GENERATOR_TYPES.pick,
        defaultValue: 'square',
        values: ['square', 'circle', 'triangle', 'ellipse'],
      },
      angle: {
        _title: 'Angle',
        _type: GENERATOR_TYPES.spread,
        defaultValue: 0,
      }
    },
    branch: {
      _title: 'Branches',
      angle: {
        _title: 'branch angle',
        _type: GENERATOR_TYPES.spread,
        defaultValue: 25,
      }
    },
  }
  fixup(doc)
  mainDoc.trigger(doc)
}

function setupMountainDoc() {
  const doc = {
    algorithm: 'mountain',
    title:'a mountain',
    main: {
      rows: {
        _type: GENERATOR_TYPES.fixed,
        _title: 'row',
        defaultValue: 4,
      },
      hue: {
        _type: GENERATOR_TYPES.fixed,
        _title:'hue',
        defaultValue: 0.0,
      },
      length: {
        _type: GENERATOR_TYPES.fixed,
        _title:'length',
        defaultValue: 30,
      },
      peakHeight: {
        _type: GENERATOR_TYPES.range,
        _title:'peak height',
        defaultValue: 100,
        values:120,
      }
    }
  }
  fixup(doc)
  mainDoc.trigger(doc)
}

function setupPosition2DDoc() {
  const doc = {
    version:1,
    algorithm: 'position2d',
    title:'a mountain',
    main: {
      count: {
        _type: GENERATOR_TYPES.fixed,
        _title: 'count',
        defaultValue: 4,
      },
      shape: {
        _title: 'Shape',
        _type: GENERATOR_TYPES.pick,
        defaultValue: 'rectangle',
        values: ['rectangle', 'circle']
      },
      x: {
        _type: GENERATOR_TYPES.fixed,
        _title:'x',
        defaultValue: 0.0,
      },
      y: {
        _type: GENERATOR_TYPES.fixed,
        _title:'y',
        defaultValue: 0.0,
      },
      size: {
        _type: GENERATOR_TYPES.fixed,
        _title:'size',
        defaultValue: 10.0,
      },
      hue: {
        _type: GENERATOR_TYPES.fixed,
        _title:'hue',
        defaultValue: 180,
      },
      saturation: {
        _type: GENERATOR_TYPES.fixed,
        _title:'saturation',
        defaultValue: 100,
      },
      lightness: {
        _type: GENERATOR_TYPES.fixed,
        _title:'lightness',
        defaultValue: 50,
      },
    }
  }
  fixup(doc)
  mainDoc.trigger(doc)
}

const VBox = ({children}) => <div className='vbox'>{children}</div>
const HBox = ({children}) => <div className='hbox'>{children}</div>

const FixedValueEditor = ({def, update}) => {
  return <input type='number' value={def.gen.value}
           onChange={(e)=>{
             def.gen.value = parseFloat(e.target.value)
             def.value = def.gen.value
             update()
           }}
    />
}

const RandomSpreadEditor = ({def,update}) => {
  return <HBox>
    <label className='sub'>base</label>
    <input type='number' value={def.gen.base} onChange={(e) => {
      def.gen.base = parseFloat(e.target.value)
      def.base = def.gen.base
      update()
    }}/>
    <label className='sub'>spread</label>
    <input type='number' value={def.gen.spread}
           onChange={(e) => {
             def.gen.spread = parseFloat(e.target.value)
             def.spread = def.gen.spread
             update()
           }}
    />
  </HBox>
}

const RangeEditor = ({def,update}) => {
  return <HBox>
    <label className='sub'>min</label>
    <input type='number' value={def.gen.min} onChange={(e) => {
      def.gen.min = parseFloat(e.target.value)
      def.min = def.gen.min
      update()
    }}/>
    <label className='sub'>max</label>
    <input type='number' value={def.gen.max}
           onChange={(e) => {
             def.gen.max = parseFloat(e.target.value)
             def.max = def.gen.max
             update()
           }}
    />
  </HBox>
}

const PickEditor = ({def,update}) => {
  return <select value={def.value} onChange={(e)=>{
    def.gen.value = e.target.value
    def.value = def.gen.value
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
    def.value = def.gen.value
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
  if(def._type === GENERATOR_TYPES.range) {
    ed = <RangeEditor key={targetKey} def={def} update={update}/>
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
  const children = Object.keys(doc).map(key => {
    if(key === 'title') return <h3 key={key}>{doc.title}</h3>
    if(key === 'algorithm') return ""
    if(key === 'seed') return ""
    if(key === 'maxDepth') return <HBox key={key}>
            <label>max depth</label>
            <FixedValueEditor def={doc.maxDepth}  update={update}/>
          </HBox>
    return <Group key={key} def={doc[key]} update={update}/>
  })

  return <VBox>
    <button onClick={()=>{
     doc.seed = ""+Math.random()
      update()
    }}>Randomize</button>
    {children}
  </VBox>
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
const exporter = new Observable()
const gallery = new CanvasGallery()

exporter.on("click",()=>{
  // console.log("exporting",gallery.data)
  const canvas = document.createElement('canvas')
  const dim = 400
  const w = gallery.data.length*dim
  const h = dim
  canvas.width = w
  canvas.height = h
  console.log("exporting",w,h)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'red'
  ctx.fillRect(0,0,w,h)
  gallery.data.forEach((url,i) => {
    const img = new Image()
    img.src = url
    ctx.drawImage(img,i*dim,0)
  })
  let url = canvas.toDataURL()
  // url = url.replace(/^data:image\/png/,'data:application/octet-stream');
  console.log(url)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gallery.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
})

const Gallery = ({gallery})=>{
  return <ul className='gallery'>
    {gallery.data.map((img,i)=>{
      return <li key={i}><img width={100} height={100} src={img}/></li>
    })}
  </ul>
}

// setupTreeDoc()
// setupMountainDoc()
setupPosition2DDoc()

let MAIN_DOC_KEY = 'maindoc'
function loadPersisted(data) {
  try {
    let item = JSON.parse(localStorage.getItem(MAIN_DOC_KEY))
    console.log("found", item)
    if (!item) return data
    if (!item.version) return data
    if (item.version < data.version) return data
    console.log("using persisted version", item)
    fixup(item)
    localStorage.clear()
    return item
  } catch(e) {
    console.log("error parsing",e.message)
    console.log(e)
    return data
  }
}

mainDoc.setData(loadPersisted(mainDoc.getData()))

function persist(data) {
  localStorage.setItem(MAIN_DOC_KEY,JSON.stringify(data))
}

const App = () => {
  const [count, setCount] = useState(0)
  const [doc, setDoc] = useState(mainDoc.getData())
  useEffect(() => {
    const handler = () => {
      setDoc(mainDoc.getData(0))
    }
    mainDoc.on('change',handler)
    return () => mainDoc.off('change',handler)
  })
  const forceUpdate = ()=>{
    setCount(count+1)
    persist(mainDoc.getData())
  }
  return (
      <VBox>
        <HBox>
          <button onClick={setupTreeDoc}>tree</button>
          <button onClick={setupMountainDoc}>mountains</button>
          <button onClick={saver.trigger}>save</button>
          <button onClick={exporter.trigger}>export gallery</button>
        </HBox>
        <HBox>
          <DocEditor doc={doc} update={forceUpdate}/>
          <CanvasView doc={doc} saveTrigger={saver} gallery={gallery} update={forceUpdate}/>
        </HBox>
        <Gallery gallery={gallery}/>
      </VBox>
  );
}

export default App;
