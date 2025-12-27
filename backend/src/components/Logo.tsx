import React from 'react'

export const Logo = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
                style={{
                    display: 'flex',
                    height: '56px',
                    width: '56px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #f5c542, rgba(245, 197, 66, 0.7))',
                    boxShadow: '0 10px 15px -3px rgba(245, 197, 66, 0.25)',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b4423"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                    <path d="M22 10v6" />
                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                </svg>
            </div>
            <span
                style={{
                    fontSize: '3rem', // Increased to match logo height (approx 48px)
                    fontWeight: '700',
                    color: '#000000', // Pure black for maximum contrast in light mode
                }}
                className="logo-text"
            >
                Pathway
            </span>
            <style>{`
        [data-theme="dark"] .logo-text { color: white !important; }
      `}</style>
        </div>
    )
}
