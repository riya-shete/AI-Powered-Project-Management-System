import React, { useState } from 'react';
import { Search, X, BellRing, List, UserCheck, Bookmark } from 'lucide-react';

function MergedFeedNotifications({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ALL');

  // Sample notification data
  const notifications = [
    {
      id: 1,
      user: 'Riya Shete',
      action: 'has assigned you to item "desktop UI/UX"',
      time: 'yesterday 5:30 pm',
      date: 'Yesterday',
      avatar: 'https://t4.ftcdn.net/jpg/09/61/69/75/240_F_961697523_EFd1m8P4tdcwB0TYvlQAagqKR1xHSuwk.jpg',
      type: 'assigned'
    },
    {
      id: 2,
      user: 'Team Project',
      action: 'submitted a new design for review',
      time: 'yesterday 3:45 pm',
      date: 'Yesterday',
      avatar: 'https://t3.ftcdn.net/jpg/13/25/15/64/240_F_1325156466_bPRvqDidjf0uquk7hXjJ7ujl9iiQhQbJ.jpg',
      type: 'all'
    },
    {
      id: 3,
      user: 'Sarah Johnson',
      action: 'bookmarked your post "React Best Practices"',
      time: 'today 2:15 pm',
      date: 'Today',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      type: 'bookmark'
    }
  ];

  // Tab configuration
  const tabs = [
    { 
      key: 'ALL', 
      title: 'All', 
      icon: List 
    },
    { 
      key: 'ASSIGNED', 
      title: 'Assigned to me', 
      icon: UserCheck 
    },
    { 
      key: 'BOOKMARK', 
      title: 'Bookmark', 
      icon: Bookmark 
    }
  ];

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ASSIGNED') return notification.type === 'assigned';
    if (activeTab === 'BOOKMARK') return notification.type === 'bookmark';
    return false;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
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
      
      {/* Main panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3">
              <BellRing className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Update Feed</h2>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-gray-600 text-sm">Customize what appears in your feed</p>
              <a 
                href="#" 
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {/* Add mark all as read functionality */}}
              className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
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
        <div className="border-b">
          <div className="flex">
            {tabs.map(tab => (
              <button 
                key={tab.key}
                className={`
                  flex-1 py-4 px-4 flex items-center justify-center space-x-2 
                  transition-colors duration-200
                  ${activeTab === tab.key 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'}
                `}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon 
                  size={18} 
                  className={activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'}
                />
                <span className="text-sm font-medium">{tab.title}</span>
              </button>
            ))}
          </div>
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
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-220px)]">
          {Object.keys(groupedNotifications).length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              {activeTab === 'ALL' && (
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                    <List size={64} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">All Updates</h3>
                  <p className="text-gray-600">A comprehensive view of all your recent updates</p>
                </div>
              )}
              
              {activeTab === 'ASSIGNED' && (
                <div className="text-center">
                  <div className="bg-green-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                    <UserCheck size={64} className="text-green-500 fill-green-100 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Assigned to Me</h3>
                  <p className="text-gray-600">Tasks and items that have been assigned to you</p>
                </div>
              )}
              
              {activeTab === 'BOOKMARK' && (
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <Bookmark 
                      size={64} 
                      className="text-blue-500 fill-blue-100 stroke-[1.5]" 
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Bookmark Important Updates</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Save key updates to quickly access them later. Your bookmarks help you stay organized and informed.
                  </p>
                  <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Manage Bookmarks
                  </button>
                </div>
              )}
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date}>
                <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                  {date}
                </div>
                
                {items.map(notification => (
                  <div 
                    key={notification.id} 
                    className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
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
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MergedFeedNotifications;