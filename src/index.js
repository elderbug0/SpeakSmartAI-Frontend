import React from 'react';
import ReactDOM from 'react-dom';
import './styles/tailwind.css';
import AppWrapper from './App';
import { Analytics } from "@vercel/analytics/react"

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper />
    <Analytics />
  </React.StrictMode>,
  document.getElementById('root')
);
