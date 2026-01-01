import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Send, Copy, RefreshCw, Mail, Sparkles,
  Check, Edit2, AlertCircle, Paperclip, Trash2,
  Search, ChevronLeft, ChevronRight, CheckCircle,
  Maximize2, Minimize2, Loader2, Inbox, Zap
} from 'lucide-react';
import axios from 'axios';

const AIMailAssistant = ({ 
  isOpen = true, 
  onClose = () => {}, 
  baseUrl = 'http://localhost:8000'
}) => {
  // States
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailHistory, setEmailHistory] = useState([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [tone, setTone] = useState('professional');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [emailLogId, setEmailLogId] = useState(null);
  const [emailStatus, setEmailStatus] = useState('draft');
  const [sentAt, setSentAt] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const emailDisplayRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Email tones
  const EMAIL_TONES = [
    { id: 'professional', label: 'Professional', color: 'bg-blue-100 text-blue-800' },
    { id: 'friendly', label: 'Friendly', color: 'bg-green-100 text-green-800' },
    { id: 'formal', label: 'Formal', color: 'bg-purple-100 text-purple-800' },
    { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ];

  // API endpoints
  const API_ENDPOINTS = {
    GENERATE_EMAIL: `${baseUrl}/ai-email/generate/`,
    CUSTOMIZE_EMAIL: `${baseUrl}/ai-email/customize/`,
    SEND_EMAIL: `${baseUrl}/ai-email/send/`,
    GET_DRAFTS: `${baseUrl}/ai-email/drafts/`,
    GET_DRAFT_DETAIL: (id) => `${baseUrl}/ai-email/drafts/${id}/`,
  };

  // Get auth headers
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return null;
    }

    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Load email drafts
  const loadEmailDrafts = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      const response = await axios.get(API_ENDPOINTS.GET_DRAFTS, { headers });
      if (response.data.success) {
        const history = response.data.drafts?.map(draft => ({
          id: draft.id,
          subject: draft.subject,
          recipient: draft.recipient_email || 'No recipient',
          tone: draft.tone || 'professional',
          status: draft.status || 'draft',
          timestamp: draft.created_at,
          content: draft.body, // Added content to load email body
        })) || [];
        setEmailHistory(history);
        
        // Load the first draft if available
        if (history.length > 0) {
          const firstDraft = history[0];
          setGeneratedEmail(firstDraft.content);
          setCurrentSubject(firstDraft.subject);
          setCurrentRecipient(firstDraft.recipient);
          setTone(firstDraft.tone);
          setEmailLogId(firstDraft.id);
          setEmailStatus(firstDraft.status);
        }
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  }, [baseUrl]);

  // Generate email
  const generateEmail = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedEmail('');

    const headers = getHeaders();
    if (!headers) {
      setError('Authentication required.');
      setIsGenerating(false);
      return;
    }

    const requestData = {
      prompt: prompt.trim(),
      recipient_email: currentRecipient || '',
      tone: tone,
    };

    try {
      const response = await axios.post(
        API_ENDPOINTS.GENERATE_EMAIL,
        requestData,
        { headers, timeout: 60000 }
      );

      if (response.data.success) {
        setGeneratedEmail(response.data.body);
        setCurrentSubject(response.data.subject);
        setEmailLogId(response.data.email_log_id);
        setEmailStatus('draft');
        
        // Add to history
        const newEmail = {
          id: response.data.email_log_id,
          subject: response.data.subject,
          recipient: currentRecipient || '',
          tone: tone,
          status: 'draft',
          timestamp: new Date().toISOString(),
          content: response.data.body,
        };
        
        setEmailHistory(prev => [newEmail, ...prev]);
        setSuccessMessage('✅ Email generated successfully');
        setPrompt(''); // Clear prompt after successful generation
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Error generating email:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate email');
      
      // Fallback to mock data
      if (err.response?.status === 404 || err.code === 'ECONNREFUSED') {
        setError('🤖 AI service unavailable. Please try again in a moment.');
        setTimeout(() => {
          setGeneratedEmail(`Dear ${currentRecipient || 'Recipient'},

I hope this email finds you well. ${prompt}

Best regards,
[Your Name]`);
          setCurrentSubject(`Regarding: ${prompt.substring(0, 50)}...`);
          setEmailStatus('draft');
          setIsGenerating(false);
        }, 1000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Send email
  const sendEmail = async () => {
    if (!emailLogId || !generatedEmail.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    const headers = getHeaders();
    if (!headers) {
      setError('Authentication required.');
      setIsSending(false);
      return;
    }

    if (!currentRecipient) {
      setError('Please add a recipient');
      setIsSending(false);
      return;
    }

    const requestData = {
      email_log_id: emailLogId,
      use_pms_email: true, // Always use PMS system
      additional_recipients: [],
    };

    try {
      const response = await axios.post(
        API_ENDPOINTS.SEND_EMAIL,
        requestData,
        { headers, timeout: 30000 }
      );

      if (response.data.success) {
        setEmailStatus('sent');
        setSentAt(new Date().toISOString());
        
        // Update history
        setEmailHistory(prev => prev.map(email => 
          email.id === emailLogId 
            ? { ...email, status: 'sent', sent_at: new Date().toISOString() }
            : email
        ));
        
        setSuccessMessage(`📧 Email sent successfully!`);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        throw new Error(response.data.error || 'Sending failed');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setEmailStatus('failed');
      setError(err.response?.data?.error || err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  // Regenerate email
  const regenerateEmail = async () => {
    if (!prompt.trim()) return;
    generateEmail();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!generatedEmail) return;
    
    const emailText = `Subject: ${currentSubject}\n\n${generatedEmail}`;
    
    navigator.clipboard.writeText(emailText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError('Failed to copy to clipboard');
      });
  };

  // Handle attachment
  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    // Handle attachments here
    console.log('Files attached:', files);
  };

  // Load email from history
  const loadEmailFromHistory = (email) => {
    setGeneratedEmail(email.content);
    setCurrentSubject(email.subject);
    setCurrentRecipient(email.recipient);
    setTone(email.tone);
    setEmailLogId(email.id);
    setEmailStatus(email.status);
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      loadEmailDrafts();
    }
  }, [isOpen, loadEmailDrafts]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    if (emailDisplayRef.current && generatedEmail) {
      emailDisplayRef.current.scrollTop = emailDisplayRef.current.scrollHeight;
    }
  }, [generatedEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Main Modal - 90% width */}
      <div className="relative bg-white rounded-xl shadow-2xl flex flex-col w-[90%] max-w-6xl h-[85vh] overflow-hidden">
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Mail className="w-6 h-6" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Mail Assistant</h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - History */}
          {isHistoryOpen && (
            <div className="w-64 border-r border-gray-200 flex flex-col">
              <div className="p-3 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">History</h3>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search history..."
                      className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-1">
                    {['all', 'draft', 'sent'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-2 py-1 text-xs rounded-full capitalize ${
                          filterStatus === status
                            ? status === 'sent' ? 'bg-green-100 text-green-700' :
                              status === 'draft' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Email List */}
              <div className="flex-1 overflow-y-auto p-2">
                {emailHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No email history</p>
                    <p className="text-gray-400 text-xs mt-1">Generated emails will appear here</p>
                  </div>
                ) : (
                  emailHistory
                    .filter(email => filterStatus === 'all' || email.status === filterStatus)
                    .filter(email => 
                      searchTerm === '' || 
                      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      email.recipient.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((email) => (
                      <div
                        key={email.id}
                        className={`p-2 mb-1 rounded border cursor-pointer transition-colors ${
                          emailLogId === email.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => loadEmailFromHistory(email)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800 truncate text-xs">
                            {email.subject || 'Untitled Email'}
                          </h4>
                          {email.status === 'sent' && (
                            <CheckCircle size={12} className="text-green-500" />
                          )}
                        </div>
                        <p className="text-gray-600 truncate mt-1 text-xs">
                          To: {email.recipient || 'No recipient'}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                            email.tone === 'professional' ? 'bg-blue-100 text-blue-700' :
                            email.tone === 'friendly' ? 'bg-green-100 text-green-700' :
                            email.tone === 'urgent' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {email.tone}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(email.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="border-b border-gray-200 p-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {!isHistoryOpen && (
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  emailStatus === 'sent' ? 'bg-green-100 text-green-700' :
                  emailStatus === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {emailStatus === 'sent' ? '✓ Sent' :
                   emailStatus === 'failed' ? '✗ Failed' :
                   '✎ Draft'}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedEmail}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                    isCopied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>Copy</span>
                </button>
                
                <button
                  onClick={regenerateEmail}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  <span>Regen</span>
                </button>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Email Editor - Left 70% */}
              <div className="flex-1 flex flex-col p-4">
                {/* Subject Line */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    placeholder="Subject..."
                    className="w-full px-3 py-2 font-medium border border-gray-300 rounded text-sm"
                  />
                </div>

                {/* Recipient Input */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={currentRecipient}
                    onChange={(e) => setCurrentRecipient(e.target.value)}
                    placeholder="To: email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                {/* Email Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      {EMAIL_TONES.map((toneOption) => (
                        <option key={toneOption.id} value={toneOption.id}>
                          {toneOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Email Display */}
                  <div 
                    ref={emailDisplayRef}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 overflow-y-auto text-sm"
                  >
                    {isGenerating ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="relative mb-3">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <p className="text-gray-600 text-center text-sm">
                          AI is crafting your email...
                        </p>
                      </div>
                    ) : generatedEmail ? (
                      <div className="whitespace-pre-wrap text-gray-800">
                        {generatedEmail}
                      </div>
                    ) : error ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-2">
                          <p>{error}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Mail className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-600 text-sm">
                          Describe your email below
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Messages - Vertical Layout */}
                  <div className="space-y-2 mt-2">
                    {error && (
                      <div className="flex items-start space-x-2 p-2 bg-red-100 border border-red-300 rounded text-sm">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Error</p>
                          <p className="text-red-700">{error}</p>
                        </div>
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="flex items-start space-x-2 p-2 bg-green-100 border border-green-300 rounded text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Success</p>
                          <p className="text-green-700">{successMessage}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Controls - Right 30% */}
              <div className="w-72 border-l border-gray-200 flex flex-col p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">Actions</h3>

                  {/* Action Buttons */}
                  <div className="space-y-2 mb-4">
                    <button
                      onClick={generateEmail}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Email'}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={copyToClipboard}
                        disabled={!generatedEmail}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
                      >
                        Copy
                      </button>
                      <button
                        onClick={sendEmail}
                        disabled={!generatedEmail || isSending || emailStatus === 'sent'}
                        className="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    AI Prompt
                  </label>
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your email..."
                      className="w-full h-full p-3 border border-gray-300 rounded text-sm resize-none"
                      rows={4}
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-2 right-2">
                      <button
                        onClick={generateEmail}
                        disabled={!prompt.trim() || isGenerating}
                        className={`p-1.5 rounded-full ${
                          !prompt.trim() || isGenerating
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="border-t border-gray-200 p-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-600">
                {emailStatus === 'sent' ? 'Sent' : 
                 emailStatus === 'failed' ? 'Failed' : 
                 generatedEmail ? 'Ready' : 'Input needed'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {emailHistory.length} emails
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMailAssistant;