import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { getDatasets } from '../services/datasetService';
import {
    getDashboardSummary, getSalesTrend, getProfitTrend,
    getCategoryPerformance, getRegionPerformance
} from '../services/dashboardService';
import HUD from '../components/viz3d/HUD';
import FuturisticLoader from '../components/viz3d/FuturisticLoader';

const Scene = lazy(() => import('../components/viz3d/Scene'));

export default function Visualize3D() {
    const [datasets, setDatasets] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [summary, setSummary] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [profitTrend, setProfitTrend] = useState([]);
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);
    const [mode, setMode] = useState('tour'); // 'tour' | 'orbit' | 'focus'
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeZone, setActiveZone] = useState(0);
    const [targetZone, setTargetZone] = useState(null);

    const handleJumpToZone = useCallback((index) => {
        setTargetZone({ index, timestamp: Date.now() });
        setActiveZone(index);
        setMode('tour');
    }, []);

    const handleMouseMove = useCallback((e) => {
        setMousePos({
            x: (e.clientX / window.innerWidth - 0.5) * 2,
            y: -(e.clientY / window.innerHeight - 0.5) * 2
        });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    useEffect(() => {
        getDatasets().then(res => {
            const list = (res.data || []).filter(d => d.status !== 'trashed');
            setDatasets(list);
            if (list.length > 0) setSelectedId(list[0]._id);
            else setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        setDataReady(false);
        Promise.all([
            getDashboardSummary(selectedId),
            getSalesTrend(selectedId),
            getProfitTrend(selectedId),
            getCategoryPerformance(selectedId),
            getRegionPerformance(selectedId)
        ]).then(([s, st, pt, cat, reg]) => {
            setSummary(s.data);
            setSalesTrend(st.data || []);
            setProfitTrend(pt.data || []);
            setCategories(cat.data || []);
            setRegions(reg.data || []);
            setDataReady(true);
        }).catch(err => {
            console.error('Data load error:', err);
        }).finally(() => setLoading(false));
    }, [selectedId]);

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#02030a', overflow: 'hidden' }}>
            {/* Fallback loader before React Suspense catches Scene */}
            {(!dataReady) && (
                <FuturisticLoader isGlobal={true} />
            )}

            {dataReady && (
                <Suspense fallback={<FuturisticLoader isGlobal={true} />}>
                    <Scene
                        categories={categories}
                        regions={regions}
                        salesTrend={salesTrend}
                        profitTrend={profitTrend}
                        summary={summary}
                        mode={mode}
                        setMode={setMode}
                        mousePos={mousePos}
                        targetZone={targetZone}
                        onZoneChange={setActiveZone}
                    />
                </Suspense>
            )}

            {dataReady && (
                <HUD
                    datasets={datasets}
                    selectedId={selectedId}
                    onSelectDataset={setSelectedId}
                    mode={mode}
                    onModeChange={setMode}
                    activeZone={activeZone}
                    onJumpToZone={handleJumpToZone}
                />
            )}
        </div>
    );
}
