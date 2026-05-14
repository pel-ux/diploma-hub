import { useNavigate } from "react-router-dom"

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
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            Get started
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
            A space built for diploma students.
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
              <span key={s} className="text-xs text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Right - image placeholder */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md">
          <div className="w-full aspect-square max-w-sm rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 flex flex-col items-center justify-center gap-3">
            {/* Replace with <img> when ready */}
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-amber-400">Your image goes here</p>
            <p className="text-xs text-amber-300">Replace with &lt;img&gt; tag</p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-5 text-center">
        <p className="text-xs text-gray-400">© 2026 DiplomaHub. Built for sciences students.</p>
      </div>

    </div>
  )
}

export default Home