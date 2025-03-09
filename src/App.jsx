import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './index.css';
import SignIn from './pages/SignIn';
import ForgotPassword from "./pages/ForgotPassword";
import PurposeSelection from "./pages/PurposeSelection";
import TeamInvite from "./pages/TeamInvite";
import SprintTasks from "./pages/SprintTasks";
import Integrations from "./pages/Integrations";
import TaskBoardColumns from "./pages/TaskBoardColumns";

function App() {
    return (
        <Router>
          <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/SignIn" element={<SignIn/>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/purpose-selection" element={<PurposeSelection />} />
          <Route path="/TeamInvite" element={<TeamInvite />} />
          <Route path="/SprintTasks" element={<SprintTasks />} />
          <Route path="/Integrations" element={<Integrations/>} />
          <Route path="/TaskBoardColumns" element={<TaskBoardColumns/>} />
          </Routes>
          </Router>
          
      );
  
}

export default App
