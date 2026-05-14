import { useState, useEffect, useRef } from "react"
import { auth, db } from "../services/firebase.js"
import {
  collection, query, where, onSnapshot, addDoc,
  serverTimestamp, orderBy, getDocs, doc, getDoc,
  updateDoc, arrayUnion, arrayRemove
} from "firebase/firestore"
import { useNavigate } from "react-router-dom"

function Chat() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserData, setCurrentUserData] = useState(null)
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [activeTab, setActiveTab] = useState("chats")
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  // Get current user
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { navigate("/login"); return }
      setCurrentUser(u)
      const userDoc = await getDoc(doc(db, "users", u.uid))
      if (userDoc.exists()) setCurrentUserData(userDoc.data())
    })
    return () => unsub()
  }, [])

  // Listen to friend requests
  useEffect(() => {
    if (!currentUser) return
    const userRef = doc(db, "users", currentUser.uid)
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setFriends(data.friends || [])
        setFriendRequests(data.friendRequests || [])
      }
    })
    return () => unsub()
  }, [currentUser])

  // Listen to messages
  useEffect(() => {
    if (!selectedFriend || !currentUser) return
    const chatId = getChatId(currentUser.uid, selectedFriend.uid)
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [selectedFriend, currentUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join("_")
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    const q = query(
      collection(db, "users"),
      where("studentId", ">=", searchQuery.toUpperCase()),
      where("studentId", "<=", searchQuery.toUpperCase() + "\uf8ff")
    )
    const q2 = query(
      collection(db, "users"),
      where("name", ">=", searchQuery),
      where("name", "<=", searchQuery + "\uf8ff")
    )
    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
    const results = []
    const seen = new Set()
    ;[...snap1.docs, ...snap2.docs].forEach(d => {
      if (!seen.has(d.id) && d.id !== currentUser.uid) {
        seen.add(d.id)
        results.push({ uid: d.id, ...d.data() })
      }
    })
    setSearchResults(results)
  }

  const sendFriendRequest = async (targetUser) => {
    const targetRef = doc(db, "users", targetUser.uid)
    await updateDoc(targetRef, {
      friendRequests: arrayUnion({
        uid: currentUser.uid,
        name: currentUserData.name,
        studentId: currentUserData.studentId
      })
    })
    alert(`Friend request sent to ${targetUser.name}`)
  }

  const acceptRequest = async (requester) => {
    const currentRef = doc(db, "users", currentUser.uid)
    const requesterRef = doc(db, "users", requester.uid)

    await updateDoc(currentRef, {
      friends: arrayUnion({ uid: requester.uid, name: requester.name, studentId: requester.studentId }),
      friendRequests: arrayRemove(requester)
    })
    await updateDoc(requesterRef, {
      friends: arrayUnion({ uid: currentUser.uid, name: currentUserData.name, studentId: currentUserData.studentId })
    })
  }

  const declineRequest = async (requester) => {
    const currentRef = doc(db, "users", currentUser.uid)
    await updateDoc(currentRef, {
      friendRequests: arrayRemove(requester)
    })
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedFriend) return
    const chatId = getChatId(currentUser.uid, selectedFriend.uid)
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: input,
      senderId: currentUser.uid,
      senderName: currentUserData.name,
      createdAt: serverTimestamp()
    })
    setInput("")
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-blue-900 transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-lg font-semibold text-blue-900">Messages</h1>
          <p className="text-xs text-gray-400">Chat with other students</p>
        </div>
      </div>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-6">

        {/* Left panel */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">

          {/* Tabs */}
          <div className="flex bg-white rounded-xl border border-gray-100 p-1">
            {["chats", "requests", "search"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-xs py-2 rounded-lg capitalize font-medium transition-colors
                  ${activeTab === tab ? "bg-blue-900 text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
                {tab === "requests" && friendRequests.length > 0 && (
                  <span className="ml-1 bg-amber-400 text-blue-900 text-xs rounded-full px-1.5">
                    {friendRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Chats tab */}
          {activeTab === "chats" && (
            <div className="bg-white rounded-xl border border-gray-100 flex-1">
              {friends.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-sm">No friends yet</p>
                  <p className="text-xs mt-1">Search to add students</p>
                </div>
              ) : friends.map(friend => (
                <button
                  key={friend.uid}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0
                    ${selectedFriend?.uid === friend.uid ? "bg-blue-50" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold flex-shrink-0">
                    {friend.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{friend.name}</p>
                    <p className="text-xs text-gray-400">{friend.studentId}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Requests tab */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-xl border border-gray-100 flex-1">
              {friendRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-2xl mb-2">📭</p>
                  <p className="text-sm">No pending requests</p>
                </div>
              ) : friendRequests.map(req => (
                <div key={req.uid} className="p-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold">
                      {req.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{req.name}</p>
                      <p className="text-xs text-gray-400">{req.studentId}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req)}
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white text-xs py-1.5 rounded-lg transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineRequest(req)}
                      className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs py-1.5 rounded-lg transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search tab */}
          {activeTab === "search" && (
            <div className="bg-white rounded-xl border border-gray-100 flex-1 p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Name or Student ID"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 transition-colors"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                />
                <button
                  onClick={searchUsers}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Go
                </button>
              </div>
              <div className="space-y-2">
                {searchResults.map(user => (
                  <div key={user.uid} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-xs font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.studentId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => sendFriendRequest(user)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
          {!selectedFriend ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">Select a friend to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold">
                  {selectedFriend.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedFriend.name}</p>
                  <p className="text-xs text-gray-400">{selectedFriend.studentId}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                      ${msg.senderId === currentUser.uid
                        ? "bg-blue-900 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-4 flex gap-3">
                <input
                  type="text"
                  value={input}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat