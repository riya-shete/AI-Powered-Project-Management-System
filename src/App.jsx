import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LandingPage from './pages/LandingPage';

import Dashboard from './pages/Dashboard';
import SprintsPage from './pages/Sprint_section'
import Task_dashboard from './pages/Task_dashboard'
import Bugs_queue_section from './pages/Bugs_queue_section'
import RetrospectiveComponent from './pages/Retrospective'
import NotificationsDemo from './components/notitication'
import Feed from './components/update_feed'
import './index.css';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import ForgotPassword from "./pages/ForgotPassword";
import PurposeSelection from "./pages/PurposeSelection";
import TeamInvite from "./pages/TeamInvite";
import SprintTasks from "./pages/SprintTasks";
import Integrations from "./pages/Integrations";
import TaskBoardColumns from "./pages/TaskBoardColumns";
import WorkspaceName from "./pages/WorkspaceName";
function App() {
    return (
        <Router>
          <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/Login" element={<Login/>} />
          <Route path="/SignIn" element={<SignIn/>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/purpose-selection" element={<PurposeSelection />} />
          <Route path="/TeamInvite" element={<TeamInvite />} />
          <Route path="/SprintTasks" element={<SprintTasks />} />
          <Route path="/Integrations" element={<Integrations/>} />
          <Route path="/TaskBoardColumns" element={<TaskBoardColumns/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/sprintspage" element={<SprintsPage/>} />
          <Route path="/taskdashboard" element={<Task_dashboard/>} />
          <Route path="/bugsqueue" element={<Bugs_queue_section/>} />
          <Route path="/retrospective" element={<RetrospectiveComponent/>} />
          <Route path="/notification" element={<NotificationsDemo/>}/>
          <Route path="/feed" element = {<Feed/>}/>
          <Route path="/WorkspaceName" element = {<WorkspaceName/>}/>

          </Routes>
          </Router>
          
      );
  
}

export default App