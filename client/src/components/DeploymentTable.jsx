export default function DeploymentTable({ deployments }) {
  return (
    <div style={{ background: '#1e2130', borderRadius: 10, padding: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#f1f5f9' }}>
        Deployment history
      </h2>
      {deployments.length === 0 && (
        <p style={{ fontSize: 12, color: '#64748b' }}>No deployments recorded yet.</p>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ color: '#64748b', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>App</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>Namespace</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>Image tag</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>Status</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>Deployed at</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((d, i) => (
            <tr key={i} style={{ borderTop: '1px solid #2d3348', color: '#e2e8f0' }}>
              <td style={{ padding: '8px' }}>{d.app}</td>
              <td style={{ padding: '8px', color: '#64748b' }}>{d.namespace}</td>
              <td style={{ padding: '8px', fontFamily: 'monospace', color: '#93c5fd' }}>{d.imageTag}</td>
              <td style={{ padding: '8px' }}>
                <span style={{
                  padding: '2px 6px', borderRadius: 4, fontSize: 11,
                  background: d.status === 'healthy' ? '#14532d' : '#1e3a5f',
                  color: d.status === 'healthy' ? '#22c55e' : '#93c5fd'
                }}>
                  {d.status}
                </span>
              </td>
              <td style={{ padding: '8px', color: '#64748b' }}>
                {new Date(d.deployedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}