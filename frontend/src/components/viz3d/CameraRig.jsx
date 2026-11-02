import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Camera path aligned with zones spaced 40 units apart on X axis
const pathPoints = [
    new THREE.Vector3(0, 4, 14),   // Zone A: Towers
    new THREE.Vector3(40, 6, 20),  // Zone B: Globe
    new THREE.Vector3(80, 5, 18),  // Zone C: Ribbon
    new THREE.Vector3(120, 3, 20)  // Zone D: KPIs
];
const curve = new THREE.CatmullRomCurve3(pathPoints);

const lookPoints = [
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(40, 6, 0),
    new THREE.Vector3(80, 2, 0),
    new THREE.Vector3(120, 2, 0)
];
const lookCurve = new THREE.CatmullRomCurve3(lookPoints);

export default function CameraRig({ mode, setMode, mousePos, focusTarget, targetZone, onZoneChange }) {
    const scroll = useScroll();
    const { camera } = useThree();
    const targetPos = useRef(new THREE.Vector3());
    const targetLook = useRef(new THREE.Vector3());
    const currentLook = useRef(new THREE.Vector3(0, 2, 0));
    const controlsRef = useRef();
    const lastZoneRef = useRef(0);

    // Initial camera setup
    useEffect(() => {
        camera.up.set(0, 1, 0);
        camera.position.copy(pathPoints[0]);
        camera.lookAt(lookPoints[0]);
    }, [camera]);

    // Handle Zone Navigation jump
    useEffect(() => {
        if (targetZone && targetZone.index !== undefined && pathPoints[targetZone.index]) {
            const idx = targetZone.index;
            if (scroll && scroll.el) {
                const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
                const targetScroll = (idx / (pathPoints.length - 1)) * maxScroll;
                scroll.el.scrollTo({ top: targetScroll, behavior: 'smooth' });
            } else {
                gsap.killTweensOf(camera.position);
                gsap.killTweensOf(currentLook.current);

                const destPos = pathPoints[idx];
                const destLook = lookPoints[idx];

                gsap.to(camera.position, {
                    x: destPos.x,
                    y: destPos.y,
                    z: destPos.z,
                    duration: 1.2,
                    ease: "power3.inOut"
                });
                gsap.to(currentLook.current, {
                    x: destLook.x,
                    y: destLook.y,
                    z: destLook.z,
                    duration: 1.2,
                    ease: "power3.inOut",
                    onUpdate: () => {
                        camera.lookAt(currentLook.current);
                        if (controlsRef.current) {
                            controlsRef.current.target.copy(currentLook.current);
                        }
                    }
                });
            }
        }
    }, [targetZone, scroll, camera]);

    // Handle Item Focus
    useEffect(() => {
        if (mode === 'focus' && focusTarget) {
            gsap.killTweensOf(camera.position);
            gsap.killTweensOf(currentLook.current);

            const offset = new THREE.Vector3(0, 2, 8).add(focusTarget);

            gsap.to(camera.position, {
                x: offset.x,
                y: offset.y,
                z: offset.z,
                duration: 1.4,
                ease: "power3.inOut"
            });
            gsap.to(currentLook.current, {
                x: focusTarget.x,
                y: focusTarget.y,
                z: focusTarget.z,
                duration: 1.4,
                ease: "power3.inOut",
                onUpdate: () => {
                    camera.lookAt(currentLook.current);
                    if (controlsRef.current) {
                        controlsRef.current.target.copy(currentLook.current);
                    }
                }
            });
        }
    }, [mode, focusTarget, camera]);

    // When switching from tour to orbit, align orbit target to the current look target
    useEffect(() => {
        if (mode === 'orbit' && controlsRef.current) {
            controlsRef.current.target.copy(currentLook.current);
            controlsRef.current.update();
        }
    }, [mode]);

    useFrame((state, delta) => {
        if (mode === 'tour' && scroll) {
            const t = scroll.offset;

            // Report current zone index
            const currentZoneIdx = Math.min(Math.max(Math.round(t * (pathPoints.length - 1)), 0), pathPoints.length - 1);
            if (currentZoneIdx !== lastZoneRef.current) {
                lastZoneRef.current = currentZoneIdx;
                if (onZoneChange) onZoneChange(currentZoneIdx);
            }

            curve.getPoint(t, targetPos.current);
            lookCurve.getPoint(t, targetLook.current);

            // Subtle mouse parallax
            if (mousePos) {
                targetPos.current.x += mousePos.x * 0.4;
                targetPos.current.y += mousePos.y * 0.4;
            }

            // Smooth damping
            camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 4, delta);
            camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 4, delta);
            camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 4, delta);

            currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, targetLook.current.x, 4, delta);
            currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, targetLook.current.y, 4, delta);
            currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, targetLook.current.z, 4, delta);

            camera.lookAt(currentLook.current);

            const baseFov = 55;
            const targetFov = baseFov - Math.sin(t * Math.PI * 3) * 5;
            camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 2, delta);
            camera.updateProjectionMatrix();
        }

        // Lock camera roll
        camera.rotation.z = 0;
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enabled={mode === 'orbit'}
            enableDamping
            dampingFactor={0.06}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={50}
        />
    );
}
