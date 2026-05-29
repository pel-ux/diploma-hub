import { useState, useEffect } from "react"
import { auth, db } from "../services/firebase.js"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"


function CompleteProfile() {
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { navigate("/login"); return }
      const userDoc = await getDoc(doc(db, "users", u.uid))
      if (userDoc.exists() && userDoc.data().studentId) {
        navigate("/dashboard")
      } else {
        setName(u.displayName || "")
      }
    })
    return () => unsub()
  }, [])

  const validateStudentId = (id) => {
    return /^DN\d{12}$/.test(id)
  }

  const handleSubmit = async () => {
    setError("")
    if (!name.trim()) { setError("Please enter your full name"); return }
    if (!validateStudentId(studentId)) {
      setError("Student ID must start with DN followed by exactly 12 digits e.g. DN123456789012")
      return
    }
    setLoading(true)
    try {
      const u = auth.currentUser
      await setDoc(doc(db, "users", u.uid), {
        name: name,
        studentId: studentId,
        email: u.email,
        role: "student",
        createdAt: new Date()
      }, { merge: true })
      navigate("/dashboard")
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel - image */}
      <div className="hidden lg:flex w-2/5 bg-blue-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <span className="text-blue-900 text-xs font-bold">D</span>
          </div>
          <h1 className="text-white text-lg font-semibold">DiplomaHub</h1>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <img
            src={heroImage}
            alt="hero"
            className="w-full max-w-xs rounded-2xl object-cover"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['CMD', 'CSD', 'DSD'].map(s => (
            <span key={s} className="bg-white/10 text-blue-100 text-xs px-3 py-1 rounded-full border border-white/20">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">D</span>
            </div>
            <h1 className="text-gray-900 text-lg font-semibold">DiplomaHub</h1>
          </div>

          <h3 className="text-2xl font-semibold text-blue-900 mb-1">Complete your profile</h3>
          <p className="text-sm text-gray-500 mb-8">We need a few more details before you continue</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                placeholder="e.g. Omojola Emmanuel"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Student ID</label>
              <input
                type="text"
                value={studentId}
                placeholder="e.g. DN123456789012"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-gray-400 mt-1">Must start with DN followed by 12 digits</p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfile