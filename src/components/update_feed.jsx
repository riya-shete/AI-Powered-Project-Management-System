import React, { useState } from 'react';
import { X, Bookmark, List, Bell, UserCircle } from 'lucide-react';

const Feed = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('bookmarks');
  
  // Tab configuration with icons and full titles
  const tabs = [
    { 
      key: 'all', 
      title: 'All Updates', 
      icon: List 
    },
    { 
      key: 'mentioned', 
      title: '@ I was Mentioned', 
      icon: Bell 
    },
    { 
      key: 'bookmarks', 
      title: 'Bookmarks', 
      icon: Bookmark 
    },
    { 
      key: 'account', 
      title: 'Account Updates', 
      icon: UserCircle 
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-in">
        {/* Modal header */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Update Feed</h2>
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
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
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
        
        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          {activeTab === 'bookmarks' && (
            <div className="text-center py-8">
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
          
          {activeTab === 'all' && (
            <div className="w-full py-12 text-center">
              <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <List size={64} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">All Updates</h3>
              <p className="text-gray-600">A comprehensive view of all your recent updates</p>
            </div>
          )}
          
          {activeTab === 'mentioned' && (
            <div className="w-full py-12 text-center">
              <div className="bg-green-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <Bell size={64} className="text-green-500 fill-green-100 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Mentions</h3>
              <p className="text-gray-600">Updates and conversations where you've been directly mentioned</p>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="w-full py-12 text-center">
              <div className="bg-purple-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <UserCircle size={64} className="text-purple-500 fill-purple-100 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Account Updates</h3>
              <p className="text-gray-600">Important notifications about your account and settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;