import { useState } from "react"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../services/firebase.js"
import { useNavigate } from "react-router-dom"
import heroImage from "/mesii.jpg"

const provider = new GoogleAuthProvider()

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/dashboard")
    } catch (error) {
      alert(error.message)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider)
      navigate("/dashboard")
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen flex">


      <div className="hidden lg:flex w-2/5 bg-blue-900 flex-col justify-between p-12">
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
      <span className="text-blue-900 text-xs font-bold">D</span>
    </div>
    <h1 className="text-white text-lg font-semibold">DiplomaHub</h1>
  </div>

  {/* Add image here */}
  <div className="flex-1 flex items-center justify-center py-8">
    <img
      src={heroImage}
      alt="hero"
      className="w-full max-w-xs rounded-2xl object-cover"
    />
  </div>

  <div>
    <h2 className="text-white text-3xl font-medium leading-snug mb-4">
      Join your diploma programme portal.
    </h2>
    <p className="text-blue-200 text-sm leading-relaxed">
      Create your account to access notifications, exam prep, and your AI study assistant.
    </p>
  </div>

  <div className="flex gap-2 flex-wrap">
    {['CMD', 'CSD', 'DSD'].map(s => (
      <span key={s} className="bg-white/10 text-blue-100 text-xs px-3 py-1 rounded-full border border-white/20">
        {s}
      </span>
    ))}
  </div>
</div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">D</span>
            </div>
            <h1 className="text-gray-900 text-lg font-semibold">DiplomaHub</h1>
          </div>

          <h3 className="text-2xl font-semibold text-blue-900 mb-1">Sign in</h3>
          <p className="text-sm text-gray-500 mb-8">Enter your student credentials to continue</p>

          <div className="space-y-4">

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-xs text-gray-400">or continue with email</span>
              <div className="flex-1 h-px bg-gray-100"></div>
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="accent-blue-900" /> Remember me
              </label>
              <a href="#" className="text-amber-600 hover:underline">Forgot password?</a>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Sign in
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-amber-600 cursor-pointer hover:underline"
              >
                Create account
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login