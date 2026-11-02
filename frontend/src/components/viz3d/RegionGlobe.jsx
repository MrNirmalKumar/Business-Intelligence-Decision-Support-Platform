import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { formatCurrency } from './utils';

export default function RegionGlobe({ data, position = [40, 6, 0] }) {
    const groupRef = useRef();
    const wireRef = useRef();
    const radius = 8; // Scaled up to occupy ~60% of viewport

    useFrame((_, delta) => {
        if (wireRef.current) wireRef.current.rotation.y += delta * 0.05;
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
    });

    const nodes = useMemo(() => {
        if (!data || data.length === 0) return [];
        const maxSales = Math.max(...data.map(d => d.sales || 1));
        return data.map((r, i) => {
            const phi = Math.acos(-1 + (2 * i + 1) / data.length);
            const theta = Math.sqrt(data.length * Math.PI) * phi;
            return {
                pos: [
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.sin(theta - Math.PI/4) * Math.sin(phi),
                    radius * Math.cos(phi)
                ],
                scale: 0.3 + ((r.sales || 0) / maxSales) * 0.8,
                color: (r.profit || 0) >= 0 ? '#00FFA3' : '#FF2D95',
                region: r.region || 'Region',
                sales: r.sales || 0,
                profit: r.profit || 0
            };
        });
    }, [data]);

    return (
        <group position={position}>
            {/* Wireframe globe */}
            <mesh ref={wireRef}>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshBasicMaterial color="#7C4DFF" wireframe transparent opacity={0.15} />
            </mesh>

            {/* Dotted inner globe */}
            <mesh>
                <sphereGeometry args={[radius * 0.98, 48, 48]} />
                <pointsMaterial color="#00E5FF" size={0.05} transparent opacity={0.4} />
            </mesh>

            {/* Region nodes using Instances for performance */}
            <group ref={groupRef}>
                <Instances range={nodes.length}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial toneMapped={false} />
                    {nodes.map((n, i) => (
                        <Instance 
                            key={i} 
                            position={n.pos} 
                            scale={n.scale} 
                            color={n.color} 
                        />
                    ))}
                </Instances>
                
                {/* Labels for top nodes to limit Html tags */}
                {nodes.slice(0, 5).map((n, i) => (
                    <Html key={'label'+i} position={n.pos} distanceFactor={25} center style={{ pointerEvents: 'none', willChange: 'transform' }}>
                        <div style={{
                            background: 'rgba(5,6,13,0.8)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid ' + n.color + '66',
                            borderRadius: 8,
                            padding: '6px 12px',
                            textAlign: 'center',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}>
                            <div style={{ color: n.color, fontSize: 12, fontWeight: 700 }}>{n.region}</div>
                            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{formatCurrency(n.sales)}</div>
                        </div>
                    </Html>
                ))}
            </group>
        </group>
    );
}
