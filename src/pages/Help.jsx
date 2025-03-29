import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { 
  MapPin, 
  Wrench, 
  List, 
  Lightbulb, 
  Shield,
  HelpCircle,
  X,
  Mic,
  Send,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';

const Help = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState('');
  const [chatbotResponse, setChatbotResponse] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // New state variables for discussions
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });
  const [newDiscussion, setNewDiscussion] = useState({
    author: '',
    title: '',
    description: '',
    category: ''
  });
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [replyingToDiscussion, setReplyingToDiscussion] = useState(null);
  const [newReply, setNewReply] = useState('');

  // Predefined categories and statuses
  const categories = ['General', 'Technical', 'Billing', 'Feature Request'];
  const statuses = ['Open', 'In Progress', 'Resolved'];

  // Sample discussions data
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: 'Workspace Creation Issue',
      description: 'I am unable to create a new workspace. Getting an error.',
      author: 'John Doe',
      category: 'Technical',
      status: 'Open',
      createdAt: '2 days ago',
      replies: [
        {
          id: 1,
          text: 'Have you tried clearing your browser cache?',
          author: 'Support Team',
          timestamp: '1 day ago'
        }
      ]
    }
  ]);

  // Computed filteredDiscussions
  const filteredDiscussions = discussions.filter(disc => 
    (!filters.category || disc.category === filters.category) &&
    (!filters.status || disc.status === filters.status)
  );

  const faqItems = [
    {
      id: 1,
      icon: <Shield className="mr-2 text-blue-600" />,
      question: 'How to create a workspace?',
      answer: 'Navigate to the Workspaces section and click "Create Workspace". Fill in the required details like workspace name, description, and initial team members. You can customize workspace settings after creation.'
    },
    {
      id: 2,
      icon: <Wrench className="mr-2 text-blue-600" />,
      question: 'How to invite team members?',
      answer: 'Go to workspace settings and use the "Invite Members" option. You can add members by email address or generate an invite link. Members can be assigned different roles like Admin, Editor, or Viewer.'
    },
    {
      id: 3,
      icon: <Lightbulb className="mr-2 text-blue-600" />,
      question: 'How to reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address. You will receive a password reset link. Click the link and set a new password following the security guidelines.'
    }
  ];

  const chatbotRef = useRef(null);

  const handleChatbotQuery = () => {
    if (!chatbotQuery.trim()) return;

    // Simulated AI response (replace with actual AI integration)
    const responses = {
      'workspace': 'To create a workspace, go to the Workspaces section and click "Create Workspace". Fill in the required details.',
      'team members': 'You can invite team members through workspace settings using the "Invite Members" option.',
      'reset password': 'To reset your password, click "Forgot Password" on the login page and follow the instructions.'
    };

    const matchedResponse = Object.entries(responses).find(([key]) => 
      chatbotQuery.toLowerCase().includes(key)
    );

    setChatbotResponse(matchedResponse 
      ? matchedResponse[1] 
      : "I'm not sure about that. Could you please rephrase your question?"
    );

    setChatbotQuery('');
  };

  const handleAddDiscussion = () => {
    if (!newDiscussion.title || !newDiscussion.description) return;

    const discussion = {
      id: discussions.length + 1,
      ...newDiscussion,
      status: 'Open',
      createdAt: 'Just now',
      replies: []
    };

    setDiscussions([...discussions, discussion]);
    setNewDiscussion({ author: '', title: '', description: '', category: '' });
  };

  const handleUpdateDiscussion = () => {
    if (!editingDiscussion) return;

    const updatedDiscussions = discussions.map(disc => 
      disc.id === editingDiscussion.id ? editingDiscussion : disc
    );

    setDiscussions(updatedDiscussions);
    setEditingDiscussion(null);
  };

  const handleDeleteDiscussion = (id) => {
    setDiscussions(discussions.filter(disc => disc.id !== id));
  };

  const handleAddReply = (discussionId) => {
    if (!newReply.trim()) return;

    const updatedDiscussions = discussions.map(disc => {
      if (disc.id === discussionId) {
        return {
          ...disc,
          replies: [
            ...disc.replies,
            {
              id: disc.replies.length + 1,
              text: newReply,
              author: 'You',
              timestamp: 'Just now'
            }
          ]
        };
      }
      return disc;
    });

    setDiscussions(updatedDiscussions);
    setNewReply('');
    setReplyingToDiscussion(null);
  };

  const AIChatbot = ({ isOpen, onClose }) => {
    useEffect(() => {
      if (isOpen && chatbotRef.current) {
        chatbotRef.current.focus();
      }
    }, [isOpen]);

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 w-96 bg-white shadow-2xl rounded-xl border border-blue-100 z-50"
          >
            <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Support Assistant</h3>
              <button onClick={onClose} className="hover:bg-blue-700 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {chatbotResponse && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-gray-700">{chatbotResponse}</p>
                </div>
              )}
              <div className="flex space-x-2">
                <input 
                  ref={chatbotRef}
                  type="text"
                  placeholder="Ask your question..."
                  value={chatbotQuery}
                  onChange={(e) => setChatbotQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatbotQuery()}
                  className="flex-1 p-2 border rounded-lg"
                />
                <button 
                  onClick={handleChatbotQuery}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto w-full h-full p-4 bg-gray-50">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
              <HelpCircle className="mr-3 text-blue-600" /> Help Center
            </h1>
            
            {/* Tabs */}
            <div className="mb-6 flex space-x-4 border-b">
              <button 
                onClick={() => setActiveTab('faq')}
                className={`pb-2 flex items-center ${
                  activeTab === 'faq' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-500'
                }`}
              >
                <Lightbulb className="mr-2" /> Frequently Asked Questions
              </button>
              <button 
                onClick={() => setActiveTab('discussions')}
                className={`pb-2 flex items-center ${
                  activeTab === 'discussions' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-500'
                }`}
              >
                <MessageCircle className="mr-2" /> User Discussions
              </button>
            </div>

            {activeTab === 'faq' ? (
              <div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqItems.map((faq) => (
                      <div 
                        key={faq.id} 
                        className="border-b pb-4 hover:bg-gray-50 p-2 rounded transition cursor-pointer"
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      >
                        <h3 className="font-bold mb-2 flex items-center justify-between">
                          <span className="flex items-center">
                            {faq.icon}
                            {faq.question}
                          </span>
                          {expandedFAQ === faq.id ? <ChevronUp /> : <ChevronDown />}
                        </h3>
                        {expandedFAQ === faq.id && (
                          <p className="text-gray-600 mt-2 animate-fade-in">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">User Discussions</h2>
                  
                  {/* Filters */}
                  <div className="flex space-x-2">
                    <select 
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="p-2 border rounded-lg"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="p-2 border rounded-lg"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* New Discussion Form */}
                <div className="mb-6 bg-gray-100 p-4 rounded-lg">
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    value={newDiscussion.author}
                    onChange={(e) => setNewDiscussion({...newDiscussion, author: e.target.value})}
                    className="w-full p-2 border rounded-lg mb-4"
                  />
                  <input 
                    type="text" 
                    placeholder="Discussion Title"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
                    className="w-full p-2 border rounded-lg mb-4"
                  />
                  <textarea 
                    placeholder="Describe your issue or question"
                    value={newDiscussion.description}
                    onChange={(e) => setNewDiscussion({...newDiscussion, description: e.target.value})}
                    className="w-full p-2 border rounded-lg h-24 mb-4"
                  />
                  <select 
                    value={newDiscussion.category}
                    onChange={(e) => setNewDiscussion({...newDiscussion, category: e.target.value})}
                    className="w-full p-2 border rounded-lg mb-4"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAddDiscussion}
                    className="bg-blue-600 text-white p-2 rounded-lg w-full hover:bg-blue-700 transition"
                  >
                    Create Discussion
                  </button>
                </div>

                {/* Discussions List */}
                {filteredDiscussions.map((disc) => (
                  <div 
                    key={disc.id} 
                    className="bg-gray-100 p-4 rounded-lg mb-4 hover:shadow-md transition"
                  >
                    {editingDiscussion && editingDiscussion.id === disc.id ? (
                      <div>
                        <input 
                          type="text"
                          value={editingDiscussion.title}
                          onChange={(e) => setEditingDiscussion({...editingDiscussion, title: e.target.value})}
                          className="w-full p-2 border rounded-lg mb-2"
                        />
                        <textarea 
                          value={editingDiscussion.description}
                          onChange={(e) => setEditingDiscussion({...editingDiscussion, description: e.target.value})}
                          className="w-full p-2 border rounded-lg h-24 mb-2"
                        />
                        <select 
                          value={editingDiscussion.status}
                          onChange={(e) => setEditingDiscussion({...editingDiscussion, status: e.target.value})}
                          className="w-full p-2 border rounded-lg mb-2"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleUpdateDiscussion}
                            className="bg-green-600 text-white p-2 rounded-lg flex-1"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={() => setEditingDiscussion(null)}
                            className="bg-gray-300 text-gray-800 p-2 rounded-lg flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-lg flex items-center">
                          {disc.title}
                          {disc.status === 'Resolved' && (
                            <CheckCircle className="ml-2 text-green-600" />
                          )}
                        </h3>
                        <p className="text-gray-600 mb-2">{disc.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              Asked by {disc.author}
                            </span>
                            <span className="text-xs text-gray-400">
                              {disc.createdAt}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              disc.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                              disc.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {disc.status}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setEditingDiscussion(disc)}
                              className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDiscussion(disc.id)}
                              className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Replies Section */}
                        <div className="mt-4">
                          {disc.replies.map((reply) => (
                            <div key={reply.id} className="bg-white p-3 rounded-lg mb-2">
                              <p className="text-gray-700">{reply.text}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">
                                  {reply.author} - {reply.timestamp}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply Input */}
                        {replyingToDiscussion?.id === disc.id ? (
                          <div className="mt-4 flex space-x-2">
                            <input 
                              type="text"
                              placeholder="Write a reply..."
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              className="flex-1 p-2 border rounded-lg"
                            />
                            <button 
                              onClick={() => handleAddReply(disc.id)}
                              className="bg-blue-600 text-white p-2 rounded-lg"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setReplyingToDiscussion(disc)}
                            className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg mt-2 flex items-center"
                          >
                            <MessageCircle className="mr-2 w-4 h-4" /> Reply
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chatbot */}
          <AIChatbot 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
          />
          
          <button 
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;