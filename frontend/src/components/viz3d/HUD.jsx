import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Play, Rotate3D } from 'lucide-react';

export default function HUD({
    datasets,
    selectedId,
    onSelectDataset,
    mode,
    onModeChange,
    activeZone = 0,
    onJumpToZone
}) {
    const navigate = useNavigate();

    const ZONES = [
        { id: 0, label: '01 CATEGORIES', desc: 'Category Towers' },
        { id: 1, label: '02 REGIONS', desc: 'Global Hemisphere' },
        { id: 2, label: '03 TRENDS', desc: 'Financial Ribbons' },
        { id: 3, label: '04 METRICS', desc: 'Executive Holograms' }
    ];

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, fontFamily: 'JetBrains Mono, monospace' }}>
            {/* Top bar */}
            <div style={{
                position: 'absolute', top: 20, left: 24, right: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12
            }}>
                {/* Brand & Back */}
                <div style={{ pointerEvents: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        title="Back to Dashboard"
                        style={{
                            background: 'rgba(5,6,13,0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(0,229,255,0.25)',
                            borderRadius: '12px',
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.2)'; e.currentTarget.style.borderColor = '#00E5FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(5,6,13,0.7)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.25)'; }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{
                        background: 'rgba(5,6,13,0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0,229,255,0.25)',
                        borderRadius: 12,
                        padding: '10px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#00FFA3',
                            boxShadow: '0 0 10px #00FFA3',
                            animation: 'pulse 2s infinite'
                        }} />
                        <div>
                            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 2 }}>BIDSP</div>
                            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 2.5, marginTop: 1 }}>3D DATA UNIVERSE</div>
                        </div>
                    </div>
                </div>

                {/* Center: Zone Selector Navigation Pills */}
                <div style={{
                    pointerEvents: 'auto',
                    display: 'flex', gap: 6,
                    background: 'rgba(5,6,13,0.75)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: '4px 6px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                }}>
                    {ZONES.map((zone) => {
                        const isActive = activeZone === zone.id;
                        return (
                            <button
                                key={zone.id}
                                onClick={() => onJumpToZone && onJumpToZone(zone.id)}
                                title={zone.desc}
                                style={{
                                    background: isActive ? 'rgba(0,229,255,0.18)' : 'transparent',
                                    border: isActive ? '1px solid #00E5FF' : '1px solid transparent',
                                    borderRadius: 10,
                                    padding: '7px 14px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.25s ease',
                                    boxShadow: isActive ? '0 0 16px rgba(0,229,255,0.3)' : 'none'
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    color: isActive ? '#00E5FF' : 'rgba(255,255,255,0.5)'
                                }}>
                                    {zone.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Controls & Modes */}
                <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto', alignItems: 'center' }}>
                    {/* Dataset selector */}
                    {datasets && datasets.length > 0 && (
                        <select
                            value={selectedId || ''}
                            onChange={e => onSelectDataset(e.target.value)}
                            style={{
                                background: 'rgba(5,6,13,0.7)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(0,229,255,0.25)',
                                borderRadius: 12,
                                padding: '0 14px',
                                fontSize: 11,
                                color: '#fff',
                                fontFamily: 'JetBrains Mono, monospace',
                                outline: 'none',
                                cursor: 'pointer',
                                height: 44,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                        >
                            {datasets.map(d => (
                                <option key={d._id} value={d._id} style={{ background: '#05060d' }}>{d.file_name}</option>
                            ))}
                        </select>
                    )}

                    {/* Mode buttons */}
                    <div style={{
                        background: 'rgba(5,6,13,0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(124,77,255,0.25)',
                        borderRadius: 12,
                        padding: 4,
                        display: 'flex', gap: 4,
                        height: 44,
                        boxSizing: 'border-box'
                    }}>
                        <ModeButton active={mode === 'tour'} onClick={() => onModeChange('tour')} icon={<Play size={13}/>} label="TOUR" color="#00E5FF" />
                        <ModeButton active={mode === 'orbit'} onClick={() => onModeChange('orbit')} icon={<Rotate3D size={13}/>} label="ORBIT" color="#7C4DFF" />
                        <ModeButton active={mode === 'focus'} onClick={() => onModeChange('tour')} icon={<Target size={13}/>} label="RESET" color="#FF2D95" />
                    </div>
                </div>
            </div>

            {/* Bottom status bar */}
            <div style={{
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(5,6,13,0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '8px 24px',
                display: 'flex', gap: 16, alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                pointerEvents: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FFA3', boxShadow: '0 0 10px #00FFA3' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, fontWeight: 700 }}>SYSTEM READY</span>
                </div>
                <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: 10, color: '#00E5FF', letterSpacing: 1, fontWeight: 600 }}>
                    {mode === 'tour'
                        ? 'SCROLL WHEEL TO TRAVEL • CLICK ANY TOWER TO FOCUS'
                        : mode === 'orbit'
                        ? 'CLICK & DRAG TO FREE ORBIT • SCROLL TO ZOOM'
                        : 'FOCUS MODE ACTIVE • CLICK RESET TO RESUME TOUR'}
                </span>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }
            `}</style>
        </div>
    );
}

function ModeButton({ active, onClick, icon, label, color }) {
    return (
        <button onClick={onClick} style={{
            background: active ? color + '33' : 'transparent',
            border: active ? '1px solid ' + color + '88' : '1px solid transparent',
            borderRadius: 8,
            padding: '0 12px',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10,
            color: active ? '#fff' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            letterSpacing: 1,
            transition: 'all 0.3s ease',
            height: '100%'
        }}
        onMouseEnter={e => !active && (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => !active && (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
            {icon}
            {label}
        </button>
    );
}
