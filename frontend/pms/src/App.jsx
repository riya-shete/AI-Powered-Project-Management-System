import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Documentation from './pages/Documentation';
import LandingPage from './pages/LandingPage';
import Help from './pages/Help';
import Dashboard from './pages/Dashboard';
import SprintsPage from './pages/Sprint_section'
import Task_dashboard from './pages/Task_dashboard'
import Bugs_queue_section from './pages/Bugs_queue_section'
import RetrospectiveComponent from './pages/Retrospective'
import NotificationsDemo from './components/notitication'
import Feed from './components/notitication'
import './index.css';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import ForgotPassword from "./pages/ForgotPassword";
import PurposeSelection from "./pages/PurposeSelection";
import TeamInvite from "./pages/TeamInvite";
import SprintTasks from "./pages/SprintTasks";
import Integrations from "./pages/Integrations";
import TaskBoardColumns from "./pages/TaskBoardColumns";
import Profile from './components/profile';
import PopupChatWindow from './components/inbox'
import ChatbotWidget from "./components/chatbotwidget";
import ExploreTemplates from "./components/tools"
import { UserProvider } from "./contexts/UserContext";
import WorkspaceName from "./pages/WorkspaceName";
import { WorkspaceProvider } from './contexts/WorkspaceContexts';
function App() {
    return (
        <WorkspaceProvider>
        <UserProvider>
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
          {/* Project-specific routes */}
          
          <Route path="/project/:projectId/bugsqueue" element={<Bugs_queue_section/>} />
          <Route path="/project/:projectId/sprintspage" element={<SprintsPage/>} />
          <Route path="/project/:projectId/retrospective" element={<RetrospectiveComponent/>} />
          <Route path="/project/:projectId/taskdashboard" element={<Task_dashboard/>} />

          <Route path="/notification" element={<NotificationsDemo/>}/>
          <Route path="/feed" element = {<Feed/>}/>
          <Route path="/profile" element = {<Profile/>}/>
          <Route path="/WorkspaceName" element = {<WorkspaceName/>}/>
          <Route path="/Help" element = {<Help/>}/>
          <Route path="/Documentation" element = {<Documentation/>}/>
          <Route path="/inbox" element ={<PopupChatWindow/>}/>
          <Route path="/tools" element ={<ExploreTemplates/>}/>
          </Routes>
        </UserProvider>
        </WorkspaceProvider>
          
      );
  
}

export default App