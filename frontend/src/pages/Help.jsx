import React from 'react';
import { HelpCircle, Layers, Cpu, Database, CheckCircle2, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Card';

const Help = () => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Help & Documentation</h1>
                <p className="text-xs sm:text-sm text-surface-500">
                    Understanding platform architecture, scoring formulas, and data requirements.
                </p>
            </div>

            {/* Architecture Overview */}
            <Card>
                <CardHeader title="1. Architecture & Technology Stack" subtitle="How data flows through BIDSP" />
                <CardBody className="space-y-4 text-xs text-surface-600 leading-relaxed">
                    <p>
                        The Business Intelligence & Decision Support Platform (BIDSP) provides unified ingestion, real-time KPI synthesis, and automated rule-based decision intelligence.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200">
                            <span className="font-bold text-surface-900 block mb-1">Frontend Layer</span>
                            <p className="text-surface-500 text-[11px]">
                                React.js + Tailwind CSS + Recharts interactive visualizations, client-side validation, and session management.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200">
                            <span className="font-bold text-surface-900 block mb-1">Backend Server</span>
                            <p className="text-surface-500 text-[11px]">
                                Node.js & Express.js REST API with Rate Limiting, Compression, Zod validation, and JWT security.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200">
                            <span className="font-bold text-surface-900 block mb-1">Database Store</span>
                            <p className="text-surface-500 text-[11px]">
                                MongoDB cluster with Mongoose schemas storing user profiles, datasets, aggregated records, and insight logs.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Health Score Calculation */}
            <Card>
                <CardHeader title="2. Business Health Score Formula" subtitle="Mathematical breakdown of composite grading" />
                <CardBody className="space-y-3 text-xs text-surface-600 leading-relaxed">
                    <p>
                        The Business Health Score is a normalized 0–100 composite index calculated through four weighted pillars:
                    </p>
                    <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 font-mono text-[11px] text-primary-900">
                        Health Score = (0.30 × Sales_Score) + (0.30 × Profit_Score) + (0.20 × Order_Score) + (0.20 × Regional_Score)
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 pt-1 text-surface-600">
                        <li><strong>Sales Score (30%):</strong> Evaluates aggregate gross turnover relative to scale benchmarks.</li>
                        <li><strong>Profitability Score (30%):</strong> Assesses operating margin ratios (healthy target: &gt; 15%).</li>
                        <li><strong>Order Score (20%):</strong> Analyzes transaction volume density and Average Order Value (AOV).</li>
                        <li><strong>Regional Score (20%):</strong> Measures geographic diversification to mitigate single-market risk.</li>
                    </ul>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                        <div className="p-2 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            80 - 100: Excellent
                        </div>
                        <div className="p-2 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                            60 - 79: Good
                        </div>
                        <div className="p-2 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                            40 - 59: Average
                        </div>
                        <div className="p-2 rounded bg-red-50 text-red-800 font-semibold border border-red-200">
                            &lt; 40: Needs Attention
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Supported Dataset Format */}
            <Card>
                <CardHeader title="3. Supported Dataset Columns" subtitle="Recommended CSV or Excel headers" />
                <CardBody className="text-xs text-surface-600 space-y-3">
                    <p>
                        BIDSP includes a smart header normalizer that maps common column aliases automatically. Standard recognized columns include:
                    </p>
                    <div className="overflow-x-auto border border-surface-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-surface-50 text-surface-500 font-semibold uppercase">
                                <tr>
                                    <th className="px-4 py-2.5">Field</th>
                                    <th className="px-4 py-2.5">Accepted Column Names</th>
                                    <th className="px-4 py-2.5">Data Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                <tr>
                                    <td className="px-4 py-2 font-semibold text-surface-800">Order ID</td>
                                    <td className="px-4 py-2 text-surface-600">order_id, Order ID, Invoice, ID</td>
                                    <td className="px-4 py-2 text-surface-500">String</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold text-surface-800">Order Date</td>
                                    <td className="px-4 py-2 text-surface-600">order_date, Order Date, Date</td>
                                    <td className="px-4 py-2 text-surface-500">YYYY-MM-DD Date</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold text-surface-800">Category</td>
                                    <td className="px-4 py-2 text-surface-600">category, Category, Department</td>
                                    <td className="px-4 py-2 text-surface-500">String</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold text-surface-800">Region</td>
                                    <td className="px-4 py-2 text-surface-600">region, Region, State, Country</td>
                                    <td className="px-4 py-2 text-surface-500">String</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold text-surface-800">Sales</td>
                                    <td className="px-4 py-2 text-surface-600">sales, Sales, Revenue, Amount</td>
                                    <td className="px-4 py-2 text-surface-500">Numeric</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold text-surface-800">Profit</td>
                                    <td className="px-4 py-2 text-surface-600">profit, Profit, Net Profit</td>
                                    <td className="px-4 py-2 text-surface-500">Numeric</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Help;
