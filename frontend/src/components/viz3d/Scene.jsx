import React, { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Stars, Sparkles, MeshReflectorMaterial, Environment, AdaptiveDpr, PerformanceMonitor, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import CategoryTowers from './CategoryTowers';
import RegionGlobe from './RegionGlobe';
import TrendRibbon from './TrendRibbon';
import KpiHolograms from './KpiHolograms';
import CameraRig from './CameraRig';
import Effects from './Effects';

function GridFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[300, 300]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={40}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#05060d"
                metalness={0.6}
            />
        </mesh>
    );
}

function NeonGrid() {
    return (
        <gridHelper args={[300, 150, '#00E5FF', '#7C4DFF']} position={[0, 0, 0]}>
            <lineBasicMaterial attach="material" transparent opacity={0.15} depthWrite={false} />
        </gridHelper>
    );
}



export default function Scene({
    categories,
    regions,
    salesTrend,
    profitTrend,
    summary,
    mode,
    setMode,
    mousePos,
    targetZone,
    onZoneChange
}) {
    const [dpr, setDpr] = useState(1.5);
    const [quality, setQuality] = useState('high');
    const [focusTarget, setFocusTarget] = useState(null);

    const handleFocus = (worldPos) => {
        setFocusTarget(worldPos);
        setMode('focus');
    };

    return (
        <>
            <Canvas
                camera={{ position: [0, 4, 14], fov: 55, near: 0.1, far: 500 }}
                gl={{
                    antialias: false, 
                    powerPreference: 'high-performance',
                    toneMapping: THREE.ACESFilmicToneMapping,
                    outputColorSpace: THREE.SRGBColorSpace
                }}
                style={{ position: 'absolute', inset: 0, background: '#02030a' }}
                frameloop="always" 
            >
                <PerformanceMonitor 
                    onDecline={() => { setDpr(1); setQuality('low'); }} 
                    onInclined={() => { setDpr(1.5); setQuality('high'); }}
                />
                <AdaptiveDpr pixelated />
                
                <color attach="background" args={['#02030a']} />
                <fog attach="fog" color="#02030a" near={20} far={120} />
                
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 20, 10]} intensity={0.5} color="#7C4DFF" />
                <Environment preset="city" />

                <Stars radius={120} depth={60} count={3000} factor={3} saturation={0} fade speed={0.5} />
                <Sparkles count={300} scale={[150, 20, 150]} size={2} speed={0.3} opacity={0.4} color="#00E5FF" position={[60, 10, 0]}/>

                <Suspense fallback={null}>
                    <ScrollControls pages={4} damping={0.2} enabled={mode === 'tour'}>
                        <CameraRig
                            mode={mode}
                            setMode={setMode}
                            mousePos={mousePos}
                            focusTarget={focusTarget}
                            targetZone={targetZone}
                            onZoneChange={onZoneChange}
                        />
                        <Scroll>
                            <GridFloor />
                            <NeonGrid />

                            {/* Zone A: Category Towers */}
                            <CategoryTowers data={categories} position={[0, 0, 0]} onFocus={handleFocus} />

                            {/* Zone B: Region Globe */}
                            <RegionGlobe data={regions} position={[40, 6, 0]} />

                            {/* Zone C: Trend Ribbons */}
                            <TrendRibbon salesData={salesTrend} profitData={profitTrend} position={[80, 0, 0]} />

                            {/* Zone D: KPI Holograms */}
                            <KpiHolograms summary={summary} categoryCount={categories ? categories.length : 0} position={[120, 4, 0]} />
                        </Scroll>
                    </ScrollControls>

                    <Effects quality={quality} />
                </Suspense>
            </Canvas>
        </>
    );
}
