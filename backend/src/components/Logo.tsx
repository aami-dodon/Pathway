import React from 'react'

export const Logo = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
                src="/logo-full-light.svg"
                alt="Pathway"
                style={{
                    height: '56px',
                    width: 'auto',
                    objectFit: 'contain',
                }}
            />
        </div>
    )
}
