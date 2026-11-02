import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { formatCurrency } from './utils';

function HoloPanel({ position, label, value, subtext, color, delay = 0 }) {
    const groupRef = useRef();
    const [displayVal, setDisplayVal] = useState('--');

    useEffect(() => {
        let mounted = true;
        const target = typeof value === 'number' ? value : 0;
        if (typeof value !== 'number') { 
            setDisplayVal(value); 
            return; 
        }
        
        let start = 0;
        const duration = 2000;
        const startTime = Date.now() + delay;
        
        const animate = () => {
            if (!mounted) return;
            const now = Date.now();
            if (now < startTime) {
                requestAnimationFrame(animate);
                return;
            }
            
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            start = target * eased;
            
            if (target >= 1000) setDisplayVal(formatCurrency(start));
            else if (Number.isInteger(target)) setDisplayVal(Math.round(start).toLocaleString());
            else setDisplayVal(start.toFixed(1));
            
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => { mounted = false; };
    }, [value, delay]);

    useFrame((state) => {
        if (groupRef.current) {
            // Idle float and parallax
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay * 0.01) * 0.2;
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + delay * 0.01) * 0.1;
            groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <Html center distanceFactor={18} occlude={false} style={{ pointerEvents: 'none', willChange: 'transform' }}>
                <div style={{
                    width: 220,
                    background: 'rgba(5,6,13,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid ' + color + '44',
                    borderTop: '2px solid ' + color,
                    borderRadius: '4px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px ' + color + '11',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>{label}</div>
                    <div style={{ color: color, fontSize: 32, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px ' + color + '66' }}>{displayVal}</div>
                    {subtext && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 8, letterSpacing: 1 }}>{subtext}</div>}
                </div>
            </Html>
        </group>
    );
}

export default function KpiHolograms({ summary, categoryCount, position = [120, 4, 0] }) {
    if (!summary) return null;
    
    const margin = summary.profit_margin !== undefined ? summary.profit_margin : 0;
    const marginDisplay = margin.toFixed(1) + '%';
    const marginSubtext = margin >= 10 ? 'HEALTHY MARGIN' : 'LOW MARGIN';

    const healthSubtext = summary.health_category ? summary.health_category.toUpperCase() : '/ 100';

    const panels = [
        { label: 'Total Revenue', value: summary.total_sales || 0, color: '#00E5FF' },
        { label: 'Net Profit', value: summary.total_profit || 0, color: (summary.total_profit || 0) >= 0 ? '#00FFA3' : '#FF2D95' },
        { label: 'Total Orders', value: summary.total_orders || 0, color: '#FFD600' },
        { label: 'Profit Margin', value: margin, displayStr: marginDisplay, color: '#FF6E40', subtext: marginSubtext },
        { label: 'Health Score', value: summary.health_score || 0, color: '#7C4DFF', subtext: healthSubtext },
        { label: 'Total Customers', value: summary.total_customers || categoryCount || 0, color: '#448AFF' },
    ];
    
    const spacingX = 6;
    const spacingY = 4;
    const cols = 3;
    
    return (
        <group position={position}>
            {panels.map((p, i) => {
                const x = (i % cols - 1) * spacingX;
                const y = Math.floor(i / cols) * -spacingY + 2;
                return (
                    <HoloPanel
                        key={i}
                        position={[x, y, 0]}
                        label={p.label}
                        value={p.displayStr || p.value}
                        subtext={p.subtext}
                        color={p.color}
                        delay={i * 150}
                    />
                );
            })}
        </group>
    );
}
