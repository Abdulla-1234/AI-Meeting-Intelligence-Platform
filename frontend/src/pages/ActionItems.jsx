import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export default function ActionItems() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['action-items'],
    queryFn:  () => axios.get('/api/action-items').then(r => r.data),
  })

  const toggle = useMutation({
    mutationFn: ({ id, status }) =>
      axios.patch(`/api/action-items/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['action-items'])
  })

  const open   = items.filter(i => i.status === 'open')
  const done   = items.filter(i => i.status === 'done')

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Action Items</h1>
        <p className="text-sm" style={{color:'#6b6b66'}}>
          All tasks extracted from your meetings — {open.length} open, {done.length} completed
        </p>
      </div>

      {isLoading ? (
        <p className="text-center py-12" style={{color:'#6b6b66'}}>Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-white font-medium mb-2">No action items yet</p>
          <p className="text-sm" style={{color:'#6b6b66'}}>
            Upload a meeting to extract action items automatically
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id}
                 className="flex items-start gap-4 p-4 rounded-xl"
                 style={{background:'#181817',border:'1px solid #252523'}}>
              <button
                onClick={() => toggle.mutate({ id: item.id, status: item.status === 'open' ? 'done' : 'open' })}
                className="w-5 h-5 rounded border flex items-center justify-center mt-0.5 flex-none transition-colors"
                style={{
                  borderColor: item.status === 'done' ? '#1faa7e' : '#2e2e2b',
                  background:  item.status === 'done' ? '#1faa7e' : 'transparent'
                }}
              >
                {item.status === 'done' && <span className="text-white text-xs">✓</span>}
              </button>

              <div className="flex-1">
                <p className={`text-sm ${item.status === 'done' ? 'line-through' : 'text-white'}`}
                   style={item.status === 'done' ? {color:'#3a3a36'} : {}}>
                  {item.task}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded"
                        style={{background:'rgba(139,131,232,.1)',color:'#8b83e8'}}>
                    📁 {item.meeting_title}
                  </span>
                  {item.owner && (
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{background:'rgba(74,143,224,.1)',color:'#4a8fe0'}}>
                      👤 {item.owner}
                    </span>
                  )}
                  {item.deadline && (
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{background:'rgba(240,161,50,.1)',color:'#f0a132'}}>
                      📅 {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}