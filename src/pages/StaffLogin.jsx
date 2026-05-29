import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../services/firebase.js"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

const LECTURER_CODE = import.meta.env.VITE_LECTURER_CODE
const HOC_CODE = import.meta.env.VITE_HOC_CODE

function StaffLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError("")

    if (!accessCode.trim()) {
      setError("Please enter your staff access code")
      return
    }

    if (accessCode !== LECTURER_CODE && accessCode !== HOC_CODE) {
      setError("Invalid access code. Contact your administrator.")
      return
    }

    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        setError("Account not found. Please register first.")
        setLoading(false)
        return
      }

      const role = userDoc.data().role

      if (role === "lecturer") {
        navigate("/lecturer-dashboard")
      } else if (role === "hoc") {
        navigate("/hoc-dashboard")
      } else {
        setError("You do not have staff access. Use the student portal.")
      }

    } catch (error) {
      setError("Invalid email or password.")
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

          <h3 className="text-2xl font-semibold text-blue-900 mb-1">Staff portal</h3>
          <p className="text-sm text-gray-500 mb-8">Sign in with your staff credentials and access code</p>

          <div className="space-y-4">

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
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Staff Access Code</label>
              <input
                type="password"
                placeholder="e.g. input the password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Contact your HOC if you don't have a code</p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-500">
              New staff member?{" "}
              <span
                onClick={() => navigate("/staff-register")}
                className="text-amber-600 cursor-pointer hover:underline"
              >
                Create staff account
              </span>
            </p>

            <p className="text-center text-sm text-gray-500">
              Student?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-amber-600 cursor-pointer hover:underline"
              >
                Go to student portal
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin