import React, { useState, useEffect } from 'react';
import { Search, X, BellRing, List, UserCheck, Bookmark, AlertCircle } from 'lucide-react';

function NotificationsDemo({ isOpen = true, onClose = () => {}, userId = 44, baseUrl = 'http://localhost:3000' }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API endpoints based on your Postman screenshot
  const API_ENDPOINTS = {
    getNotificationById: `${baseUrl}/api/notifications/${userId}`,
    getUnreadNotifications: `${baseUrl}/api/notifications/unread/${userId}`,
    getBookmarkById: `${baseUrl}/api/bookmarks/${userId}`,
    markAsRead: `${baseUrl}/api/notifications/mark-read`,
  };

  // Tab configuration
  const tabs = [
    { 
      key: 'ALL', 
      title: 'All', 
      icon: List 
    },
    { 
      key: 'UNREAD', 
      title: 'Unread', 
      icon: UserCheck 
    },
    { 
      key: 'BOOKMARK', 
      title: 'Bookmarks', 
      icon: Bookmark 
    }
  ];

  // Fetch data from API
  const fetchData = async (endpoint, setter) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Assuming token storage
          'X-Object-ID': '44', // Based on your Postman screenshot
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setter(data);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (!isOpen || !userId) return;

    switch (activeTab) {
      case 'ALL':
        fetchData(API_ENDPOINTS.getNotificationById, setNotifications);
        break;
      case 'UNREAD':
        fetchData(API_ENDPOINTS.getUnreadNotifications, setNotifications);
        break;
      case 'BOOKMARK':
        fetchData(API_ENDPOINTS.getBookmarkById, setBookmarks);
        break;
    }
  }, [activeTab, isOpen, userId]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(API_ENDPOINTS.markAsRead, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ notificationId }),
      });
      
      // Refresh current tab data
      if (activeTab === 'ALL' || activeTab === 'UNREAD') {
        fetchData(
          activeTab === 'ALL' 
            ? API_ENDPOINTS.getNotificationById
            : API_ENDPOINTS.getUnreadNotifications,
          setNotifications
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notification => markAsRead(notification.id))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Filter data based on search term
  const getFilteredData = () => {
    const currentData = activeTab === 'BOOKMARK' ? bookmarks : notifications;
    
    if (!searchTerm) return currentData;
    
    return currentData.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Format notification data (adapt based on your API response structure)
  const formatNotificationData = (item) => ({
    id: item.id,
    user: item.user || item.sender || 'Unknown User',
    action: item.message || item.action || item.title,
    time: new Date(item.createdAt || item.timestamp).toLocaleString(),
    date: new Date(item.createdAt || item.timestamp).toLocaleDateString(),
    avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user}`,
    isRead: item.isRead || false,
    type: item.type || 'notification'
  });

  // Group data by date
  const groupedData = getFilteredData().reduce((acc, item) => {
    const formattedItem = formatNotificationData(item);
    const date = formattedItem.date;
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(formattedItem);
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
              <p className="text-gray-600 text-sm">
                Updates for User ID: {userId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={markAllAsRead}
              disabled={loading}
              className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded disabled:opacity-50"
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-220px)]">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 text-center mb-4">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  // Retry loading based on active tab
                  if (activeTab === 'ALL') {
                    fetchData(API_ENDPOINTS.getNotificationById, setNotifications);
                  } else if (activeTab === 'UNREAD') {
                    fetchData(API_ENDPOINTS.getUnreadNotifications, setNotifications);
                  } else if (activeTab === 'BOOKMARK') {
                    fetchData(API_ENDPOINTS.getBookmarkById, setBookmarks);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              {activeTab === 'ALL' && (
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                    <List size={64} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">No Notifications</h3>
                  <p className="text-gray-600">You're all caught up! No new notifications.</p>
                </div>
              )}
              
              {activeTab === 'UNREAD' && (
                <div className="text-center">
                  <div className="bg-green-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                    <UserCheck size={64} className="text-green-500 fill-green-100 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">All Caught Up!</h3>
                  <p className="text-gray-600">No unread notifications at the moment.</p>
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
                  <h3 className="text-xl font-bold mb-2 text-gray-800">No Bookmarks Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Start bookmarking important updates to access them quickly later.
                  </p>
                </div>
              )}
            </div>
          ) : (
            Object.entries(groupedData).map(([date, items]) => (
              <div key={date}>
                <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                  {date}
                </div>
                
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      !item.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center flex-1">
                        <img 
                          src={item.avatar}
                          alt={`${item.user}'s avatar`}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                        <div className="text-sm flex-1">
                          <span className="font-semibold text-gray-800">{item.user}</span>{' '}
                          <span className="text-gray-600">{item.action}</span>
                          {!item.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{item.time}</span>
                        {!item.isRead && (
                          <button
                            onClick={() => markAsRead(item.id)}
                            className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
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

export default NotificationsDemo;