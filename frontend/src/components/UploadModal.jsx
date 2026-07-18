import { useState, useRef } from 'react'
import axios from 'axios'
import ProgressBar from './ProgressBar'
import { useWebSocket } from '../hooks/useWebSocket'

export default function UploadModal({ onClose, onSuccess }) {
  const [file,     setFile]     = useState(null)
  const [title,    setTitle]    = useState('')
  const [meetingId, setMeetingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error,    setError]    = useState(null)
  const inputRef = useRef()

  const progress = useWebSocket(meetingId)

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    const form = new FormData()
    form.append('file', file)
    form.append('title', title || file.name)

    try {
      const { data } = await axios.post('/api/meetings/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMeetingId(data.id)
    } catch (e) {
      setError(e.response?.data?.error || 'Upload failed')
      setUploading(false)
    }
  }

  // Auto-close when completed
  if (progress?.stage === 'completed') {
    setTimeout(() => { onSuccess(); onClose(); }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:'rgba(0,0,0,0.8)'}}>
      <div className="w-full max-w-md rounded-xl p-6"
           style={{background:'#181817',border:'1px solid #252523'}}>

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-white font-semibold text-lg">Upload meeting</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {!meetingId ? (
          <>
            <div className="mb-4">
              <label className="text-xs uppercase tracking-wider mb-1.5 block"
                     style={{color:'#6b6b66'}}>Meeting title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Q3 Planning Meeting"
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{background:'#111110',border:'1px solid #2e2e2b'}}
              />
            </div>

            <div
              onClick={() => inputRef.current.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
              style={{borderColor: file ? '#8b83e8' : '#2e2e2b'}}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".mp3,.mp4,.wav,.m4a,.webm"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
              />
              {file ? (
                <div>
                  <div className="text-2xl mb-2">🎵</div>
                  <p className="text-white text-sm font-medium">{file.name}</p>
                  <p className="text-xs mt-1" style={{color:'#6b6b66'}}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm" style={{color:'#6b6b66'}}>
                    Click to select audio/video file
                  </p>
                  <p className="text-xs mt-1" style={{color:'#3a3a36'}}>
                    MP3, MP4, WAV, M4A, WEBM — up to 500MB
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-40"
              style={{background:'#8b83e8'}}
            >
              {uploading ? 'Uploading...' : 'Upload & Analyse'}
            </button>
          </>
        ) : (
          <div className="py-4">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">
                {progress?.stage === 'completed' ? '✅' :
                 progress?.stage === 'failed'    ? '❌' : '⚙️'}
              </div>
              <p className="text-white font-medium capitalize">
                {progress?.stage || 'Processing...'}
              </p>
            </div>
            <ProgressBar
              stage={progress?.stage || 'transcribing'}
              progress={progress?.progress || 0}
              message={progress?.message}
            />
            {progress?.stage === 'completed' && (
              <p className="text-center text-sm mt-3" style={{color:'#1faa7e'}}>
                Analysis complete! Redirecting...
              </p>
            )}
            {progress?.error && (
              <p className="text-center text-sm mt-3 text-red-400">
                Error: {progress.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}