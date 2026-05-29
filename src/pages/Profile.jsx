import { useEffect, useState, useRef } from "react"
import { auth, db, storage } from "../services/firebase.js"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useNavigate } from "react-router-dom"

function Profile() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [photoURL, setPhotoURL] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { navigate("/login"); return }
      setUser(u)
      const userDoc = await getDoc(doc(db, "users", u.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserData(data)
        setName(data.name || "")
        setBio(data.bio || "")
        setPhotoURL(data.photoURL || null)
      }
    })
    return () => unsub()
  }, [])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setPhotoURL(url)
      await updateDoc(doc(db, "users", user.uid), { photoURL: url })
    } catch (error) {
      alert(error.message)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!name.trim()) { alert("Name cannot be empty"); return }
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: name,
        bio: bio
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert(error.message)
    }
    setSaving(false)
  }

  const firstName = name?.split(" ")[0] || "Student"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-blue-900 dark:hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-lg font-semibold text-blue-900 dark:text-white">My Profile</h1>
          <p className="text-xs text-gray-400">Manage your account details</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Photo section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-4 flex flex-col items-center">
          <div
            onClick={() => fileRef.current.click()}
            className="relative cursor-pointer group mb-4"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center text-blue-900 text-3xl font-bold border-4 border-white dark:border-gray-800 shadow">
                {firstName[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {uploading ? (
            <p className="text-xs text-gray-400">Uploading...</p>
          ) : (
            <button
              onClick={() => fileRef.current.click()}
              className="text-xs text-amber-600 hover:underline"
            >
              Upload photo
            </button>
          )}
        </div>

        {/* Info section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-900 focus:bg-white dark:focus:bg-gray-700 transition-colors"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Student ID</label>
            <input
              type="text"
              value={userData?.studentId || "—"}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-400 outline-none cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Student ID cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Bio</label>
            <textarea
              value={bio}
              placeholder="Tell other students a bit about yourself..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-900 focus:bg-white dark:focus:bg-gray-700 transition-colors resize-none"
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && (
              <span className="text-xs text-green-600 font-medium">✓ Saved</span>
            )}
          </div>
        </div>

        {/* Role badge */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Account type</p>
          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 px-3 py-1 rounded-full font-medium capitalize">
            {userData?.role || "student"}
          </span>
        </div>

      </div>
    </div>
  )
}

export default Profile