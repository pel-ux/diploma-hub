import { useEffect, useState } from "react"
import { auth, db, storage } from "../services/firebase.js"
import { signOut } from "firebase/auth"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useNavigate } from "react-router-dom"

function LecturerDashboard() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [posting, setPosting] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedResults, setUploadedResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { navigate("/staff-login"); return }
      setUser(u)
      const userDoc = await getDoc(doc(db, "users", u.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        if (data.role !== "lecturer" && data.role !== "hoc") {
          navigate("/dashboard")
          return
        }
        setUserData(data)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/staff-login")
  }

  const handlePostNotification = async () => {
    if (!title.trim() || !body.trim()) { alert("Fill in both fields"); return }
    setPosting(true)
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        body,
        postedBy: userData?.name || user?.email,
        role: "lecturer",
        createdAt: serverTimestamp()
      })
      setTitle("")
      setBody("")
      alert("Notification posted successfully")
    } catch (error) {
      alert(error.message)
    }
    setPosting(false)
  }

  const handleCSVUpload = async () => {
    if (!csvFile) { alert("Please select a CSV file"); return }
    setUploading(true)
    try {
      const storageRef = ref(storage, `results/${csvFile.name}-${Date.now()}`)
      await uploadBytes(storageRef, csvFile)
      const downloadURL = await getDownloadURL(storageRef)

      await addDoc(collection(db, "results"), {
        fileName: csvFile.name,
        uploadedBy: userData?.name || user?.email,
        uploadedAt: serverTimestamp(),
        fileURL: downloadURL
      })

      // Parse CSV for preview
      const text = await csvFile.text()
      const rows = text.split("\n").map(r => r.split(","))
      setUploadedResults(rows)
      alert("Results uploaded successfully")
    } catch (error) {
      alert(error.message)
    }
    setUploading(false)
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "notifications", label: "Post Notification", icon: "🔔" },
    { id: "results", label: "Upload Results", icon: "📊" },
    { id: "assistant", label: "AI Assistant", icon: "🤖" },
  ]

  const firstName = userData?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Lecturer"

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-blue-900 flex flex-col justify-between p-6
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-blue-900 text-sm font-bold">D</span>
            </div>
            <h1 className="text-white text-lg font-semibold">DiplomaHub</h1>
          </div>

          <div className="bg-white/10 rounded-lg px-3 py-2 mb-6">
            <p className="text-amber-400 text-xs font-medium">Lecturer Portal</p>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false) }}
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

        <div className="border-t border-white/10 pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold">
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{firstName}</p>
              <p className="text-amber-400 text-xs">Lecturer</p>
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

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Welcome, {firstName} 👋</h2>
              <p className="text-xs text-gray-400">Lecturer — Sciences Diploma Programme</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-sm font-bold">
            {firstName[0]?.toUpperCase()}
          </div>
        </header>

        <main className="flex-1 p-6">

          {/* Dashboard overview */}
          {activePage === "dashboard" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Notifications Posted", value: notifications.filter(n => n.postedBy === userData?.name).length, icon: "🔔", color: "bg-blue-50 text-blue-900" },
                  { label: "Results Uploaded", value: "—", icon: "📊", color: "bg-amber-50 text-amber-700" },
                  { label: "AI Sessions", value: "—", icon: "🤖", color: "bg-purple-50 text-purple-700" },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
                    <p className="text-2xl mb-1">{stat.icon}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-xs opacity-70 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Post a Notification", sub: "Announce to all students", icon: "🔔", action: () => setActivePage("notifications") },
                      { label: "Upload Results", sub: "Upload CSV result file", icon: "📊", action: () => setActivePage("results") },
                      { label: "AI Assistant", sub: "Ask academic questions", icon: "🤖", action: () => navigate("/assistant") },
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

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Recent Notifications</h3>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No notifications yet</p>
                    ) : notifications.slice(0, 3).map(n => (
                      <div key={n.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-blue-900 mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.postedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post notification */}
          {activePage === "notifications" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-blue-900 mb-6">Post Notification</h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    placeholder="e.g. Exam timetable released"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Message</label>
                  <textarea
                    value={body}
                    placeholder="Write your announcement here..."
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors resize-none"
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <button
                  onClick={handlePostNotification}
                  disabled={posting}
                  className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {posting ? "Posting..." : "Post Notification"}
                </button>
              </div>
            </div>
          )}

          {/* Upload results */}
          {activePage === "results" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-blue-900 mb-6">Upload Results</h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 transition-colors"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                  />
                  <p className="text-xs text-gray-400 mt-1">CSV format: StudentID, Name, Score, Grade</p>
                </div>

                <button
                  onClick={handleCSVUpload}
                  disabled={uploading || !csvFile}
                  className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {uploading ? "Uploading..." : "Upload Results"}
                </button>

                {/* CSV preview */}
                {uploadedResults.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {uploadedResults.slice(0, 6).map((row, i) => (
                            <tr key={i} className={i === 0 ? "bg-blue-50 font-medium" : "border-t border-gray-100"}>
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2 text-gray-700">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default LecturerDashboard