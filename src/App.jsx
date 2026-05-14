import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import CompleteProfile from "./pages/CompleteProfile"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Notifications from "./pages/Notifications"
import Assistant from "./pages/Assistant"
import Chat from "./pages/Chat"



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
    </Routes>
  )
}

export default App