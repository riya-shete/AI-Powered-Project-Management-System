import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './index.css';


function App() {
    return (
        <Router>
          <Routes>
          <Route path="/" element={<Dashboard/>} />
            
          </Routes>
          </Router>
          
      );
  
}

export default App
