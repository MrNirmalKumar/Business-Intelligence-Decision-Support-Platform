import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Ribbon({ data, dataKey, color, offsetY = 0 }) {
    const particlesRef = useRef();

    const { geometry, curve, glowGeometry } = useMemo(() => {
        if (!data || data.length < 2) return { geometry: null, curve: null };
        const vals = data.map(d => d[dataKey] || 0);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const range = max - min || 1;

        const points = vals.map((v, i) => {
            const x = (i / (vals.length - 1)) * 30 - 15; // Widen the spread
            const y = ((v - min) / range) * 8 + offsetY; // Increase height variation
            const z = Math.sin(i) * 2; // Add some depth wave
            return new THREE.Vector3(x, y, z);
        });

        const c = new THREE.CatmullRomCurve3(points);
        const g = new THREE.TubeGeometry(c, 128, 0.2, 8, false);
        const glowG = new THREE.TubeGeometry(c, 128, 0.6, 8, false);
        return { geometry: g, curve: c, glowGeometry: glowG };
    }, [data, dataKey, offsetY]);

    const particlePositions = useMemo(() => {
        if (!curve) return new Float32Array(0);
        const count = 50;
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const p = curve.getPoint(i / count);
            arr[i * 3] = p.x;
            arr[i * 3 + 1] = p.y;
            arr[i * 3 + 2] = p.z;
        }
        return arr;
    }, [curve]);

    useFrame((state) => {
        if (particlesRef.current && curve) {
            const positions = particlesRef.current.geometry.attributes.position;
            const count = positions.count;
            for (let i = 0; i < count; i++) {
                const t = ((i / count) + state.clock.elapsedTime * 0.1) % 1;
                const p = curve.getPoint(t);
                positions.setXYZ(i, p.x, p.y, p.z);
            }
            positions.needsUpdate = true;
        }
    });

    if (!geometry || !glowGeometry) return null;

    return (
        <group>
            {/* Core bright ribbon */}
            <mesh geometry={geometry}>
                <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
            </mesh>
            {/* Glow envelope */}
            <mesh geometry={glowGeometry}>
                <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Travelling light particles */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={particlePositions}
                        count={particlePositions.length / 3}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial color="#ffffff" size={0.4} transparent opacity={1} sizeAttenuation toneMapped={false} />
            </points>
        </group>
    );
}

export default function TrendRibbon({ salesData, profitData, position = [80, 0, 0] }) {
    return (
        <group position={position}>
            <Ribbon data={salesData} dataKey="sales" color="#00E5FF" offsetY={2} />
            <Ribbon data={profitData} dataKey="profit" color="#FF2D95" offsetY={-2} />
        </group>
    );
}
