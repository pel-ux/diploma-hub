import { useNavigate } from "react-router-dom"
import heroImage from "/dp.jpg"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">D</span>
          </div>
          <h1 className="text-gray-900 text-lg font-semibold">DiplomaHub</h1>
        </div>
      <div className="flex gap-3 flex-wrap">
  <button
    onClick={() => navigate("/register")}
    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
  >
    Student portal
  </button>
  <button
    onClick={() => navigate("/staff-login")}
    className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
  >
    Staff portal
  </button>
</div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-8 py-16 max-w-6xl mx-auto w-full">

        {/* Left - text */}
        <div className="flex-1 flex flex-col items-start text-left max-w-lg">
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-6">
            Diploma Hub — Sciences Programme
          </span>

          <h1 className="text-5xl font-semibold text-blue-900 leading-tight mb-5">
            A space built for Diploma.
          </h1>

          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Get course notifications, connect with other students, practice exam questions, and chat with an AI study assistant — all in one place.
          </p>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Create account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Sign in
            </button>
          </div>

          {/* Subject pills */}
          <div className="flex gap-2 flex-wrap mt-10">
            {['CMD', 'CSD',  'DSD',].map(s => (
              <span key={s} className="text-xs text-blue-9000 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Right - image placeholder */}
      <img
  src={heroImage}
  alt="dp.jpg"
  className="w-full max-w-sm rounded-2xl object-cover shadow-sm"
/>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-5 text-center">
        <p className="text-xs text-gray-400">© 2026 DiplomaHub. Built for sciences students.</p>
      </div>

    </div>
  )
}

export default Home