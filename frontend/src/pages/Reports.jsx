import React, { useState, useEffect } from 'react';
import {
    FileText,
    Printer,
    Download,
    TrendingUp,
    DollarSign,
    Package,
    ShoppingBag,
    CheckCircle,
    ChevronDown,
    Building2
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { getDatasets } from '../services/datasetService';
import { getDashboardSummary, getCategoryPerformance, getRegionPerformance } from '../services/dashboardService';
import { getInsights } from '../services/insightService';

const Reports = () => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(null);
    const [summary, setSummary] = useState(null);
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                setLoading(true);
                const res = await getDatasets();
                const list = res.data || [];
                setDatasets(list);
                if (list.length > 0) {
                    setSelectedDatasetId(list[0]._id);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitial();
    }, []);

    useEffect(() => {
        if (!selectedDatasetId) return;

        const loadReportData = async () => {
            try {
                const [sumRes, catRes, regRes, insRes] = await Promise.all([
                    getDashboardSummary(selectedDatasetId),
                    getCategoryPerformance(selectedDatasetId),
                    getRegionPerformance(selectedDatasetId),
                    getInsights(selectedDatasetId)
                ]);

                setSummary(sumRes.data);
                setCategories(catRes.data || []);
                setRegions(regRes.data || []);
                setInsights(insRes.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        loadReportData();
    }, [selectedDatasetId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <Loader />;

    const currentDataset = datasets.find(d => d._id === selectedDatasetId);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Executive Performance Report</h1>
                    <p className="text-xs sm:text-sm text-surface-500">
                        Formal synthesized audit of sales, profitability, and operational risks.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {datasets.length > 0 && (
                        <div className="relative">
                            <select
                                value={selectedDatasetId || ''}
                                onChange={(e) => setSelectedDatasetId(e.target.value)}
                                className="appearance-none bg-white border border-surface-200 text-surface-800 py-2 pl-3.5 pr-8 rounded-lg text-sm font-medium shadow-2xs focus:outline-none"
                            >
                                {datasets.map((d) => (
                                    <option key={d._id} value={d._id}>{d.file_name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    )}

                    <Button variant="primary" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        <span>Print / Save as PDF</span>
                    </Button>
                </div>
            </div>

            {/* Printable Report Canvas */}
            <div className="bg-white border border-surface-200 rounded-2xl p-8 md:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
                {/* Header Banner */}
                <div className="flex justify-between items-start border-b border-surface-200 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                                BI
                            </div>
                            <span className="font-extrabold text-xl text-surface-900 tracking-tight">
                                BIDSP PLATFORM AUDIT
                            </span>
                        </div>
                        <p className="text-xs text-surface-500">
                            Generated on: {new Date().toLocaleDateString()} • Authorized Business Intelligence Report
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 block">Dataset</span>
                        <span className="text-sm font-bold text-surface-800">{currentDataset?.file_name || 'All Data'}</span>
                        <span className="text-xs text-surface-500 block">{currentDataset?.row_count || 0} Total Records</span>
                    </div>
                </div>

                {/* Key Executive KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <span className="text-xs text-surface-500 font-medium block">Total Revenue</span>
                        <span className="text-2xl font-bold text-surface-900 block mt-1">
                            ${summary?.total_sales?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <span className="text-xs text-surface-500 font-medium block">Net Operating Profit</span>
                        <span className={`text-2xl font-bold block mt-1 ${summary?.total_profit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                            ${summary?.total_profit?.toLocaleString() || '0'}
                        </span>
                        <span className="text-[11px] text-surface-500">Margin: {summary?.profit_margin || 0}%</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <span className="text-xs text-surface-500 font-medium block">Total Transactions</span>
                        <span className="text-2xl font-bold text-surface-900 block mt-1">
                            {summary?.total_orders?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
                        <span className="text-xs text-primary-700 font-medium block">Health Score</span>
                        <span className="text-2xl font-extrabold text-primary-800 block mt-1">
                            {summary?.health_score || '--'} / 100
                        </span>
                        <span className="text-[11px] text-primary-600 font-medium">{summary?.health_category}</span>
                    </div>
                </div>

                {/* Category Audit Table */}
                <div>
                    <h3 className="text-base font-bold text-surface-900 mb-3">1. Department & Category Distribution</h3>
                    <div className="overflow-x-auto border border-surface-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-surface-50 text-surface-500 font-semibold uppercase">
                                <tr>
                                    <th className="px-4 py-2.5">Category</th>
                                    <th className="px-4 py-2.5 text-right">Sales Volume</th>
                                    <th className="px-4 py-2.5 text-right">Profit Contribution</th>
                                    <th className="px-4 py-2.5 text-right">Margin %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {categories.map((c, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2.5 font-semibold text-surface-800">{c.category}</td>
                                        <td className="px-4 py-2.5 text-right font-medium">${c.sales?.toLocaleString()}</td>
                                        <td className={`px-4 py-2.5 text-right font-medium ${c.profit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                            ${c.profit?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-bold text-surface-900">{c.margin}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Regional Audit Table */}
                <div>
                    <h3 className="text-base font-bold text-surface-900 mb-3">2. Regional Market Dispersion</h3>
                    <div className="overflow-x-auto border border-surface-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-surface-50 text-surface-500 font-semibold uppercase">
                                <tr>
                                    <th className="px-4 py-2.5">Territory / Region</th>
                                    <th className="px-4 py-2.5 text-right">Sales Amount</th>
                                    <th className="px-4 py-2.5 text-right">Profit Earned</th>
                                    <th className="px-4 py-2.5 text-right">Orders Handled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {regions.map((r, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2.5 font-semibold text-surface-800">{r.region}</td>
                                        <td className="px-4 py-2.5 text-right font-medium">${r.sales?.toLocaleString()}</td>
                                        <td className={`px-4 py-2.5 text-right font-medium ${r.profit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                            ${r.profit?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-surface-700">{r.orders}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Strategic Rule-Based Recommendations */}
                <div>
                    <h3 className="text-base font-bold text-surface-900 mb-3">3. Executive Decision Recommendations</h3>
                    <div className="space-y-3">
                        {insights.map((ins, i) => (
                            <div key={i} className="p-4 rounded-xl border border-surface-200 bg-surface-50/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-200 text-surface-700">
                                        {ins.category}
                                    </span>
                                    <span className="text-xs font-bold text-surface-900">{ins.title}</span>
                                </div>
                                <p className="text-xs text-surface-600 mb-2">{ins.description}</p>
                                <div className="text-xs font-medium text-primary-900 bg-primary-50 p-2.5 rounded-lg border border-primary-100">
                                    <strong>Recommendation:</strong> {ins.recommendation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer sign-off */}
                <div className="pt-8 border-t border-surface-200 text-center text-xs text-surface-400">
                    <p>BIDSP — End of Business Intelligence Audit Report. Confidential.</p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
