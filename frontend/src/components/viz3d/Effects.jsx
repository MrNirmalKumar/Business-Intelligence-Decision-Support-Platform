import React from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function Effects({ quality = 'high' }) {
    if (quality === 'low') return null;
    return (
        <EffectComposer multisampling={0} disableNormalPass>
            <Bloom
                intensity={1.1}
                luminanceThreshold={0.25}
                luminanceSmoothing={0.85}
                mipmapBlur
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={[0.0005, 0.0005]}
            />
            <Vignette darkness={0.35} offset={0.3} />
            <Noise opacity={0.04} blendFunction={BlendFunction.SOFT_LIGHT} />
        </EffectComposer>
    );
}
