import React, { useState, useEffect } from 'react';
import {
    Lightbulb,
    ShieldAlert,
    CheckCircle2,
    Filter,
    Search,
    ChevronDown,
    Activity,
    Info,
    ArrowRight,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { getDatasets } from '../services/datasetService';
import { getInsights, getHealthScore } from '../services/insightService';

const Insights = () => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(null);
    const [insights, setInsights] = useState([]);
    const [healthScore, setHealthScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingInsights, setFetchingInsights] = useState(false);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFormulaModal, setShowFormulaModal] = useState(false);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                setLoading(true);
                const dsRes = await getDatasets();
                const list = dsRes.data || [];
                setDatasets(list);
                if (list.length > 0) {
                    setSelectedDatasetId(list[0]._id);
                }
            } catch (err) {
                console.error('Failed to load datasets:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitial();
    }, []);

    useEffect(() => {
        if (!selectedDatasetId) return;

        const loadInsightsAndScore = async () => {
            try {
                setFetchingInsights(true);
                const [insRes, scoreRes] = await Promise.all([
                    getInsights(selectedDatasetId, categoryFilter, severityFilter),
                    getHealthScore(selectedDatasetId).catch(() => ({ data: null }))
                ]);

                setInsights(insRes.data || []);
                setHealthScore(scoreRes.data);
            } catch (err) {
                console.error('Failed to load insights:', err);
            } finally {
                setFetchingInsights(false);
            }
        };

        loadInsightsAndScore();
    }, [selectedDatasetId, categoryFilter, severityFilter]);

    const filteredInsights = insights.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.recommendation?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q)
        );
    });

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
                        Insights & Recommendations
                    </h1>
                    <p className="text-xs sm:text-sm text-surface-500">
                        Rule-based intelligence, anomaly detection, and actionable business strategies.
                    </p>
                </div>

                {datasets.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-500 font-medium hidden sm:inline">Dataset:</span>
                        <div className="relative">
                            <select
                                value={selectedDatasetId || ''}
                                onChange={(e) => setSelectedDatasetId(e.target.value)}
                                className="appearance-none bg-white border border-surface-200 text-surface-800 py-2 pl-3.5 pr-8 rounded-lg text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
                            >
                                {datasets.map((d) => (
                                    <option key={d._id} value={d._id}>{d.file_name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Health Score Overview Banner */}
            {healthScore && (
                <Card isGlass={true} className="border-primary-200/60 bg-gradient-to-r from-primary-50/50 via-white to-primary-50/30">
                    <CardBody className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-primary-100 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-3xl font-extrabold text-primary-600">
                                        {healthScore.score}
                                    </span>
                                    <span className="text-[10px] text-surface-400 uppercase tracking-widest font-bold">Health</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-surface-900">
                                            Overall Business Health: {healthScore.score_category}
                                        </h3>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                            healthScore.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                            healthScore.score >= 60 ? 'bg-blue-100 text-blue-800' :
                                            healthScore.score >= 40 ? 'bg-amber-100 text-amber-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {healthScore.score_category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-surface-600 max-w-xl leading-relaxed">
                                        The composite score is algorithmically derived from weighted indicators:
                                        Sales volume (30%), Profit margins (30%), Order performance (20%), and Regional diversification (20%).
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowFormulaModal(!showFormulaModal)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-primary-700 bg-primary-100/70 hover:bg-primary-100 transition-colors shrink-0"
                            >
                                <Info className="w-4 h-4" />
                                <span>{showFormulaModal ? 'Hide Formula' : 'How Score is Calculated'}</span>
                            </button>
                        </div>

                        {/* Expandable Formula Explanation */}
                        {showFormulaModal && healthScore.breakdown && (
                            <div className="mt-6 pt-6 border-t border-primary-100 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-200">
                                <div className="p-3 bg-white/80 rounded-xl border border-primary-100">
                                    <span className="text-[11px] text-surface-500 font-semibold block">Sales Index (30%)</span>
                                    <span className="text-lg font-bold text-surface-900">{healthScore.breakdown.sales_score} / 100</span>
                                </div>
                                <div className="p-3 bg-white/80 rounded-xl border border-primary-100">
                                    <span className="text-[11px] text-surface-500 font-semibold block">Profitability (30%)</span>
                                    <span className="text-lg font-bold text-surface-900">{healthScore.breakdown.profitability_score} / 100</span>
                                </div>
                                <div className="p-3 bg-white/80 rounded-xl border border-primary-100">
                                    <span className="text-[11px] text-surface-500 font-semibold block">Order Avg (20%)</span>
                                    <span className="text-lg font-bold text-surface-900">{healthScore.breakdown.order_score} / 100</span>
                                </div>
                                <div className="p-3 bg-white/80 rounded-xl border border-primary-100">
                                    <span className="text-[11px] text-surface-500 font-semibold block">Regional Spread (20%)</span>
                                    <span className="text-lg font-bold text-surface-900">{healthScore.breakdown.regional_score} / 100</span>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Filter Toolbar */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search insights by title, category, or recommendation..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-surface-600 font-medium">
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filters:</span>
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-white border border-surface-200 text-xs font-medium text-surface-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="all">All Categories</option>
                            <option value="Sales">Sales</option>
                            <option value="Profit">Profitability</option>
                            <option value="Discount">Discounts</option>
                            <option value="Category">Category</option>
                            <option value="Regional">Regional</option>
                        </select>

                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="bg-white border border-surface-200 text-xs font-medium text-surface-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="all">All Severities</option>
                            <option value="high">High Severity</option>
                            <option value="medium">Medium Severity</option>
                            <option value="low">Low Severity</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Insights Cards List */}
            {fetchingInsights ? (
                <div className="py-16 text-center"><Loader /></div>
            ) : filteredInsights.length === 0 ? (
                <Card className="text-center py-16 px-4">
                    <Lightbulb className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-surface-800">No matching insights found</h3>
                    <p className="text-xs text-surface-500 max-w-sm mx-auto mt-1">
                        Try adjusting your filters or search query, or upload a dataset to generate new business rules.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredInsights.map((item) => (
                        <Card key={item._id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <CardBody className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                    {/* Left: Issue Details */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                                item.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                item.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                {item.severity} severity
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-100 text-surface-700">
                                                {item.category}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-surface-900">{item.title}</h3>
                                        <p className="text-sm text-surface-600 leading-relaxed">{item.description}</p>
                                    </div>

                                    {/* Right: Recommendation Card */}
                                    <div className="lg:w-96 rounded-xl bg-gradient-to-br from-primary-50/70 to-blue-50/40 border border-primary-100 p-4 shrink-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-6 h-6 rounded-md bg-primary-600 text-white flex items-center justify-center shrink-0">
                                                <Lightbulb className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-bold text-primary-900 uppercase tracking-wide">
                                                Strategic Recommendation
                                            </span>
                                        </div>
                                        <p className="text-xs text-surface-800 leading-relaxed font-medium">
                                            {item.recommendation}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Insights;
