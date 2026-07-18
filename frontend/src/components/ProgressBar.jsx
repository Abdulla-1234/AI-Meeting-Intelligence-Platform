export default function ProgressBar({ stage, progress, message }) {
  const stageColors = {
    transcribing: '#8b83e8',
    analyzing:    '#1faa7e',
    completed:    '#1faa7e',
    failed:       '#e05249',
  }

  const color = stageColors[stage] || '#8b83e8'

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1" style={{color:'#6b6b66'}}>
        <span>{message || stage}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{background:'#252523'}}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{width:`${progress}%`, background:color}}
        />
      </div>
    </div>
  )
}