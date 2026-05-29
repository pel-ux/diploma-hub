import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../services/firebase.js"
import { doc, setDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

const LECTURER_CODE = import.meta.env.VITE_LECTURER_CODE
const HOC_CODE = import.meta.env.VITE_HOC_CODE

function StaffRegister() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const getRole = (code) => {
    if (code === LECTURER_CODE) return "lecturer"
    if (code === HOC_CODE) return "hoc"
    return null
  }

  const handleRegister = async () => {
    setError("")

    if (!name.trim()) { setError("Please enter your full name"); return }
    if (!email.trim()) { setError("Please enter your email"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }

    const role = getRole(accessCode)
    if (!role) {
      setError("Invalid access code. Contact your administrator.")
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date()
      })

      if (role === "lecturer") {
        navigate("/lecturer-dashboard")
      } else {
        navigate("/hoc-dashboard")
      }

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Sign in instead.")
      } else {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left - image */}
      <div className="w-full h-48 lg:h-auto lg:w-1/2">
        <img
          src="/dp.jpg"
          alt="hero"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">D</span>
            </div>
            <h1 className="text-gray-900 text-lg font-semibold">DiplomaHub</h1>
          </div>

          <h3 className="text-2xl font-semibold text-blue-900 mb-1">Create staff account</h3>
          <p className="text-sm text-gray-500 mb-8">You need a valid access code to register as staff</p>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder=""
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Staff Access Code</label>
              <input
                type="password"
                placeholder="Enter your access code"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Lecturer code or HOC code — contact your administrator
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Creating account..." : "Create staff account"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have a staff account?{" "}
              <span
                onClick={() => navigate("/staff-login")}
                className="text-amber-600 cursor-pointer hover:underline"
              >
                Sign in
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffRegister