import React, { useState } from 'react';
import { X, Bookmark } from 'lucide-react';

const UpdateFeedModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('bookmarks');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg w-full max-w-3xl mx-4 shadow-xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        {/* Modal header */}
        <div className="p-6">
          <h2 className="text-2xl font-bold">Update Feed</h2>
          <div className="flex items-center mt-2">
            <p className="text-gray-600">What goes in my feed?</p>
            <a href="#" className="ml-2 text-blue-500">See more</a>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            <button 
              className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All updates
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'mentioned' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('mentioned')}
            >
              @ I was mentioned
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'bookmarks' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'account' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              All account updates
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center">
          {activeTab === 'bookmarks' && (
            <div className="text-center py-12">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark size={64} className="text-cyan-400 fill-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Bookmark important updates</h3>
              <p className="text-gray-600">That way, you can quickly and easily find them again</p>
            </div>
          )}
          
          {activeTab === 'all' && (
            <div className="w-full py-12 text-center text-gray-500">
              <p>All updates will appear here</p>
            </div>
          )}
          
          {activeTab === 'mentioned' && (
            <div className="w-full py-12 text-center text-gray-500">
              <p>Updates where you were mentioned will appear here</p>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="w-full py-12 text-center text-gray-500">
              <p>All account updates will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Example usage component
const Feed = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  
  return (
    <div className="p-4">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Update Feed
      </button>
      
      <UpdateFeedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Feed;
