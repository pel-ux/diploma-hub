import { useEffect, useState } from "react"
import { auth, db } from "../services/firebase.js"
import { signOut } from "firebase/auth"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

function Dashboard() {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/login")
      else setUser(u)
    })
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(3)
    )
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "assistant", label: "AI Assistant", icon: "🤖" },
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "practice", label: "Practice Tests", icon: "📝" },
  ]

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Student"

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-blue-900 flex flex-col justify-between p-6
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-blue-900 text-sm font-bold">D</span>
            </div>
            <h1 className="text-white text-lg font-semibold">DiplomaHub</h1>
          </div>

          {/* Nav items */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
               onClick={() => {
  setActivePage(item.id)
  setSidebarOpen(false)
  if (item.id === "notifications") navigate("/notifications")
  if (item.id === "assistant") navigate("/assistant")
  if (item.id === "chat") navigate("/chat")
}}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${activePage === item.id
                    ? "bg-white/15 text-white"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User + logout */}
        <div className="border-t border-white/10 pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold">
              {firstName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{firstName}</p>
              <p className="text-blue-300 text-xs truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-blue-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            🚪 Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                Welcome back, {firstName} 👋
              </h2>
              <p className="text-xs text-gray-400">Sciences Diploma Programme</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold">
            {firstName[0].toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           {[
  { label: "Notifications", value: notifications.length, icon: "🔔", color: "bg-blue-50 text-blue-900" },
  { label: "Messages", value: "0", icon: "💬", color: "bg-amber-50 text-amber-700" },
  { label: "Practice Tests", value: "0", icon: "📝", color: "bg-green-50 text-green-700" },
  { label: "AI Chats", value: "0", icon: "🤖", color: "bg-purple-50 text-purple-700" },
].map(stat => (
  <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
    <p className="text-2xl mb-1">{stat.icon}</p>
    <p className="text-2xl font-semibold">{stat.value}</p>
    <p className="text-xs opacity-70 mt-0.5">{stat.label}</p>
  </div>
))}
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-blue-900">Recent Notifications</h3>
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-xs text-amber-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No notifications yet</p>
                ) : notifications.map(n => (
                  <div key={n.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-900 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-blue-900 mb-5">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Start AI Study Session", sub: "Ask exam questions", icon: "🤖", action: () => navigate("/assistant") },
                  { label: "View Notifications", sub: "Check announcements", icon: "🔔", action: () => navigate("/notifications") },
                 { label: "Message a Friend", sub: "Real-time chat", icon: "💬", action: () => navigate("/chat") },
                  { label: "Take a Practice Test", sub: "Exam simulation", icon: "📝", action: () => setActivePage("practice") },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard