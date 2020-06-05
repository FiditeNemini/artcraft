import React from 'react';
import './App.css';
import { MainComponent } from './components/MainComponent';
import ApiConfig from './ApiConfig';
import { SentencesComponent } from './components/sentences/SentencesComponent';

const App: React.FC = () => {
  let apiConfig = new ApiConfig();
  //
  //<h1>Neural TTS</h1>
  //<MainComponent apiConfig={apiConfig} />
  //
  return (
    <div className="App">
      <br />
      <SentencesComponent apiConfig={apiConfig} />
    </div>
  );
}

export default App;
