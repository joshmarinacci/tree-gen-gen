import React, {useState} from 'react'
import './App.css';



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
    color: {
      _title:'Hue',
      _type:'fixed',
      value:0.1
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
      base:'20',
      spread:3
    },
    type: {
      _title:'shape',
      _type: 'pick',
      value:'square',
      values:['square','circle','triangle','ellipse'],
    },
    color: {
      _title:'Hue',
      _type:'fixed',
      _kind:'number',
      value:0.5,
      _step:0.1,
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
      base:'25',
      spread:'8'
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
  return <HBox>
    <label className='title'>{def._title}</label>
    <label className='sub'>base</label>
    <input type='number' value={def.base}
           onChange={(e)=>{
             def.base = e.target.value
             update()
           }}
    />
    <label className='sub'>spread</label>
    <input type='number' value={def.spread}
           onChange={(e)=>{
             def.spread = e.target.value
             update()
           }}
    />
  </HBox>
}

const PickEditor = ({def,update}) => {
  return <HBox>
    <label className='title'>{def._title}</label>
    <select>
      {def.values.map(val => {
        return <option value={val} key={val}>{val}</option>
      })}
    </select>
  </HBox>
}

const Group = ({def,update}) => {
  const chs = []
  Object.keys(def).forEach((key,i)=>{
    if(key.startsWith('_')) return
    const ch = def[key]
    if(!ch._type) return
    if(ch._type === 'fixed')  return chs.push(<FixedValueEditor key={key} def={ch} update={update}/>)
    if(ch._type === 'spread')  return chs.push(<RandomSpreadEditor key={key} def={ch} update={update}/>)
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

const App = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <DocEditor doc={mainDoc} update={()=>{
        setCount(count+1)
      }}/>
    </div>
  );
}

export default App;
