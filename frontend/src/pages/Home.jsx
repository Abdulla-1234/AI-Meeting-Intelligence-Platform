import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import MeetingCard from '../components/MeetingCard'
import UploadModal from '../components/UploadModal'

export default function Home() {
  const [showUpload, setShowUpload] = useState(false)
  const queryClient = useQueryClient()

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn:  () => axios.get('/api/meetings').then(r => r.data),
    refetchInterval: 5000,
  })

  const stats = {
    total:     meetings.length,
    completed: meetings.filter(m => m.status === 'completed').length,
    pending:   meetings.filter(m => ['transcribing','analyzing','pending'].includes(m.status)).length,
  }

  return (
    <div className="min-h-screen" style={{background:'#0a0a09'}}>

      {/* Hero banner */}
      <div style={{background:'linear-gradient(135deg,#12111f 0%,#0d1a14 50%,#1a1007 100%)',borderBottom:'1px solid #252523'}}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
                   style={{background:'rgba(139,131,232,.12)',color:'#8b83e8',border:'1px solid rgba(139,131,232,.25)'}}>
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block"></span>
                AI-powered · Whisper + Llama 3.3
              </div>
              <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                Turn meetings into<br/>
                <span style={{color:'#8b83e8'}}>actionable intelligence</span>
              </h1>
              <p className="text-sm leading-relaxed max-w-md" style={{color:'#6b6b66'}}>
                Upload any meeting recording. AI transcribes it, extracts action items with owners and deadlines, identifies decisions made, and scores the meeting sentiment — in under 60 seconds.
              </p>

              {/* How it works */}
              <div className="flex items-center gap-0 mt-6 flex-wrap">
                {[
                  {icon:'🎙️', label:'Upload audio'},
                  {icon:'📝', label:'AI transcribes'},
                  {icon:'🤖', label:'4 agents analyse'},
                  {icon:'✅', label:'Get insights'},
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                         style={{background:'rgba(255,255,255,.04)',border:'1px solid #252523',color:'#9a9a94'}}>
                      <span>{step.icon}</span>
                      <span>{step.label}</span>
                    </div>
                    {i < 3 && <span className="text-xs mx-1" style={{color:'#3a3a36'}}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-col gap-3 min-w-56">
              {[
                {icon:'⚡', title:'Under 60 seconds', desc:'Full analysis of any meeting length'},
                {icon:'🎯', title:'Action item extraction', desc:'Owner + deadline auto-detected'},
                {icon:'🧠', title:'4 parallel AI agents', desc:'Summary · Tasks · Decisions · Sentiment'},
                {icon:'🔍', title:'Full-text search', desc:'Search across all your meetings'},
              ].map((f,i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                     style={{background:'rgba(255,255,255,.03)',border:'1px solid #252523'}}>
                  <span className="text-base mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-white">{f.title}</p>
                    <p className="text-xs mt-0.5" style={{color:'#6b6b66'}}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {label:'Total meetings',    value: stats.total,     color:'#8b83e8', icon:'📁'},
            {label:'Completed',         value: stats.completed, color:'#1faa7e', icon:'✅'},
            {label:'Processing',        value: stats.pending,   color:'#f0a132', icon:'⚙️'},
            {label:'Action items',      value: '—',             color:'#4a8fe0', icon:'📋'},
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{s.icon}</span>
                <p className="text-xs" style={{color:'#6b6b66'}}>{s.label}</p>
              </div>
              <p className="text-2xl font-bold" style={{color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Meetings header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Your meetings</h2>
            <p className="text-xs mt-0.5" style={{color:'#6b6b66'}}>
              Click any completed meeting to view its full AI analysis
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{background:'#8b83e8'}}
          >
            <span>+</span> Upload meeting
          </button>
        </div>

        {/* Meetings grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-xl p-5 animate-pulse"
                   style={{background:'#181817',border:'1px solid #252523',height:'100px'}}/>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 rounded-xl"
               style={{background:'#181817',border:'1px dashed #252523'}}>
            <div className="text-5xl mb-4">🎙️</div>
            <p className="text-white font-medium mb-2">No meetings yet</p>
            <p className="text-sm mb-2" style={{color:'#6b6b66'}}>
              Upload your first meeting recording to get started
            </p>
            <p className="text-xs mb-6" style={{color:'#3a3a36'}}>
              Supports MP3, MP4, WAV, M4A, WEBM — up to 500MB
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{background:'#8b83e8'}}
            >
              Upload meeting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        )}

        {/* Quick start guide — shown only when there are meetings */}
        {meetings.length > 0 && (
          <div className="mt-8 rounded-xl p-5"
               style={{background:'#181817',border:'1px solid #252523'}}>
            <p className="text-xs font-medium mb-4" style={{color:'#6b6b66',textTransform:'uppercase',letterSpacing:'.06em'}}>
              Quick guide
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {step:'01', title:'Upload a recording', desc:'Click "+ Upload meeting", select your audio file, give it a title, and hit Upload & Analyse.'},
                {step:'02', title:'Wait ~60 seconds', desc:'The AI transcribes your audio, then 4 agents run in parallel to extract tasks, decisions, and sentiment.'},
                {step:'03', title:'Review your insights', desc:'Click any completed meeting to see the full analysis — summary, action items with owners, decisions, and transcript.'},
              ].map(g => (
                <div key={g.step} className="flex gap-3">
                  <span className="text-2xl font-bold flex-none" style={{color:'#252523',fontFamily:'monospace'}}>{g.step}</span>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">{g.title}</p>
                    <p className="text-xs leading-relaxed" style={{color:'#6b6b66'}}>{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => queryClient.invalidateQueries(['meetings'])}
        />
      )}
    </div>
  )
}