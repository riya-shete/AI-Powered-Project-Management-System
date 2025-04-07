import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; 
import ExploreTemplates from "./tools"

const Sidebar = () => {
  const [expandedSection, setExpandedSection] = useState('My Team');
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 space-y-1">
        <div
          className="flex items-center p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
          onClick={() => handleNavigation('/dashboard')}
        >
          <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium group-hover:text-blue-600 transition-colors">Home</span>
        </div>
        <div
          className="flex items-center p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
          onClick={() => handleNavigation('/tools')}
        >
          <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="font-medium group-hover:text-blue-600 transition-colors">Tools</span>
        </div>
      </div>
      
      <div className="mt-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="font-medium">Favorites</span>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedSection === 'Favorites' ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            onClick={() => toggleSection('Favorites')}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <div className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="font-medium">Workspaces</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between p-4 bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-xs mr-3 shadow-sm">M</div>
              <span className="font-medium text-blue-900">My Team</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                onClick={() => toggleSection('My Team')}
              >
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 ${expandedSection === 'My Team' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          
          {expandedSection === 'My Team' && (
            <div className="pl-12 pr-4 py-2 bg-gray-50 space-y-2">
              <div
                className="flex items-center py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleNavigation('/taskdashboard')}
              >
                <svg className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">PMS</span>
              </div>
              <div
                className="flex items-center py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleNavigation('/sprintspage')}
              >
                <svg className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Sprints</span>
              </div>
              
              <div
                className="flex items-center py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleNavigation('/bugsqueue')}
              >
                <svg className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Bugs Queue</span>
              </div>
              <div
                className="flex items-center py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleNavigation('/retrospective')}
              >
                <svg className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Retrospectives</span>
              </div>
              
            </div>
          )}
        </div>
      </div>
      


      
      <div className="mt-auto p-4 border-t border-gray-200">
        <button 
        onClick={() => handleNavigation('/Login')}
        className="w-full flex items-center justify-center gap-2 rounded-lg shadow-sm bg-blue-500 text-white py-2 px-4 hover:bg-red-600 transition font-medium"
        >
        <LogOut className="w-5 h-5" />
        <span>log out</span>
        </button>
      </div>
    </div>
  );
};






export default Sidebar;
