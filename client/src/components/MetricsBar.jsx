export default function MetricsBar({ stats, podCount }) {
  const metrics = [
    { label: 'Total runs',     value: stats.total },
    { label: 'Success',        value: stats.success,      color: '#22c55e' },
    { label: 'Failed',         value: stats.failure,      color: '#ef4444' },
    { label: 'Failure rate',   value: stats.failureRate + '%', color: stats.failureRate > 20 ? '#ef4444' : '#22c55e' },
    { label: 'Avg duration',   value: stats.avgDuration + 's' },
    { label: 'Running pods',   value: podCount,           color: '#3b82f6' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
      {metrics.map(m => (
        <div key={m.label} style={{ background: '#1e2130', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{m.label}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: m.color || '#f1f5f9' }}>{m.value}</div>
        </div>
      ))}
    </div>
  )
}