import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Results from './Results';
import './styles/tailwind.css';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
