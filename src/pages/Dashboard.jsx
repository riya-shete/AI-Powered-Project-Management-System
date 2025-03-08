import React from 'react';
import {
  Bell,
  MessageSquare,
  UserPlus,
  Layers,
  Search,
  HelpCircle,
  Grid,
  Home,
  Star,
  FileText,
  Clock,
  Bug,

} from 'lucide-react';

const Dashboard = ()=> {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between bg-[#E8F9FF] px-4 py-2 border-b">
      {/* Left side: Brand + Settings button */}
      <div className="flex items-center space-x-3">
        {/* Green circle logo */}
        <div className="w-6 h-6 rounded-full bg-blue-500" />

        {/* Brand text */}
        <span className="font-bold text-gray-700">PMS</span>
        <span className="text-blue-600">dev</span>

        {/* Settings button with green border */}
        <button className="ml-4 border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition">
          Settings
        </button>
      </div>

      {/* Right side: Icons & avatar */}
      <div className="flex items-center space-x-4">
        {/* “Q” icon or Quick Search */}
        <button className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-600 hover:text-gray-800 shadow-sm">
         <UserPlus size={20} />
        </button>

        {/* Chat bubble icon */}
        <button className="text-gray-600 hover:text-gray-800">
          <MessageSquare size={20} />
        </button>

        {/* Bell icon with red notification dot */}
        <button className="relative text-gray-600 hover:text-gray-800">
          <Bell size={20} />
          {/* Red dot for notification */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Help icon */}
        <button className="text-gray-600 hover:text-gray-800">
          <HelpCircle size={20} />
        </button>

        {/* Ellipsis or more menu */}
        <button className="text-gray-600 hover:text-gray-800">
          ...
        </button>

        {/* User avatar (initials “M”) */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          M
        </div>
      </div>
    </nav>

      {/* Below the navbar, use flex to position sidebar and main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#E8F9FF] border-r">
          

          {/* Sidebar Navigation */}
          <nav className="p-2">
            <div className="p-2 flex items-center hover:bg-blue-200 rounded">
              <Home size={18} className="mr-3 text-gray-600" />
              <span>Home</span>
            </div>
            <div className="p-2 flex justify-between items-center hover:bg-blue-200 rounded">
              <div className="flex items-center">
                <Layers size={18} className="mr-3 text-gray-600" />
                <span>Tools</span>
              </div>
              <span className="text-gray-500">&gt;</span>
            </div>

            {/* Favorites Section */}
            <div className="p-2 flex justify-between items-center hover:bg-blue-200 rounded mt-2">
              <div className="flex items-center">
                <Star size={18} className="mr-3 text-gray-600" />
                <span>Favorites</span>
              </div>
              <span className="text-gray-500">v</span>
            </div>

            {/* Workspaces Section */}
            <div className="p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Layers size={18} className="mr-3 text-gray-600" />
                  <span>Workspaces</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">...</span>
                  <Search size={16} className="text-gray-600" />
                </div>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center mr-2">
                    M
                  </div>
                  <span>My Team</span>
                </div>
                <span className="text-gray-500">v</span>
              </div>

              {/* Team Items */}
              <div className="ml-6 mt-2 space-y-2">
                {[
                  "PMS",
                  "Sprints",
                  "Epics",
                  "Bugs Queue",
                  "Retrospectives",
                  "Getting Started"
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center hover:bg-blue-200 p-1 rounded"
                  >
                    {item === "PMS" && (
                      <FileText size={16} className="mr-3 text-gray-600" />
                    )}
                    {item === "Sprints" && (
                      <Clock size={16} className="mr-3 text-gray-600" />
                    )}
                    {item === "Epics" && (
                      <Layers size={16} className="mr-3 text-gray-600" />
                    )}
                    {item === "Bugs Queue" && (
                      <Bug size={16} className="mr-3 text-gray-600" />
                    )}
                    {item === "Retrospectives" && (
                      <Clock size={16} className="mr-3 text-gray-600" />
                    )}
                    {item === "Getting Started" && (
                      <FileText size={16} className="mr-3 text-gray-600" />
                    )}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-light text-gray-800">Good morning, Yari!</h1>
            <p className="text-gray-600">
              Quickly access your recent boards, Inbox and workspaces
            </p>
          </div>

          {/* Recently Visited */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="text-lg font-medium">Recently visited</span>
              <span className="ml-2 text-gray-500">v</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "PMS", color: "#B5D5FF" },
                { title: "Retrospectives", color: "#10B981" },
                { title: "Getting Started", color: "#2C5AA0" }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border"
                >
                  {/* Placeholder content area */}
                  <div className="h-32 bg-gray-100 p-4">
                    <div className="space-y-2">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center">
                          <div className="w-24 h-2 bg-gray-300 rounded mr-4" />
                          <div className="w-16 h-2 bg-blue-200 rounded" />
                          <div
                            className="ml-auto w-12 h-6 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2 text-gray-600" />
                      <span>{item.title}</span>
                    </div>
                    <Star size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional card with varied colors */}
            <div className="mt-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                <div className="h-32 bg-gray-100 p-4">
                  <div className="space-y-2">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-24 h-2 bg-gray-300 rounded mr-4" />
                        <div className="w-16 h-2 bg-blue-200 rounded" />
                        <div
                          className="ml-auto w-12 h-6 rounded"
                          style={{
                            backgroundColor:
                              i === 0
                                ? "#B5D5FF"
                                : i === 1
                                ? "#FBBF24"
                                : "#EF4444"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2 text-gray-600" />
                    <span>Sprints</span>
                  </div>
                  <Star size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
            <div className="flex">
              <div className="flex-1 pr-4">
                <h2 className="text-lg mb-4">
                  Boost your workflow in minutes with ready-made templates
                </h2>
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md">
                  Explore templates
                </button>
              </div>
              <div className="w-64 h-32 bg-gray-100 rounded-md p-2">
                {/* Placeholder template visualization */}
                <div className="space-y-2">
                  <div className="h-4 bg-blue-100 rounded" />
                  <div className="flex">
                    <div className="w-1/2 pr-1">
                      <div className="h-16 bg-green-100 rounded" />
                    </div>
                    <div className="w-1/2 pl-1 space-y-2">
                      <div className="h-4 bg-blue-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learn & Get Inspired */}
          <div>
            <h2 className="text-lg mb-4">Learn & get inspired</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 flex items-center shadow-sm border">
                <div className="w-12 h-12 rounded-md bg-blue-600 text-white flex items-center justify-center mr-4">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Getting started</h3>
                  <p className="text-sm text-gray-600">
                    Learn how monday.com works
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 flex items-center shadow-sm border">
                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center mr-4">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Help center</h3>
                  <p className="text-sm text-gray-600">Learn and get support</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard