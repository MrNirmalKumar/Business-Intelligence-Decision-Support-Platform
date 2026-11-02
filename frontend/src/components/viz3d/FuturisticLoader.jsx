import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

export default function FuturisticLoader({ isGlobal = false }) {
    const { progress } = useProgress();
    const [opacity, setOpacity] = useState(1);
    
    useEffect(() => {
        if (!isGlobal && progress === 100) {
            const t = setTimeout(() => setOpacity(0), 600);
            return () => clearTimeout(t);
        }
    }, [progress, isGlobal]);

    if (opacity === 0) return null;

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #02030a, #0a0f2e)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Orbitron, sans-serif', zIndex: 1000,
            opacity, transition: 'opacity 0.6s ease-out', pointerEvents: 'none'
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid rgba(0,229,255,0.1)',
                borderTopColor: '#00E5FF',
                animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
                marginBottom: 32
            }} />
            <div style={{ color: '#00E5FF', fontSize: 16, letterSpacing: 6, fontWeight: 700 }}>INITIALIZING</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 4, marginTop: 12 }}>
                DATA UNIVERSE {isGlobal ? '...' : Math.round(progress) + '%'}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
