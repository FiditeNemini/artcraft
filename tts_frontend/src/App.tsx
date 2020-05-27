import React from 'react';
import './App.css';
import { MainComponent } from './components/MainComponent';
import ApiConfig from './ApiConfig';

const App: React.FC = () => {
  let apiConfig = new ApiConfig();
  return (
    <div className="App">
      <h1>Neural TTS</h1>
      <MainComponent apiConfig={apiConfig} />
    </div>
  );
}

export default App;
