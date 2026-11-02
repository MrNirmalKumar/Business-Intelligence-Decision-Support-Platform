import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    ShoppingBag,
    Package,
    Activity,
    UploadCloud,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    Database,
    Sparkles,
    Users,
    Globe,
    Truck,
    Layers,
    Award,
    AlertCircle,
    FileText,
    Percent
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    Line,
    Legend
} from 'recharts';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { getDatasets } from '../services/datasetService';
import {
    getDashboardSummary,
    getSalesTrend,
    getProfitTrend,
    getCategoryPerformance,
    getSubCategoryPerformance,
    getYearWisePerformance,
    getDiscountVsProfit,
    getRegionPerformance,
    getMarketPerformance,
    getSegmentPerformance,
    getTopCustomers,
    getTopProducts,
    getOrderPriority,
    getShippingAnalysis
} from '../services/dashboardService';
import { getInsights } from '../services/insightService';

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0';
    return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const CustomChartTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl text-xs z-50">
                <p className="font-semibold text-slate-300 border-b border-slate-700/80 pb-1.5 mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                                {entry.name}:
                            </span>
                            <span className="font-bold text-white">
                                {formatter ? formatter(entry.value, entry.name) : Number(entry.value).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const { setActiveDatasetName } = useOutletContext();
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);

    // Active PBIX Page Tab
    const [activeTab, setActiveTab] = useState('executive'); // 'executive' | 'sales_profit' | 'customer_regional' | 'product_shipping'

    // Analytics Data States
    const [summary, setSummary] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [profitTrend, setProfitTrend] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [discountVsProfit, setDiscountVsProfit] = useState([]);
    const [regions, setRegions] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [segments, setSegments] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orderPriority, setOrderPriority] = useState([]);
    const [shipping, setShipping] = useState([]);
    const [insights, setInsights] = useState([]);

    // Fetch user datasets on mount
    useEffect(() => {
        const fetchInitialDatasets = async () => {
            try {
                setLoading(true);
                const res = await getDatasets();
                const list = (res.data || []).filter(d => d.status !== 'trashed');
                setDatasets(list);
                if (list.length > 0) {
                    const firstId = list[0]._id;
                    setSelectedDatasetId(firstId);
                    setActiveDatasetName(list[0].file_name);
                } else {
                    setActiveDatasetName(null);
                }
            } catch (err) {
                console.error('Failed to load datasets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialDatasets();
    }, []);

    // Fetch all analytics when dataset changes
    useEffect(() => {
        if (!selectedDatasetId) return;

        const loadDatasetMetrics = async () => {
            try {
                setDataLoading(true);
                const [
                    sumRes, salesRes, profitRes, catRes, subCatRes,
                    yearRes, discRes, regRes, mktRes, segRes,
                    custRes, prodRes, prioRes, shipRes, insRes
                ] = await Promise.all([
                    getDashboardSummary(selectedDatasetId).catch(() => ({ data: null })),
                    getSalesTrend(selectedDatasetId).catch(() => ({ data: [] })),
                    getProfitTrend(selectedDatasetId).catch(() => ({ data: [] })),
                    getCategoryPerformance(selectedDatasetId).catch(() => ({ data: [] })),
                    getSubCategoryPerformance(selectedDatasetId).catch(() => ({ data: [] })),
                    getYearWisePerformance(selectedDatasetId).catch(() => ({ data: [] })),
                    getDiscountVsProfit(selectedDatasetId).catch(() => ({ data: [] })),
                    getRegionPerformance(selectedDatasetId).catch(() => ({ data: [] })),
                    getMarketPerformance(selectedDatasetId).catch(() => ({ data: [] })),
                    getSegmentPerformance(selectedDatasetId).catch(() => ({ data: [] })),
                    getTopCustomers(selectedDatasetId).catch(() => ({ data: [] })),
                    getTopProducts(selectedDatasetId).catch(() => ({ data: [] })),
                    getOrderPriority(selectedDatasetId).catch(() => ({ data: [] })),
                    getShippingAnalysis(selectedDatasetId).catch(() => ({ data: [] })),
                    getInsights(selectedDatasetId).catch(() => ({ data: [] }))
                ]);

                setSummary(sumRes.data);
                setSalesTrend(salesRes.data || []);
                setProfitTrend(profitRes.data || []);
                setCategories(catRes.data || []);
                setSubCategories(subCatRes.data || []);
                setYearData(yearRes.data || []);
                setDiscountVsProfit(discRes.data || []);
                setRegions(regRes.data || []);
                setMarkets(mktRes.data || []);
                setSegments(segRes.data || []);
                setTopCustomers(custRes.data || []);
                setTopProducts(prodRes.data || []);
                setOrderPriority(prioRes.data || []);
                setShipping(shipRes.data || []);
                setInsights(insRes.data || []);

                const currentDs = datasets.find(d => d._id === selectedDatasetId);
                if (currentDs) setActiveDatasetName(currentDs.file_name);
            } catch (err) {
                console.error('Error fetching dashboard details:', err);
            } finally {
                setDataLoading(false);
            }
        };

        loadDatasetMetrics();
    }, [selectedDatasetId]);

    const handleDatasetChange = (id) => {
        setSelectedDatasetId(id);
    };

    if (loading) {
        return <Loader fullScreen={false} />;
    }

    if (datasets.length === 0) {
        return (
            <div className="py-12">
                <Card isGlass={true} className="max-w-2xl mx-auto text-center py-16 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <UploadCloud className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-surface-900 mb-2">No Datasets Found</h2>
                    <p className="text-surface-500 max-w-md mx-auto mb-8 text-sm">
                        Please upload your cleaned dataset (e.g., <code>Global_Superstore2_Cleaned.csv</code>) to generate the Power BI executive analytics.
                    </p>
                    <Link to="/upload">
                        <Button variant="primary" size="lg" className="shadow-lg shadow-primary-500/25">
                            Upload Dataset Now
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // Health Score Category Badge Color
    const getHealthScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (score >= 60) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        if (score >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Dataset Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-surface-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
                            Business Intelligence & Decision Support Platform
                        </h1>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 border border-primary-200">
                            Power BI Parity
                        </span>
                    </div>
                    <p className="text-xs text-surface-500 mt-1">
                        Dynamic rule-based analytics mirrored from <code>BIDSP.pbix</code> &amp; SQL specifications.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={selectedDatasetId || ''}
                            onChange={(e) => handleDatasetChange(e.target.value)}
                            className="appearance-none bg-surface-50 hover:bg-surface-100/80 text-surface-800 text-xs font-semibold py-2.5 pl-3.5 pr-9 rounded-xl border border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm transition-all"
                        >
                            {datasets.map(d => (
                                <option key={d._id} value={d._id}>
                                    {d.file_name} ({Number(d.row_count || 0).toLocaleString()} rows)
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-surface-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <Link to="/visualize">
                        <Button variant="outline" size="sm" className="gap-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 shadow-sm">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            3D Universe
                        </Button>
                    </Link>

                    <Link to="/upload">
                        <Button variant="outline" size="sm" className="gap-2">
                            <UploadCloud className="w-4 h-4" />
                            Upload CSV
                        </Button>
                    </Link>
                </div>
            </div>

            {/* PBIX 4-PAGE TAB NAVIGATION */}
            <div className="flex flex-wrap items-center gap-2 border-b border-surface-200 pb-2">
                <button
                    onClick={() => setActiveTab('executive')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        activeTab === 'executive'
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-surface-100/80 hover:bg-surface-200 text-surface-600'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Page 1: Executive Overview
                </button>

                <button
                    onClick={() => setActiveTab('sales_profit')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        activeTab === 'sales_profit'
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-surface-100/80 hover:bg-surface-200 text-surface-600'
                    }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Page 2: Sales &amp; Profit Analysis
                </button>

                <button
                    onClick={() => setActiveTab('customer_regional')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        activeTab === 'customer_regional'
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-surface-100/80 hover:bg-surface-200 text-surface-600'
                    }`}
                >
                    <Globe className="w-4 h-4" />
                    Page 3: Customer &amp; Regional Analysis
                </button>

                <button
                    onClick={() => setActiveTab('product_shipping')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        activeTab === 'product_shipping'
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-surface-100/80 hover:bg-surface-200 text-surface-600'
                    }`}
                >
                    <Truck className="w-4 h-4" />
                    Page 4: Product &amp; Shipping Analysis
                </button>
            </div>

            {/* TAB CONTENT */}
            {dataLoading ? (
                <div className="py-24">
                    <Loader fullScreen={false} />
                </div>
            ) : (
                <>
                    {/* ========================================================================= */}
                    {/* TAB 1: EXECUTIVE OVERVIEW */}
                    {/* ========================================================================= */}
                    {activeTab === 'executive' && (
                        <div className="space-y-6">
                            {/* KPI Cards Row */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {/* Total Sales */}
                                <Card className="p-4 border-l-4 border-blue-500">
                                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Total Sales</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-surface-900 mt-1">
                                        {formatCurrency(summary?.total_sales)}
                                    </h3>
                                    <p className="text-[10px] text-surface-400 mt-1 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-blue-500" /> Revenue Volume
                                    </p>
                                </Card>

                                {/* Total Profit */}
                                <Card className="p-4 border-l-4 border-emerald-500">
                                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Total Profit</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                                        {formatCurrency(summary?.total_profit)}
                                    </h3>
                                    <p className="text-[10px] text-surface-400 mt-1">
                                        Margin: <strong className="text-surface-700">{summary?.profit_margin}%</strong>
                                    </p>
                                </Card>

                                {/* Total Orders */}
                                <Card className="p-4 border-l-4 border-purple-500">
                                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Total Orders</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-surface-900 mt-1">
                                        {Number(summary?.total_orders || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-[10px] text-surface-400 mt-1">
                                        Avg Order: <strong className="text-surface-700">{formatCurrency(summary?.avg_order_value)}</strong>
                                    </p>
                                </Card>

                                {/* Total Customers */}
                                <Card className="p-4 border-l-4 border-amber-500">
                                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Total Customers</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-surface-900 mt-1">
                                        {Number(summary?.total_customers || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-[10px] text-surface-400 mt-1 flex items-center gap-1">
                                        <Users className="w-3 h-3 text-amber-500" /> Distinct Client Base
                                    </p>
                                </Card>

                                {/* Business Health Score */}
                                <Card className="p-4 border-l-4 border-indigo-500 col-span-2 md:col-span-1">
                                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Business Health Score</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <h3 className="text-2xl font-black text-surface-900">
                                            {summary?.health_score ?? '--'}
                                        </h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getHealthScoreColor(summary?.health_score || 0)}`}>
                                            {summary?.health_category || 'N/A'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-surface-400 mt-1">DAX Switch Formula</p>
                                </Card>
                            </div>

                            {/* Monthly Sales Trend */}
                            <Card>
                                <CardHeader
                                    title="Monthly Sales Trend"
                                    subtitle="Year Month progression of total revenue volume (PBIX Line Chart)"
                                />
                                <CardBody>
                                    <div className="h-[340px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesTrend}>
                                                <defs>
                                                    <linearGradient id="execSalesGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                <Area type="monotone" dataKey="sales" name="Total Sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#execSalesGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Category Performance: Sales & Profit */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales by Category */}
                                <Card>
                                    <CardHeader
                                        title="Sales by Category"
                                        subtitle="Revenue breakdown across product categories"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={categories}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="sales" name="Total Sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Profit by Category */}
                                <Card>
                                    <CardHeader
                                        title="Profit by Category"
                                        subtitle="Net profit contribution across product categories"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={categories}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="profit" name="Total Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Business Insights & Recommendations Table / Card (PBIX Table Visual) */}
                            <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
                                <CardHeader
                                    title="Business Insights & Recommendations"
                                    subtitle="Dynamic rule-based narrative generated from BIDSP.pbix DAX measure"
                                />
                                <CardBody>
                                    <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                                            <Sparkles className="w-4 h-4" />
                                            DAX Evaluation Output
                                        </div>
                                        <div className="text-sm text-surface-800 leading-relaxed font-mono whitespace-pre-line bg-surface-50 p-4 rounded-lg border border-surface-200">
                                            {summary?.dax_narrative || (
                                                `Profit Margin: ${summary?.profit_margin || 0}%\nTechnology is the highest-sales category.\nReview pricing and discount strategy to improve profitability.`
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* TAB 2: SALES & PROFIT ANALYSIS */}
                    {/* ========================================================================= */}
                    {activeTab === 'sales_profit' && (
                        <div className="space-y-6">
                            {/* Year-wise Sales & Profit Combo Chart */}
                            <Card>
                                <CardHeader
                                    title="Year-wise Sales & Profit"
                                    subtitle="Multi-year comparison (PBIX Line & Clustered Column Combo Chart)"
                                />
                                <CardBody>
                                    <div className="h-[340px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={yearData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#10b981' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                <Legend />
                                                <Bar yAxisId="left" dataKey="sales" name="Total Sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                                <Line yAxisId="right" type="monotone" dataKey="profit" name="Total Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Sub-Category Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales by Sub-Category */}
                                <Card>
                                    <CardHeader
                                        title="Sales by Sub-Category"
                                        subtitle="Revenue ranking across all 17 sub-categories"
                                    />
                                    <CardBody>
                                        <div className="h-[460px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={subCategories} layout="vertical" margin={{ left: 40, right: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <YAxis dataKey="sub_category" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={90} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="sales" name="Total Sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Profit by Sub-Category */}
                                <Card>
                                    <CardHeader
                                        title="Profit by Sub-Category"
                                        subtitle="Net profit contribution (Negative profit highlighted in red)"
                                    />
                                    <CardBody>
                                        <div className="h-[460px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={subCategories} layout="vertical" margin={{ left: 40, right: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <YAxis dataKey="sub_category" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={90} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="profit" name="Total Profit" radius={[0, 4, 4, 0]}>
                                                        {subCategories.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.profit < 0 ? '#ef4444' : '#10b981'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Sub-Category Data Table (PBIX Table Visual) */}
                            <Card>
                                <CardHeader
                                    title="Sub-Category Performance Summary"
                                    subtitle="Tabular breakdown of Sales, Profit, and Profit Margin"
                                />
                                <CardBody>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-surface-50 text-surface-600 font-bold uppercase tracking-wider border-b border-surface-200">
                                                <tr>
                                                    <th className="py-3 px-4">Sub-Category</th>
                                                    <th className="py-3 px-4 text-right">Total Sales</th>
                                                    <th className="py-3 px-4 text-right">Total Profit</th>
                                                    <th className="py-3 px-4 text-right">Avg Discount</th>
                                                    <th className="py-3 px-4 text-right">Profit Margin</th>
                                                    <th className="py-3 px-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-100 font-medium">
                                                {subCategories.map((item, idx) => (
                                                    <tr key={idx} className={item.profit < 0 ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-surface-50'}>
                                                        <td className="py-2.5 px-4 font-bold text-surface-900">{item.sub_category}</td>
                                                        <td className="py-2.5 px-4 text-right">{formatCurrency(item.sales)}</td>
                                                        <td className={`py-2.5 px-4 text-right font-bold ${item.profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {formatCurrency(item.profit)}
                                                        </td>
                                                        <td className="py-2.5 px-4 text-right">{item.avg_discount}%</td>
                                                        <td className={`py-2.5 px-4 text-right font-semibold ${item.margin < 0 ? 'text-red-600' : 'text-surface-700'}`}>
                                                            {item.margin}%
                                                        </td>
                                                        <td className="py-2.5 px-4 text-center">
                                                            {item.profit < 0 ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                                    <AlertTriangle className="w-3 h-3" /> Loss-Maker
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle className="w-3 h-3" /> Profitable
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* TAB 3: CUSTOMER & REGIONAL ANALYSIS */}
                    {/* ========================================================================= */}
                    {activeTab === 'customer_regional' && (
                        <div className="space-y-6">
                            {/* Regional Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales by Region */}
                                <Card>
                                    <CardHeader
                                        title="Sales by Region"
                                        subtitle="Regional gross revenue ranking (PBIX Clustered Bar)"
                                    />
                                    <CardBody>
                                        <div className="h-[380px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={regions} layout="vertical" margin={{ left: 50, right: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <YAxis dataKey="region" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={100} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="sales" name="Total Sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Profit by Region */}
                                <Card>
                                    <CardHeader
                                        title="Profit by Region"
                                        subtitle="Net profit contribution by geographical region"
                                    />
                                    <CardBody>
                                        <div className="h-[380px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={regions} layout="vertical" margin={{ left: 50, right: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <YAxis dataKey="region" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={100} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="profit" name="Total Profit" fill="#10b981" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Market & Segment Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales by Market */}
                                <Card>
                                    <CardHeader
                                        title="Sales by Market"
                                        subtitle="Global market clusters (APAC, EU, US, LATAM, etc.)"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={markets}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="market" tick={{ fontSize: 11, fill: '#64748b' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="sales" name="Total Sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Sales by Segment (Donut Chart) */}
                                <Card>
                                    <CardHeader
                                        title="Sales by Segment"
                                        subtitle="Consumer vs Corporate vs Home Office distribution"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={segments}
                                                        dataKey="sales"
                                                        nameKey="segment"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={100}
                                                        paddingAngle={3}
                                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    >
                                                        {segments.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Top 10 Customers by Sales */}
                            <Card>
                                <CardHeader
                                    title="Top 10 Customers by Sales"
                                    subtitle="High-value client volume ranking (PBIX TopN Filter)"
                                />
                                <CardBody>
                                    <div className="h-[360px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topCustomers} layout="vertical" margin={{ left: 60, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                <YAxis dataKey="customer_name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
                                                <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                <Bar dataKey="sales" name="Total Sales" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* TAB 4: PRODUCT & SHIPPING ANALYSIS */}
                    {/* ========================================================================= */}
                    {activeTab === 'product_shipping' && (
                        <div className="space-y-6">
                            {/* Shipping Mode Sales & Profit */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales by Ship Mode */}
                                <Card>
                                    <CardHeader
                                        title="Sales by Ship Mode"
                                        subtitle="Revenue generated by delivery tier"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={shipping}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="ship_mode" tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="sales" name="Total Sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Profit by Ship Mode */}
                                <Card>
                                    <CardHeader
                                        title="Profit by Ship Mode"
                                        subtitle="Net profit contribution by shipping class"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={shipping}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="ship_mode" tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="profit" name="Total Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Shipping Cost & Order Priority Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Shipping Cost by Ship Mode */}
                                <Card>
                                    <CardHeader
                                        title="Shipping Cost by Ship Mode"
                                        subtitle="Total freight expense per shipping tier (PBIX Sum of Shipping Cost)"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={shipping} layout="vertical" margin={{ left: 40, right: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                    <YAxis dataKey="ship_mode" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={100} />
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                    <Bar dataKey="total_shipping_cost" name="Shipping Cost" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Orders by Order Priority (Donut Chart) */}
                                <Card>
                                    <CardHeader
                                        title="Orders by Priority"
                                        subtitle="Order volume by dispatch urgency (Critical, High, Medium, Low)"
                                    />
                                    <CardBody>
                                        <div className="h-[280px] w-full flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={orderPriority}
                                                        dataKey="total_orders"
                                                        nameKey="order_priority"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={100}
                                                        paddingAngle={3}
                                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    >
                                                        {orderPriority.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomChartTooltip formatter={(v) => Number(v).toLocaleString() + ' orders'} />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Top 10 Products by Sales */}
                            <Card>
                                <CardHeader
                                    title="Top 10 Products by Sales"
                                    subtitle="Highest selling SKUs (PBIX TopN Filter)"
                                />
                                <CardBody>
                                    <div className="h-[380px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topProducts} layout="vertical" margin={{ left: 60, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                                <YAxis dataKey="product_name" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={160} />
                                                <Tooltip content={<CustomChartTooltip formatter={(v) => formatCurrency(v)} />} />
                                                <Bar dataKey="sales" name="Total Sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
