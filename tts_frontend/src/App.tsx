import React from 'react';
import './App.css';
import { MainComponent } from './components/MainComponent';
import ApiConfig from './ApiConfig';
import { SentencesComponent } from './components/sentences/SentencesComponent';
import { ModeSelector } from './components/ModeSelector';
import { ModalComponent } from './components/ModalComponent';

const App: React.FC = () => {
  let apiConfig = new ApiConfig();
  //
  //<h1>Neural TTS</h1>
  //<MainComponent apiConfig={apiConfig} />
  //
  return (
    <div className="App">
      <ModalComponent apiConfig={apiConfig} />
    </div>
  );
}

export default App;
