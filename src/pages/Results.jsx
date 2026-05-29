import { useEffect, useState } from "react"
import { auth, db } from "../services/firebase.js"
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

function Results() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [resultFiles, setResultFiles] = useState([])
  const [myResults, setMyResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { navigate("/login"); return }
      setUser(u)
      const userDoc = await getDoc(doc(db, "users", u.uid))
      if (userDoc.exists()) setUserData(userDoc.data())
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      const q = query(collection(db, "results"), orderBy("uploadedAt", "desc"))
      const snap = await getDocs(q)
      setResultFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchResults()
  }, [])

  const searchMyResults = async () => {
    if (!userData?.studentId) {
      alert("No student ID found on your profile")
      return
    }
    setSearching(true)
    setMyResults([])

    try {
      for (const file of resultFiles) {
        const response = await fetch(file.fileURL)
        const text = await response.text()
        const rows = text.split("\n").map(r => r.split(",").map(c => c.trim()))
        const headers = rows[0]

        const myRow = rows.slice(1).find(row =>
          row[0]?.toUpperCase() === userData.studentId.toUpperCase()
        )

        if (myRow) {
          setMyResults(prev => [...prev, {
            fileName: file.fileName,
            uploadedBy: file.uploadedBy,
            uploadedAt: file.uploadedAt,
            headers,
            data: myRow
          }])
        }
      }
    } catch (error) {
      alert("Error fetching results. Try again.")
    }
    setSearching(false)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    return timestamp.toDate().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-blue-900 transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-lg font-semibold text-blue-900">My Results</h1>
          <p className="text-xs text-gray-400">View your academic results</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Student ID card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Searching results for</p>
              <p className="text-lg font-semibold text-blue-900">{userData?.name}</p>
              <p className="text-sm text-gray-500">{userData?.studentId}</p>
            </div>
            <button
              onClick={searchMyResults}
              disabled={searching || loading}
              className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {searching ? "Searching..." : "Find my results"}
            </button>
          </div>
        </div>

        {/* My results */}
        {myResults.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-700">Your Results</h3>
            {myResults.map((result, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{result.fileName}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded by {result.uploadedBy} · {formatDate(result.uploadedAt)}
                    </p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                    Found
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {result.headers.map((header, j) => (
                    <div key={j} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{header}</p>
                      <p className="text-sm font-semibold text-blue-900">{result.data[j] || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not found state */}
        {!searching && myResults.length === 0 && resultFiles.length > 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">Click "Find my results" to search</p>
            <p className="text-xs mt-1">Your student ID will be matched against uploaded result files</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Loading result files...</p>
          </div>
        )}

        {/* All uploaded files */}
        {!loading && resultFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">All Result Files</h3>
            <div className="space-y-3">
              {resultFiles.map(file => (
                <div key={file.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-900 text-lg">
                      📄
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {file.uploadedBy} · {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  
                 
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && resultFiles.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No results have been uploaded yet</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Results