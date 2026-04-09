export default function PodGrid({ pods }) {
  return (
    <div style={{ background: '#1e2130', borderRadius: 10, padding: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#f1f5f9' }}>
        Live pods
      </h2>
      {pods.length === 0 && (
        <p style={{ fontSize: 12, color: '#64748b' }}>No pods found.</p>
      )}
      {pods.map(pod => (
        <div key={pod.name} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderBottom: '1px solid #2d3348'
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: pod.status === 'Running' ? '#22c55e' : '#f59e0b'
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pod.name}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {pod.image.split('/').pop()} · restarts: {pod.restarts}
            </div>
          </div>
          <div style={{
            fontSize: 11, padding: '2px 6px', borderRadius: 4,
            background: pod.ready ? '#14532d' : '#451a03',
            color: pod.ready ? '#22c55e' : '#f59e0b'
          }}>
            {pod.ready ? 'Ready' : 'Not ready'}
          </div>
        </div>
      ))}
    </div>
  )
}