import React, { useState } from 'react';
import { Search, MoreVertical, X, BellRing } from 'lucide-react';

function NotificationsDemo({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ALL');

  // Sample notification data with more details
  const notifications = [
    {
      id: 1,
      user: 'Riya Shete',
      action: 'has assigned you to item "desktop UI/UX"',
      time: 'yesterday 5:30 pm',
      date: 'Yesterday',
      avatar: 'https://t4.ftcdn.net/jpg/09/61/69/75/240_F_961697523_EFd1m8P4tdcwB0TYvlQAagqKR1xHSuwk.jpg'
    },
    {
      id: 2,
      user: 'Team Project',
      action: 'submitted a new design for review',
      time: 'yesterday 3:45 pm',
      date: 'Yesterday',
      avatar: 'https://t3.ftcdn.net/jpg/13/25/15/64/240_F_1325156466_bPRvqDidjf0uquk7hXjJ7ujl9iiQhQbJ.jpg'
    },
    { 
      id: 3, 
      empty: true, 
      date: 'Yesterday' 
    },
    { 
      id: 4, 
      empty: true, 
      date: 'Yesterday' 
    }
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Notifications panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BellRing className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {/* Add mark all as read functionality */}}
              className="text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
            >
              Mark all read
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          {['ALL', 'Mentioned', 'Assigned to me'].map(tab => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notifications"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
        </div>
        
        {/* Notifications list */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
          {Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                {date}
              </div>
              
              {items.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${notification.empty ? 'h-16' : ''}`}
                >
                  {!notification.empty && (
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <img 
                          src={notification.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                          alt={`${notification.user}'s avatar`}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                        <div className="text-sm">
                          <span className="font-semibold text-gray-800">{notification.user}</span>{' '}
                          <span className="text-gray-600">{notification.action}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{notification.time}</span>
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
}

export default NotificationsDemo;