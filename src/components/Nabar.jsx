import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
          <span className="text-amber-400 text-xs font-bold">D</span>
        </div>
        <span className="text-gray-900 text-lg font-semibold">DiplomaHub</span>
      </Link>

      {/* Nav links */}
      <div className="flex gap-3 items-center">
        <Link
          to="/login"
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Student sign in
        </Link>
        <Link
          to="/staff-login"
          className="text-sm text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
        >
          Staff portal
        </Link>
      </div>

    </nav>
  )
}

export default Navbar