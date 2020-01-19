import React from 'react';
import './App.css';
import { MainComponent } from './components/MainComponent';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Neural TTS</h1>
      <MainComponent />
    </div>
  );
}

export default App;
