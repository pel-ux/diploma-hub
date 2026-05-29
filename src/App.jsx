import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import CompleteProfile from "./pages/CompleteProfile"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Notifications from "./pages/Notifications"
import Assistant from "./pages/Assistant"
import Chat from "./pages/Chat"
import StaffLogin from "./pages/StaffLogin"
import StaffRegister from "./pages/StaffRegister"
import LecturerDashboard from "./pages/LecturerDashboard"
import HOCDashboard from "./pages/HOCDashboard"
import Results from "./pages/Results"
import Profile from "./pages/Profile"




function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
<Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/staff-register" element={<StaffRegister />} />
      <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
      <Route path="/hoc-dashboard" element={<HOCDashboard />} />
      <Route path="/results" element={<Results />} />
      <Route path="/profile" element={<Profile />} />
    
    </Routes>
  )
}

export default App