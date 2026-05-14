import { useEffect, useState } from "react"
import { auth, db } from "../services/firebase.js"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [userRole, setUserRole] = useState("student")
  const [userName, setUserName] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  // Get current user role
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) { navigate("/login"); return }
      const userDoc = await getDoc(doc(db, "users", u.uid))
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role)
        setUserName(userDoc.data().name || u.displayName || u.email)
      }
    })
    return () => unsubAuth()
  }, [])

  // Listen to notifications in real time
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Fill in both fields")
      return
    }
    setPosting(true)
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        body,
        postedBy: userName,
        role: userRole,
        createdAt: serverTimestamp()
      })
      setTitle("")
      setBody("")
      setShowForm(false)
    } catch (error) {
      alert(error.message)
    }
    setPosting(false)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    return date.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-blue-900 transition-colors text-sm"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-semibold text-blue-900">Notifications</h1>
            <p className="text-xs text-gray-400">School announcements and updates</p>
          </div>
        </div>

        {/* Admin post button */}
        {userRole === "admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? "Cancel" : "+ Post Notification"}
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Admin post form */}
        {userRole === "admin" && showForm && (
          <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4">New Notification</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  placeholder="e.g. Exam timetable released"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
                <textarea
                  value={body}
                  placeholder="Write your announcement here..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors resize-none"
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <button
                onClick={handlePost}
                disabled={posting}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {posting ? "Posting..." : "Post Notification"}
              </button>
            </div>
          </div>
        )}

        {/* Notifications list */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔔</p>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{n.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-xs font-bold">
                    {n.postedBy?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{n.postedBy}</span>
                  {n.role === "admin" && (
                    <span className="text-blue-500 text-xs" title="Verified Admin">✓</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Notifications