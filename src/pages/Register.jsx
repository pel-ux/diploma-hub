import { useState } from "react"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, db } from "../services/firebase.js"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

const provider = new GoogleAuthProvider()

function Register() {
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const navigate = useNavigate()



const handleRegister = async () => {
  if (password !== confirm) {
    alert("Passwords do not match")
    return
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save user to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      studentId: studentId,
      email: email,
      role: "student", // default role
      createdAt: new Date()
    })

    navigate("/dashboard")
  } catch (error) {
    alert(error.message)
  }
}
 
const handleGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists() || !userDoc.data().studentId) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        role: "student",
        createdAt: new Date()
      }, { merge: true })
      navigate("/complete-profile")
    } else {
      navigate("/dashboard")
    }
  } catch (error) {
    alert(error.message)
  }
}

  return (
    <div className="min-h-screen flex">

      <input
  img
  
  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
/>

      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-blue-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <span className="text-blue-900 text-xs font-bold">D</span>
          </div>
          <h1 className="text-white text-lg font-semibold">DiplomaHub</h1>
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
          {['Biology', 'Chemistry', 'Physics', 'Mathematics'].map(s => (
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

          <h3 className="text-2xl font-semibold text-blue-900 mb-1">Create account</h3>
          <p className="text-sm text-gray-500 mb-8">Fill in your details to get started</p>

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
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Omojola Emmanuel"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Student ID</label>
              <input
                type="text"
                placeholder="e.g. 2023/SCI/0042"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
                onChange={(e) => setStudentId(e.target.value)}
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

            <button
              onClick={handleRegister}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Create account
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
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

export default Register