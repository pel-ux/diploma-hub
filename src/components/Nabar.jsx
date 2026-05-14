import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-8 py-5 flex justify-between items-center">

      <Link
        to="/"
        className="text-3xl font-extrabold text-blue-500"
      >
        DiplomaHub
      </Link>

      <div className="flex gap-6 items-center">

        <Link
          to="/login"
          className="text-gray-300 hover:text-white transition"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl transition"
        >
          Register
        </Link>

      </div>

    </nav>
  )
}

export default Navbar