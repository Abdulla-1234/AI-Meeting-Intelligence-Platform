import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', id],
    queryFn:  () => axios.get(`/api/meetings/${id}`).then(r => r.data),
  })

  if (isLoading) return (
    <div className="text-center py-20" style={{color:'#6b6b66'}}>Loading...</div>
  )
  if (!meeting) return (
    <div className="text-center py-20" style={{color:'#6b6b66'}}>Meeting not found</div>
  )

  const analysis   = meeting.analysis   || {}
  const transcript = meeting.transcript || {}
  const actions    = meeting.actionItems || []
  const sentiment  = analysis.sentiment  ? JSON.parse(typeof analysis.sentiment === 'string' ? analysis.sentiment : JSON.stringify(analysis.sentiment)) : null
  const decisions  = analysis.decisions  ? JSON.parse(typeof analysis.decisions  === 'string' ? analysis.decisions  : JSON.stringify(analysis.decisions))  : null

  const toneColor = {
    positive:'#1faa7e', neutral:'#6b6b66', negative:'#e05249', mixed:'#f0a132'
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Back + Title */}
      <button onClick={() => navigate('/')}
              className="text-sm mb-6 flex items-center gap-2 hover:text-white transition-colors"
              style={{color:'#6b6b66'}}>
        ← Back to meetings
      </button>

      <h1 className="text-2xl font-semibold text-white mb-1">{meeting.title}</h1>
      <p className="text-sm mb-8" style={{color:'#6b6b66'}}>
        {new Date(meeting.created_at).toLocaleDateString('en-IN', {
          weekday:'long', year:'numeric', month:'long', day:'numeric'
        })}
        {meeting.duration && ` · ${Math.floor(meeting.duration/60)}m ${meeting.duration%60}s`}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Summary + Action Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Summary */}
          {analysis.summary && (
            <div className="rounded-xl p-5"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <h2 className="text-xs uppercase tracking-wider mb-3" style={{color:'#6b6b66'}}>
                AI Summary
              </h2>
              <p className="text-sm text-white leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Action Items */}
          <div className="rounded-xl p-5"
               style={{background:'#181817',border:'1px solid #252523'}}>
            <h2 className="text-xs uppercase tracking-wider mb-3" style={{color:'#6b6b66'}}>
              Action items ({actions.length})
            </h2>
            {actions.length === 0 ? (
              <p className="text-sm" style={{color:'#3a3a36'}}>No action items found</p>
            ) : (
              <div className="flex flex-col gap-3">
                {actions.map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-2"
                       style={{borderBottom:'1px solid #1a1a18'}}>
                    <div className="w-4 h-4 rounded border mt-0.5 flex-none"
                         style={{borderColor:'#8b83e8'}} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{a.task}</p>
                      <div className="flex gap-3 mt-1">
                        {a.owner && (
                          <span className="text-xs px-2 py-0.5 rounded"
                                style={{background:'rgba(139,131,232,.12)',color:'#8b83e8'}}>
                            👤 {a.owner}
                          </span>
                        )}
                        {a.deadline && (
                          <span className="text-xs px-2 py-0.5 rounded"
                                style={{background:'rgba(240,161,50,.12)',color:'#f0a132'}}>
                            📅 {a.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transcript */}
          {transcript.content && (
            <div className="rounded-xl p-5"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <h2 className="text-xs uppercase tracking-wider mb-3" style={{color:'#6b6b66'}}>
                Transcript
              </h2>
              <div className="max-h-64 overflow-y-auto text-sm leading-relaxed"
                   style={{color:'#9a9a94'}}>
                {transcript.content}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sentiment + Decisions */}
        <div className="flex flex-col gap-6">

          {/* Sentiment */}
          {sentiment && (
            <div className="rounded-xl p-5"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <h2 className="text-xs uppercase tracking-wider mb-4" style={{color:'#6b6b66'}}>
                Meeting sentiment
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs mb-1" style={{color:'#6b6b66'}}>Overall tone</p>
                  <span className="text-sm font-medium capitalize"
                        style={{color: toneColor[sentiment.overall_tone] || '#6b6b66'}}>
                    {sentiment.overall_tone}
                  </span>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{color:'#6b6b66'}}>Collaboration score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded" style={{background:'#252523'}}>
                      <div className="h-1.5 rounded" style={{
                        width:`${(sentiment.collaboration_score/10)*100}%`,
                        background:'#1faa7e'
                      }}/>
                    </div>
                    <span className="text-xs text-white">{sentiment.collaboration_score}/10</span>
                  </div>
                </div>
                {sentiment.highlights?.length > 0 && (
                  <div>
                    <p className="text-xs mb-2" style={{color:'#6b6b66'}}>Highlights</p>
                    {sentiment.highlights.slice(0,2).map((h,i) => (
                      <p key={i} className="text-xs mb-1" style={{color:'#9a9a94'}}>• {h}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decisions */}
          {decisions?.decisions?.length > 0 && (
            <div className="rounded-xl p-5"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <h2 className="text-xs uppercase tracking-wider mb-3" style={{color:'#6b6b66'}}>
                Decisions made
              </h2>
              <div className="flex flex-col gap-3">
                {decisions.decisions.map((d,i) => (
                  <div key={i} className="text-sm">
                    <p className="text-white">✓ {d.decision}</p>
                    {d.context && <p className="text-xs mt-1" style={{color:'#6b6b66'}}>{d.context}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Questions */}
          {decisions?.open_questions?.length > 0 && (
            <div className="rounded-xl p-5"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <h2 className="text-xs uppercase tracking-wider mb-3" style={{color:'#6b6b66'}}>
                Open questions
              </h2>
              <div className="flex flex-col gap-2">
                {decisions.open_questions.map((q,i) => (
                  <p key={i} className="text-sm" style={{color:'#f0a132'}}>
                    ? {q.question}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}