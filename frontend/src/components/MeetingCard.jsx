import { useNavigate } from 'react-router-dom'

const statusColor = {
  completed:    { bg: 'rgba(31,170,126,.12)', color: '#1faa7e' },
  transcribing: { bg: 'rgba(139,131,232,.12)', color: '#8b83e8' },
  analyzing:    { bg: 'rgba(240,161,50,.12)',  color: '#f0a132' },
  failed:       { bg: 'rgba(224,82,73,.12)',   color: '#e05249' },
  pending:      { bg: 'rgba(107,107,102,.12)', color: '#6b6b66' },
}

export default function MeetingCard({ meeting }) {
  const navigate = useNavigate()
  const s = statusColor[meeting.status] || statusColor.pending

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day:'numeric', month:'short', year:'numeric'
  })

  const formatDuration = (sec) => {
    if (!sec) return null
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s}s`
  }

  return (
    <div
      onClick={() => meeting.status === 'completed' && navigate(`/meetings/${meeting.id}`)}
      className="rounded-xl p-5 transition-all"
      style={{
        background: '#181817',
        border: '1px solid #252523',
        cursor: meeting.status === 'completed' ? 'pointer' : 'default'
      }}
      onMouseEnter={e => { if (meeting.status === 'completed') e.currentTarget.style.borderColor = '#8b83e8' }}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#252523'}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-white text-sm leading-tight pr-3">
          {meeting.title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
              style={{background:s.bg, color:s.color}}>
          {meeting.status}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs" style={{color:'#6b6b66'}}>
        <span>📅 {formatDate(meeting.created_at)}</span>
        {meeting.duration && <span>⏱ {formatDuration(meeting.duration)}</span>}
      </div>

      {meeting.status === 'completed' && (
        <p className="text-xs mt-3" style={{color:'#8b83e8'}}>
          Click to view analysis →
        </p>
      )}
    </div>
  )
}