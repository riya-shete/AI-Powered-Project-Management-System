import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { Link } from "react-router-dom";
// Main App Component
const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = () => {
  const boardCards = [
    { id: 1, title: 'Retrospectives', path: 'PMS dev > My Team > My Team' },
    { id: 2, title: 'PMS', path: 'PMS dev > My Team > My Team' },
    { id: 3, title: 'Bugs Queue', path: 'PMS dev > My Team > My Team' },
    { id: 4, title: 'Sprints', path: 'PMS dev > My Team > My Team' }
  ];

  return (
    <div className="flex-1 overflow-auto p-10 bg-gray-50">
        <div className="px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Good morning, Yari!</h1>
          <p className="text-gray-600 text-lg">Quickly access your recent boards, Inbox and workspaces</p>
        </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-3">
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 rounded-md p-1.5 mr-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Recently visited</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {boardCards.map(card => (
                <div 
                  key={card.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border border-gray-100 group"
                >
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                    <img src="https://t3.ftcdn.net/jpg/11/98/05/12/240_F_1198051294_PcJZQpDHWLrbduFqsdxdGTqBQCxBVskZ.jpg" alt="Board thumbnail" className="w-full rounded-lg shadow-sm" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className="font-medium text-lg text-gray-800 group-hover:text-blue-700 transition-colors duration-300">{card.title}</span>
                      </div>
                      <button className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 p-1.5 hover:bg-yellow-50 rounded-full">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-md mr-2 flex items-center justify-center text-white shadow-sm">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <span className="group-hover:text-blue-600 transition-colors duration-300">{card.path}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-lg">
                Show all boards
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 rounded-md p-1.5 mr-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Update feed (Inbox)</h2>
              <div className="ml-3 bg-blue-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-sm">0</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Your inbox is empty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="relative">
              <img src="https://t4.ftcdn.net/jpg/10/33/40/07/240_F_1033400724_qNU00YqAKeDXH0hKHrxkNWrThjgLJSSw.jpg" alt="Templates preview" className="w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Boost your workflow with templates</h3>
              <button className="w-full py-2.5 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
                Explore templates
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-5 px-1">Learn & get inspired</h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 mb-4 flex items-center hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2.5 mr-4 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <Link to="/Documentation">
              <div>
                <h4 className="font-medium text-gray-800">Getting started</h4>
                <p className="text-sm text-gray-500">Learn how monday.com works</p>
              </div>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 flex items-center hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2.5 mr-4 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Link to="/Help">
              <div>
                <h4 className="font-medium text-gray-800">Help center</h4>
                <p className="text-sm text-gray-500">Learn and get support</p>
              </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    
      <div className="fixed bottom-6 right-6">
      <Link to="/Help">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:scale-105">
          Help
        </button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;