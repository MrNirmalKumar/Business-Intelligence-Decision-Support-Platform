import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { formatCurrency } from './utils';

const COLORS = ['#00E5FF', '#7C4DFF', '#FF2D95', '#00FFA3', '#FFD600', '#FF6E40', '#448AFF', '#B2FF59'];

// Reusable geometries and materials to save memory
const boxGeom = new THREE.BoxGeometry(1.4, 1, 1.4); // Replaced RoundedBox with standard box for performance, rounded corners using shader or simple box is fine. We'll use BoxGeometry for the core, and standard Drei RoundedBox for the shell but cached.
// Actually, let's use a standard RoundedBox geometry once if possible, or just standard box for core.
const coreGeom = new THREE.BoxGeometry(0.8, 1, 0.8);

function Tower({ position, height, color, label, revenue, profit, margin, index, onFocus }) {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    // React-spring for smooth entry and hover state
    const { scaleY, yPos, emissiveIntensity } = useSpring({
        scaleY: hovered ? height * 1.06 : height,
        yPos: hovered ? (height * 1.06) / 2 : height / 2,
        emissiveIntensity: hovered ? 2.5 : 1.2,
        from: { scaleY: 0.1, yPos: 0, emissiveIntensity: 0 },
        config: { mass: 1, tension: 120, friction: 22 },
        delay: index * 120
    });

    useFrame((state) => {
        if (!hovered && groupRef.current) {
            // Very slow float idle animation
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.08;
        }
    });

    const matColor = useMemo(() => new THREE.Color(color), [color]);

    return (
        <a.group 
            position-x={position[0]} 
            position-z={position[2]} 
            ref={groupRef}
            onClick={(e) => {
                e.stopPropagation();
                if(groupRef.current) {
                    const worldPos = new THREE.Vector3();
                    groupRef.current.getWorldPosition(worldPos);
                    onFocus(worldPos);
                }
            }}
        >
            {/* Outer Glass Shell */}
            <a.mesh 
                position-y={yPos} 
                scale-y={scaleY}
                geometry={boxGeom}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <meshPhysicalMaterial
                    color={matColor}
                    transmission={0.9}
                    thickness={1.2}
                    roughness={0.08}
                    ior={1.4}
                    iridescence={1}
                    clearcoat={1}
                    envMapIntensity={1.5}
                    transparent
                />
            </a.mesh>

            {/* Inner Emissive Core */}
            <a.mesh position-y={yPos} scale-y={scaleY} geometry={coreGeom}>
                <a.meshBasicMaterial 
                    color={matColor} 
                    toneMapped={false} 
                />
            </a.mesh>

            {/* Glowing Top Cap Ring */}
            <a.mesh position-y={scaleY} rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.5, 0.7, 32]} />
                <a.meshBasicMaterial color={matColor} toneMapped={false} />
            </a.mesh>

            {/* Light Beam Upward */}
            {hovered && (
                <mesh position={[0, height + 5, 0]}>
                    <cylinderGeometry args={[0.6, 0.6, 10, 16]} />
                    <meshBasicMaterial color={matColor} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false}/>
                </mesh>
            )}

            {/* Glowing Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[1.6, 32]} />
                <meshBasicMaterial color={matColor} transparent opacity={0.2} />
            </mesh>

            {/* Persistent Label (only if not too many towers, we limit to top 8 anyway) */}
            <Html
                position={[0, height + 1.2, 0]}
                center
                distanceFactor={15}
                occlude={false}
                style={{ 
                    pointerEvents: 'none',
                    willChange: 'transform',
                    transition: 'opacity 0.2s',
                    opacity: hovered ? 0 : 1 // Hide when hovered to show tooltip
                }}
            >
                <div style={{
                    background: 'rgba(5,6,13,0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid ' + color + '44',
                    borderRadius: 8,
                    padding: '8px 16px',
                    textAlign: 'center',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    <div style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginTop: 4 }}>{formatCurrency(revenue)}</div>
                </div>
            </Html>

            {/* Hover Tooltip Card */}
            {hovered && (
                <Html 
                    position={[0, height + 2.5, 0]} 
                    center 
                    distanceFactor={12} 
                    occlude={false}
                    style={{ pointerEvents: 'none', willChange: 'transform', zIndex: 10 }}
                >
                    <div style={{
                        background: 'rgba(10,15,46,0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid ' + color,
                        borderRadius: 12,
                        padding: '16px 24px',
                        fontFamily: 'JetBrains Mono, monospace',
                        minWidth: 220,
                        boxShadow: '0 0 40px ' + color + '44'
                    }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, marginBottom: 8 }}>{label}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Revenue</span>
                            <span style={{ color: '#00E5FF', fontSize: 13, fontWeight: 600 }}>{formatCurrency(revenue)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Profit</span>
                            <span style={{ color: profit >= 0 ? '#00FFA3' : '#FF2D95', fontSize: 13, fontWeight: 600 }}>{formatCurrency(profit)}</span>
                        </div>
                        {margin !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Margin</span>
                                <span style={{ color: '#FFD600', fontSize: 13, fontWeight: 600 }}>{(margin || 0).toFixed(1)}%</span>
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </a.group>
    );
}

export default function CategoryTowers({ data, position = [0, 0, 0], onFocus }) {
    if (!data || data.length === 0) return null;
    
    // Select top 3 or 4 for cinematic framing to fill viewport height better
    const displayData = data.slice(0, 3);
    const maxSales = Math.max(...displayData.map(d => d.sales || 1));
    const spacing = 3;
    const offsetX = -((displayData.length - 1) * spacing) / 2;

    return (
        <group position={position}>
            {displayData.map((cat, i) => {
                // Scale height to fill viewport better (up to 12 units high)
                const h = Math.max(((cat.sales || 0) / maxSales) * 12, 1);
                return (
                    <Tower
                        key={i}
                        position={[offsetX + i * spacing, 0, 0]}
                        height={h}
                        color={COLORS[i % COLORS.length]}
                        label={cat.category || cat.name || 'Unknown'}
                        revenue={cat.sales || 0}
                        profit={cat.profit || 0}
                        margin={cat.margin}
                        index={i}
                        onFocus={onFocus}
                    />
                );
            })}
        </group>
    );
}
