import React, { useState } from 'react';
import { Search, MoreVertical, Heart } from 'lucide-react';

const NotificationsPopup = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Sample notification data
  const notifications = [
    {
      id: 1,
      user: 'Riya Shete',
      action: 'has assigned you to item "desktop UI/UX"',
      time: 'yesterday 5:30 pm',
      date: 'Yesterday'
    },
    // Empty slots for other notifications
    { id: 2, empty: true, date: 'Yesterday' },
    { id: 3, empty: true, date: 'Yesterday' },
    { id: 4, empty: true, date: 'Yesterday' }
  ];
  
  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = notification.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Notifications panel */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'ALL' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('ALL')}
          >
            ALL
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'Mentioned' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('Mentioned')}
          >
            Mentioned
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'Assigned to me' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('Assigned to me')}
          >
            Assigned to me
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 border rounded-full text-sm"
            />
          </div>
        </div>
        
        {/* Notifications list */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
          {Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              <div className="px-4 py-2 text-sm font-medium text-gray-600">
                {date}
              </div>
              
              {items.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${notification.empty ? 'h-16' : ''}`}
                >
                  {!notification.empty && (
                    <div className="flex justify-between items-start">
                      <div className="flex">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm">
                            <span className="font-medium">{notification.user}</span> {notification.action}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo component that shows how to use the notification popup
const NotificationsDemo = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <div className="bg-purple-100 min-h-screen p-4">
      {/* Header with notification bell */}
      <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center mb-4">
        <div className="font-medium">PMS</div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full bg-gray-100">
            <Search size={16} />
          </button>
          <button className="p-2 rounded-full bg-gray-100">+</button>
          <button 
            className="p-2 rounded-full bg-gray-100"
            onClick={toggleNotifications}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Content that gets blurred */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Dashboard Content</h2>
        <p>This content will be blurred when the notification popup appears.</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-medium">Recent Tasks</h3>
            <p className="mt-2 text-sm text-gray-600">No recent tasks</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-medium">Team Activity</h3>
            <p className="mt-2 text-sm text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>

      {/* Notification popup */}
      <NotificationsPopup 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default NotificationsDemo;
