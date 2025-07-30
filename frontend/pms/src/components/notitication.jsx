import React, { useState, useEffect } from 'react';
import { 
  Bell, X, Search, Check, Trash2, Mail, User, ClipboardList, 
  MessageSquare, AlertCircle, Calendar, Settings, ChevronDown 
} from 'lucide-react';
import axios from 'axios';

const NotificationsPanel = ({ 
  isOpen = true, 
  onClose = () => {}, 
  userId = 5,
  baseUrl = 'http://localhost:8000'
}) => {
  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedType, setSelectedType] = useState('ALL');

  // API endpoints
  const API_ENDPOINT = `${baseUrl}/api/notifications/`;
  const MARK_READ_ENDPOINT = `${baseUrl}/api/notifications/mark_read/`;
  const MARK_ALL_READ_ENDPOINT = `${baseUrl}/api/notifications/mark_all_read/`;
  const DELETE_ENDPOINT = `${baseUrl}/api/notifications/delete/`;
  const DELETE_ALL_ENDPOINT = `${baseUrl}/api/notifications/clear_all/`;

  // Notification type configuration
  const NOTIFICATION_TYPES = {
    ALL: { label: 'All', icon: Bell, color: 'text-gray-500' },
    invitation: { label: 'Invitations', icon: Mail, color: 'text-purple-500' },
    assignment: { label: 'Assignments', icon: ClipboardList, color: 'text-blue-500' },
    mention: { label: 'Mentions', icon: User, color: 'text-green-500' },
    comment: { label: 'Comments', icon: MessageSquare, color: 'text-orange-500' },
    status_change: { label: 'Status Changes', icon: AlertCircle, color: 'text-yellow-500' },
    deadline: { label: 'Deadlines', icon: Calendar, color: 'text-red-500' },
    system: { label: 'System', icon: Settings, color: 'text-gray-400' }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_ENDPOINT, {
        headers: {
          'Authorization': `Token ${token}`,
          // 'X-Object-ID': userId.toString()
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
        // Initialize expanded groups
        const groups = {};
        Object.keys(NOTIFICATION_TYPES).forEach(type => {
          groups[type] = true;
        });
        setExpandedGroups(groups);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to load notifications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${MARK_READ_ENDPOINT}${id}/`,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`,
            'X-Object-ID': userId.toString()
          }
        }
      );
      // Optimistic UI update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      // Refresh to ensure sync with backend
      fetchNotifications();
    } catch (err) {
      console.error('Mark read failed:', err);
      // Revert if failed
      fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        MARK_ALL_READ_ENDPOINT,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`,
            // 'X-Object-ID': userId.toString()
          }
        }
      );
      // Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Refresh to ensure sync with backend
      fetchNotifications();
    } catch (err) {
      console.error('Mark all read failed:', err);
      // Revert if failed
      fetchNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${DELETE_ENDPOINT}${id}/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'X-Object-ID': userId.toString()
          }
        }
      );
      // Optimistic UI update
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Refresh to ensure sync with backend
      fetchNotifications();
    } catch (err) {
      console.error('Delete failed:', err);
      // Revert if failed
      fetchNotifications();
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        DELETE_ALL_ENDPOINT,
        {
          headers: {
            'Authorization': `Token ${token}`,
            // 'X-Object-ID': userId.toString()
          }
        }
      );
      // Optimistic UI update
      setNotifications(prev => prev.filter(n => !n.read));
      // Refresh to ensure sync with backend
      fetchNotifications();
    } catch (err) {
      console.error('Delete all read failed:', err);
      // Revert if failed
      fetchNotifications();
    }
  };

  // Handle notification click (mark as read and navigate if URL exists)
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  // Toggle group expansion
  const toggleGroup = (type) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Filter notifications based on active tab, selected type and search term
  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'ALL' || (activeTab === 'UNREAD' && !n.read);
    const matchesType = selectedType === 'ALL' || n.notification_type === selectedType;
    const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (n.sender?.username && n.sender.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesType && matchesSearch;
  });

  // Group by type
  const groupedNotifications = filteredNotifications.reduce((acc, item) => {
    const type = item.notification_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  // Calculate counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  // Load data when panel opens or when operations are performed
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Bell className="text-gray-800" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {readCount > 0 && (
              <button 
                onClick={deleteAllRead}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Delete all read
              </button>
            )}
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Mark all as read
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {['ALL', 'UNREAD'].map(tab => (
              <button
                key={tab}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto space-x-2 mt-2 pb-1">
              {Object.entries(NOTIFICATION_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedType === type
                      ? `${config.color.replace('text', 'bg')} bg-opacity-10 border ${config.color.replace('text', 'border')} border-opacity-30`
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <config.icon size={14} className={config.color} />
                  <span>{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
              <span className="mt-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="text-red-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error loading notifications</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <Bell className="text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {activeTab === 'ALL' ? 'No notifications' : 'No unread notifications'}
              </h3>
              <p className="text-gray-600 max-w-md">
                {activeTab === 'ALL' 
                  ? "You'll get notified here when you receive mentions, comments, or other updates." 
                  : "You're all caught up with no unread notifications."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedNotifications).map(([type, items]) => {
                const typeConfig = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.ALL;
                return (
                  <div key={type} className="py-2">
                    <button
                      onClick={() => toggleGroup(type)}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2">
                        <typeConfig.icon size={16} className={typeConfig.color} />
                        <span className="text-sm font-medium text-gray-700">{typeConfig.label}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform ${expandedGroups[type] ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    {expandedGroups[type] && items.map(item => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !item.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(item)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              <typeConfig.icon size={18} className={typeConfig.color} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {item.sender && (
                                  <span className="text-sm font-medium text-gray-900">
                                    {item.sender.username || `${item.sender.first_name} ${item.sender.last_name}`}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {item.time_since || new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800 mt-1">
                                {item.message}
                              </p>
                              {item.notification_type === 'invitation' && (
                                <div className="mt-2 flex space-x-2">
                                  <button 
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle accept logic here
                                    }}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle decline logic here
                                    }}
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {!item.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(item.id);
                                }}
                                className="text-gray-400 hover:text-blue-600"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(item.id);
                              }}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-white rounded-b-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
              {activeTab === 'UNREAD' && ` (${unreadCount} unread)`}
            </span>
            <button 
              onClick={fetchNotifications}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;