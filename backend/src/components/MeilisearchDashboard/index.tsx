'use client'
import React, { useEffect, useState } from 'react'
import { Gutter } from '@payloadcms/ui'

export const MeilisearchDashboard: React.FC = () => {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [reindexing, setReindexing] = useState(false)
    const [message, setMessage] = useState('')

    const fetchStatus = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/meilisearch/status')
            const data = await res.json()
            setStatus(data)
        } catch (err) {
            console.error('Failed to fetch status', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleReindex = async () => {
        if (!confirm('Are you sure you want to reindex all collections? This will clear existing Meilisearch data and refill it.')) return

        try {
            setReindexing(true)
            setMessage('Starting reindex...')
            const res = await fetch('/api/admin/meilisearch/reindex', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setMessage('Reindex completed successfully!')
                fetchStatus()
            } else {
                setMessage('Error: ' + data.error)
            }
        } catch (err: any) {
            setMessage('Failed to reindex: ' + err.message)
        } finally {
            setReindexing(false)
        }
    }

    const handleClear = async () => {
        if (!confirm('Are you sure you want to clear all Meilisearch indexes?')) return

        try {
            setMessage('Clearing indexes...')
            const res = await fetch('/api/admin/meilisearch/clear', { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setMessage('Indexes cleared successfully!')
                fetchStatus()
            } else {
                setMessage('Error: ' + data.error)
            }
        } catch (err: any) {
            setMessage('Failed to clear: ' + err.message)
        }
    }

    return (
        <Gutter className="meilisearch-dashboard">
            <div style={{ padding: '20px 0' }}>
                <h1 style={{ marginBottom: '20px' }}>Meilisearch Management</h1>

                {loading ? (
                    <p>Loading Meilisearch status...</p>
                ) : status ? (
                    <div style={{ background: 'var(--theme-bg-soft)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: status.connected ? '#2ecc71' : '#e74c3c',
                                marginRight: '10px'
                            }} />
                            <strong>Status: {status.connected ? 'Connected' : 'Disconnected'}</strong>
                        </div>

                        {status.connected && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                {Object.entries(status.indexes || {}).map(([name, stats]: [string, any]) => (
                                    <div key={name} style={{ padding: '15px', border: '1px solid var(--theme-border)', borderRadius: '6px' }}>
                                        <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>{name}</h3>
                                        <p>Documents: {stats.numberOfDocuments ?? 'N/A'}</p>
                                        <p>Is Indexing: {stats.isIndexing ? 'Yes' : 'No'}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!status.connected && status.error && (
                            <p style={{ color: '#e74c3c' }}>Error: {status.error}</p>
                        )}
                    </div>
                ) : (
                    <p>Unable to retrieve Meilisearch status.</p>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={handleReindex}
                        disabled={reindexing || !status?.connected}
                        className="btn btn--style-primary"
                        style={{
                            padding: '10px 20px',
                            cursor: (reindexing || !status?.connected) ? 'not-allowed' : 'pointer',
                            opacity: (reindexing || !status?.connected) ? 0.6 : 1
                        }}
                    >
                        {reindexing ? 'Reindexing...' : 'Full Reindex All'}
                    </button>

                    <button
                        onClick={handleClear}
                        disabled={reindexing || !status?.connected}
                        className="btn btn--style-secondary"
                        style={{
                            padding: '10px 20px',
                            cursor: (reindexing || !status?.connected) ? 'not-allowed' : 'pointer',
                            opacity: (reindexing || !status?.connected) ? 0.6 : 1
                        }}
                    >
                        Clear All Indexes
                    </button>

                    <button
                        onClick={fetchStatus}
                        className="btn btn--style-secondary"
                        style={{ padding: '10px 20px', cursor: 'pointer' }}
                    >
                        Refresh Status
                    </button>
                </div>

                {message && (
                    <div style={{
                        marginTop: '20px',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: message.startsWith('Error') ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                        color: message.startsWith('Error') ? '#e74c3c' : '#2ecc71',
                        border: `1px solid ${message.startsWith('Error') ? '#e74c3c' : '#2ecc71'}`
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ marginTop: '40px', fontSize: '0.9rem', color: 'var(--theme-text-soft)' }}>
                    <p>Meilisearch Host: <code>{status?.connected ? 'Configured' : 'Missing'}</code></p>
                    <p>Indexes Managed: <code>posts</code>, <code>courses</code>, <code>coaches</code></p>
                </div>
            </div>
        </Gutter>
    )
}
