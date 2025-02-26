import React from 'react';
import './App.css';
import ImageToPdfConverter from './ImageToPdfConverter';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Image to PDF Converter</h1>
      </header>
      <main className="App-main">
        <ImageToPdfConverter />
      </main>
      <footer className="App-footer">
        <p>Created with React</p>
      </footer>
    </div>
  );
}

export default App;