import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import MetricsBar from './components/MetricsBar'
import PipelineList from './components/PipelineList'
import PodGrid from './components/PodGrid'
import DeploymentTable from './components/DeploymentTable'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
const socket = io(BACKEND_URL)

export default function App() {
  const [pipelines, setPipelines] = useState([])
  const [stats, setStats] = useState({ total: 0, success: 0, failure: 0, failureRate: 0, avgDuration: 0 })
  const [pods, setPods] = useState([])
  const [deployments, setDeployments] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('pipeline:update', (run) => {
      setPipelines(prev => {
        const exists = prev.find(p => p.runId === run.runId)
        if (exists) return prev.map(p => p.runId === run.runId ? run : p)
        return [run, ...prev].slice(0, 20)
      })
    })
    socket.on('deployment:update', (dep) => {
      setDeployments(prev => [dep, ...prev].slice(0, 20))
    })
    return () => socket.off()
  }, [])

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/pipelines`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setPipelines(data) : setPipelines([]))
      .catch(() => setPipelines([]))

    fetch(`${BACKEND_URL}/api/pipelines/stats`)
      .then(r => r.json())
      .then(data => data && typeof data === 'object' ? setStats(data) : null)
      .catch(() => {})

    fetch(`${BACKEND_URL}/api/deployments`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setDeployments(data) : setDeployments([]))
      .catch(() => setDeployments([]))

    fetch(`${BACKEND_URL}/api/kubernetes/pods`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setPods(data) : setPods([]))
      .catch(() => setPods([]))

    const interval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/kubernetes/pods`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setPods(data) : setPods([]))
        .catch(() => setPods([]))

      fetch(`${BACKEND_URL}/api/pipelines/stats`)
        .then(r => r.json())
        .then(data => data && typeof data === 'object' ? setStats(data) : null)
        .catch(() => {})
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9' }}>CI/CD Platform</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Live deployment dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }}></div>
          <span style={{ fontSize: 12, color: '#64748b' }}>{connected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      <MetricsBar stats={stats} podCount={pods.length} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <PipelineList pipelines={pipelines} />
        <PodGrid pods={pods} />
      </div>

      <div style={{ marginTop: 16 }}>
        <DeploymentTable deployments={deployments} />
      </div>
    </div>
  )
}