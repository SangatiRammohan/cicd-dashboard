const STATUS_COLOR = {
  success: '#22c55e',
  failure: '#ef4444',
  running: '#f59e0b',
  pending: '#64748b'
}

export default function PipelineList({ pipelines }) {
  return (
    <div style={{ background: '#1e2130', borderRadius: 10, padding: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#f1f5f9' }}>
        Pipeline runs
      </h2>
      {pipelines.length === 0 && (
        <p style={{ fontSize: 12, color: '#64748b' }}>No pipeline runs yet. Push code to trigger CI.</p>
      )}
      {pipelines.map(p => (
        <div key={p.runId} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderBottom: '1px solid #2d3348'
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: STATUS_COLOR[p.status] || '#64748b'
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.commitMsg || 'No message'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {p.branch} · {p.commitSha} · {p.author}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
            {p.duration ? p.duration + 's' : '—'}
          </div>
        </div>
      ))}
    </div>
  )
}