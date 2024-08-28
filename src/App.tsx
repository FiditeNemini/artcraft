import { useState } from 'react'
import { signal } from "@preact/signals-react";

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const countSignal = signal(0);
const setCountSignal = (callback: (current:number)=>number)=>{
  countSignal.value = callback(countSignal.value);
}

function App() {
  const [countState, setCountState] = useState(0)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex'>
        <a className="grow" href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo size-full" alt="Vite logo" />
        </a>
        <a className="grow"  href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react size-full" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="flex gap-2">
        <button onClick={() => setCountState((count) => count + 1)}>
          state count is {countState}
        </button>
        <button onClick={() => setCountSignal((count) => count + 1)}>
          signal count is {countSignal.value}
        </button>
      </div>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
