"use client"

import { useState, useRef, useEffect } from "react"

const PopupChatWindow = (props) => {
  // Removed isPopupOpen state; now the parent controls rendering of this component.
  const [isFullPage, setIsFullPage] = useState(false)
  const [message, setMessage] = useState("")
  const [activeChat, setActiveChat] = useState("team-general")
  const [teamMembers] = useState([
    { id: "alex", name: "Alex Morgan", avatar: "A", online: true },
    { id: "jamie", name: "Jamie Chen", avatar: "J", online: true },
    { id: "taylor", name: "Taylor Kim", avatar: "T", online: false },
    { id: "jordan", name: "Jordan Smith", avatar: "J", online: true },
  ])

  // Updated team chats with icon information
  const [teamChats, setTeamChats] = useState([
    { id: "team-general", name: "General", unread: 2, icon: "message-circle" },
    { id: "team-projects", name: "Projects", unread: 0, icon: "folder" },
    { id: "team-random", name: "Random", unread: 5, icon: "coffee" },
  ])

  // Filter chats to only show current workspace chats
  const [currentWorkspace] = useState({
    id: "current-workspace",
    name: "PMS Team", // Replace with your actual workspace name
  }) // This would come from your app context or props
  const filteredTeamChats = teamChats.filter(
    (chat) => chat.id.startsWith(`${currentWorkspace.id}-`) || chat.id === "team-general",
  )

  const [conversations, setConversations] = useState({
    "team-general": [
      { id: 1, sender: "alex", text: "Hey team, has anyone started on the new project designs?", time: "10:23 AM" },
      { id: 2, sender: "jamie", text: "I was just looking at them. We should sync up soon.", time: "10:25 AM" },
      {
        id: 3,
        sender: "taylor",
        text: "I created some initial wireframes already. Will share today.",
        time: "10:30 AM",
      },
    ],
    alex: [
      { id: 1, sender: "alex", text: "Hey, do you have time to review my PR?", time: "9:45 AM" },
      { id: 2, sender: "user", text: "Sure, I can look at it after the standup", time: "9:47 AM" },
    ],
    jamie: [
      { id: 1, sender: "jamie", text: "Don't forget about the team lunch today!", time: "8:30 AM" },
      { id: 2, sender: "user", text: "Thanks for the reminder!", time: "8:32 AM" },
    ],
  })

  const chatRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll when new messages arrive or chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat, conversations])

  // Removed togglePopup since the parent controls rendering.
  const toggleFullPage = () => {
    setIsFullPage(!isFullPage)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() === "") return

    // Add the new message to the current conversation
    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setConversations((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }))

    setMessage("")
  }

  const changeChat = (chatId) => {
    setActiveChat(chatId)
  }

  // Get total unread count
  const totalUnread = teamChats.reduce((sum, chat) => sum + chat.unread, 0)

  // Get current conversation messages
  const currentMessages = conversations[activeChat] || []

  // Get current chat name
  const getCurrentChatName = () => {
    const teamChat = teamChats.find((c) => c.id === activeChat)
    if (teamChat) return teamChat.name

    const directChat = teamMembers.find((m) => m.id === activeChat)
    if (directChat) return directChat.name

    return ""
  }

  // Function to render channel icon (unchanged)
  const renderChannelIcon = (iconName) => {
    switch (iconName) {
      case "message-circle":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )
      case "folder":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        )
      case "coffee":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v16c0 1.1.9 2 2 2h12a2 2 0 002-2v-2m0-4v-4m-2-6h4m-4 0h-4a2 2 0 00-2 2v14a2 2 0 002 2h4M7 7h6"
            />
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
        )
    }
  }

  return (
    <>
      {/* Chat Container (Always rendered; parent controls overall rendering) */}
      <div
        ref={chatRef}
        className={`bg-white shadow-2xl rounded-lg overflow-hidden ${
          isFullPage
            ? "fixed inset-0 z-50 m-0"
            : "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[700px] z-40"
        } transition-all duration-300 border border-blue-100`}
        style={{
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -5px rgba(59, 130, 246, 0.05)",
        }}
      >
        {/* Header */}
        <div className="bg-blue-500 p-3 flex justify-between items-center">
          <h3 className="text-white font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
            {currentWorkspace.name} Chat
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={toggleFullPage}
              className="text-white hover:text-blue-200 focus:outline-none transition-transform duration-200 hover:scale-110"
              aria-label={isFullPage ? "Minimize" : "Expand"}
            >
              {isFullPage ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 12h14M5 16h14" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              )}
            </button>
            {/* 
              Optionally, you can call a parent callback to close the popup.
              For now, this button calls togglePopup; you might change it to:
              onClick={props.onClose} if you want to handle closing externally.
            */}
            <button
              onClick={() => {
                // For example, call a parent's onClose prop if provided.
                if (props.onClose) {
                  props.onClose()
                }
              }}
              className="text-white hover:text-blue-200 focus:outline-none transition-transform duration-200 hover:scale-110"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`flex ${isFullPage ? "h-[calc(100vh-64px)]" : "h-[500px]"}`}>
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h4 className="font-medium text-blue-700 text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Channels
              </h4>
            </div>

            {/* Team Channels */}
            {filteredTeamChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => changeChat(chat.id)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors duration-200 ${activeChat === chat.id ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
              >
                <div className="flex items-center">
                  <span className={`text-blue-600 mr-2 ${activeChat === chat.id ? "text-blue-700" : ""}`}>
                    {renderChannelIcon(chat.icon)}
                  </span>
                  <span className={`text-gray-700 ${activeChat === chat.id ? "font-medium" : ""}`}>{chat.name}</span>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}

            <div className="p-3 border-b border-t border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h4 className="font-medium text-blue-700 text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Direct Messages
              </h4>
            </div>

            {/* Team Members */}
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => changeChat(member.id)}
                className={`w-full text-left px-3 py-2 flex items-center hover:bg-blue-50 transition-colors duration-200 ${activeChat === member.id ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 ${member.online ? "ring-2 ring-green-400" : ""}`}
                >
                  {member.avatar}
                </div>
                <span className={`text-gray-700 ${activeChat === member.id ? "font-medium" : ""}`}>{member.name}</span>
                <span className={`ml-2 h-2 w-2 rounded-full ${member.online ? "bg-green-500" : "bg-gray-300"}`}></span>
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 flex items-center bg-white shadow-sm">
              <h4 className="font-medium text-blue-600 flex items-center">
                {activeChat.startsWith("team-") ? (
                  <>
                    <span className="mr-2 text-blue-600">
                      {renderChannelIcon(teamChats.find((c) => c.id === activeChat)?.icon || "hash")}
                    </span>
                  </>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 text-xs">
                    {teamMembers.find((m) => m.id === activeChat)?.avatar || "?"}
                  </div>
                )}
                {getCurrentChatName()}
              </h4>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-blue-50">
              {currentMessages.length > 0 ? (
                currentMessages.map((msg) => {
                  const sender = teamMembers.find((m) => m.id === msg.sender) || { name: "You", avatar: "Y" }
                  const isOwnMessage = msg.sender === "user"

                  return (
                    <div key={msg.id} className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      {!isOwnMessage && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 shadow-sm">
                          {sender.avatar}
                        </div>
                      )}
                      <div className={`max-w-xs ${isOwnMessage ? "text-right" : ""}`}>
                        {!isOwnMessage && (
                          <div className="text-xs text-gray-500 mb-1">
                            {sender.name} <span className="text-gray-400">{msg.time}</span>
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg shadow-sm ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                              : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        {isOwnMessage && (
                          <div className="text-xs text-gray-500 text-right mt-1">
                            You <span className="text-gray-400">{msg.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-2 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-center">No messages yet</p>
                  <p className="text-center text-sm">Be the first to send a message!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex bg-white">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message ${getCurrentChatName()}`}
                className="flex-1 py-2 px-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default PopupChatWindow

