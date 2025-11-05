//frontend\pms\src\components\WorkspaceChat.jsx
import { useState, useEffect, useRef } from "react"
import { Send, X, MessageCircle, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import axios from "axios"

const WorkspaceChat = ({ isOpen, onClose, currentWorkspace }) => {
  // State management
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  
  // Refs
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  
  // API and WebSocket configuration
  const API_BASE = "http://localhost:8000"
  const WS_BASE = "ws://localhost:8000/ws/chat"
  const token = localStorage.getItem("token")
  
  // Axios instance
  const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history when component opens
  useEffect(() => {
    if (isOpen && currentWorkspace?.id) {
      loadChatHistory()
      connectWebSocket()
    }
    
    return () => {
      disconnectWebSocket()
    }
  }, [isOpen, currentWorkspace?.id])

  // Load chat history from API
  const loadChatHistory = async () => {
    if (!currentWorkspace?.id) return

    try {
      setLoading(true)
      console.log("📜 Loading chat history for workspace:", currentWorkspace.id)
      
      const response = await apiClient.get(
        `/chat/history/${currentWorkspace.id}/messages/`
      )
      
      console.log("📜 Chat history loaded:", response.data)
      setMessages(response.data || [])
      setError("")
    } catch (err) {
      console.error("❌ Error loading chat history:", err)
      setError("Failed to load chat history")
    } finally {
      setLoading(false)
    }
  }

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (!currentWorkspace?.id || !token) {
      setConnectionError("Missing workspace or authentication token")
      return
    }

    try {
      // Close existing connection if any
      disconnectWebSocket()

      const wsUrl = `${WS_BASE}/chatroom/${currentWorkspace.id}/?token=${token}`
      console.log("🔌 Connecting to WebSocket:", wsUrl)
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log("✅ WebSocket connected")
        setConnected(true)
        setConnectionError("")
      }
      
      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data)
          console.log("📨 Received message:", messageData)
          
          // Add new message to the list
          setMessages(prev => [...prev, messageData])
        } catch (err) {
          console.error("❌ Error parsing message:", err)
        }
      }
      
      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
        setConnectionError("Connection error occurred")
        setConnected(false)
      }
      
      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        setConnected(false)
        
        // Handle different close codes
        if (event.code === 4001) {
          setConnectionError("Authentication failed")
        } else if (event.code === 4003) {
          setConnectionError("Access forbidden - not a member of this workspace")
        } else if (event.code !== 1000) {
          // Attempt reconnection for unexpected closures
          setConnectionError("Connection lost. Reconnecting...")
          attemptReconnect()
        }
      }
      
      wsRef.current = ws
    } catch (err) {
      console.error("❌ Error creating WebSocket:", err)
      setConnectionError("Failed to connect to chat")
    }
  }

  // Attempt to reconnect
  const attemptReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isOpen && currentWorkspace?.id) {
        console.log("🔄 Attempting to reconnect...")
        connectWebSocket()
      }
    }, 3000)
  }

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, "Component unmounting")
      wsRef.current = null
    }
    
    setConnected(false)
  }

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to chat. Please wait...")
      return
    }

    try {
      const messagePayload = {
        message: newMessage.trim()
      }
      
      console.log("📤 Sending message:", messagePayload)
      wsRef.current.send(JSON.stringify(messagePayload))
      
      setNewMessage("")
      setError("")
    } catch (err) {
      console.error("❌ Error sending message:", err)
      setError("Failed to send message")
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} />
            <div>
              <h2 className="text-xl font-bold">
                {currentWorkspace?.name || "Workspace"} Chat
              </h2>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                {connected ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              disconnectWebSocket()
              onClose()
            }}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="p-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{connectionError}</span>
            <button
              onClick={connectWebSocket}
              className="ml-auto text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={32} />
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm mt-2">Be the first to start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isCurrentUser = msg.sender === currentUser.id
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isCurrentUser && (
                        <span className="text-xs text-gray-600 mb-1 px-2">
                          {msg.sender_name}
                        </span>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={connected ? "Type a message..." : "Connecting..."}
              disabled={!connected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!connected || !newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send size={18} />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceChat