import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Database,
    Trash2,
    Eye,
    UploadCloud,
    FileSpreadsheet,
    Calendar,
    ArrowUpRight,
    AlertCircle,
    CheckCircle,
    Clock,
    X,
    Trash,
    ArchiveRestore
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { getDatasets, deleteDataset, getDatasetPreview } from '../services/datasetService';

const DatasetHistory = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [previewDataset, setPreviewDataset] = useState(null);
    const [previewRecords, setPreviewRecords] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);
    
    // Selection and Tabs
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'trash'

    const navigate = useNavigate();

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            const res = await getDatasets();
            setDatasets(res.data || []);
        } catch (err) {
            console.error('Failed to load datasets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const activeDatasets = datasets.filter(d => d.status !== 'trashed');
    const trashedDatasets = datasets.filter(d => d.status === 'trashed');
    const displayedDatasets = activeTab === 'active' ? activeDatasets : trashedDatasets;

    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === displayedDatasets.length && displayedDatasets.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedDatasets.map(d => d._id)));
        }
    };

    const handleSingleAction = async (id, name, action) => {
        const msg = action === 'trash' ? `Move "${name}" to trash?` :
                    action === 'restore' ? `Restore "${name}"?` :
                    `Permanently delete "${name}"? This cannot be undone.`;
                    
        if (!window.confirm(msg)) return;

        try {
            setDeletingId(id);
            await deleteDataset(id, action);
            await fetchDatasets();
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
        } catch (err) {
            alert(`Failed to ${action} dataset: ` + (err.response?.data?.message || err.message));
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.size === 0) return;
        
        const confirmMsg = action === 'trash' ? `Move ${selectedIds.size} dataset(s) to trash?` :
                           action === 'restore' ? `Restore ${selectedIds.size} dataset(s)?` :
                           `Permanently delete ${selectedIds.size} dataset(s)? This cannot be undone.`;
                           
        if (!window.confirm(confirmMsg)) return;

        try {
            setDeletingId('bulk');
            await Promise.all(Array.from(selectedIds).map(id => deleteDataset(id, action)));
            await fetchDatasets();
            setSelectedIds(new Set());
        } catch (err) {
            alert('Bulk action failed');
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenPreview = async (dataset) => {
        setPreviewDataset(dataset);
        setLoadingPreview(true);
        try {
            const res = await getDatasetPreview(dataset._id, 15);
            setPreviewRecords(res.data?.records || []);
        } catch (err) {
            alert('Failed to load preview');
        } finally {
            setLoadingPreview(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Dataset History</h1>
                    <p className="text-xs sm:text-sm text-surface-500">
                        View, inspect, and manage all your uploaded business data sources.
                    </p>
                </div>

                <Link to="/upload">
                    <Button variant="primary">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        <span>Upload Dataset</span>
                    </Button>
                </Link>
            </div>

            {datasets.length === 0 ? (
                <Card className="text-center py-16 px-4">
                    <Database className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-surface-800 mb-1">No datasets on record</h3>
                    <p className="text-sm text-surface-500 max-w-sm mx-auto mb-6">
                        Upload your business CSV or XLSX spreadsheets to populate this list and unlock dashboards.
                    </p>
                    <Link to="/upload">
                        <Button variant="primary">Upload First Dataset</Button>
                    </Link>
                </Card>
            ) : (
                <Card>
                    <div className="flex border-b border-surface-200">
                        <button 
                            onClick={() => { setActiveTab('active'); setSelectedIds(new Set()); }}
                            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'}`}
                        >
                            Active Datasets ({activeDatasets.length})
                        </button>
                        <button 
                            onClick={() => { setActiveTab('trash'); setSelectedIds(new Set()); }}
                            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'trash' ? 'border-red-600 text-red-600' : 'border-transparent text-surface-500 hover:text-surface-700'}`}
                        >
                            Trash ({trashedDatasets.length})
                        </button>
                    </div>

                    <div className="p-4">
                        {selectedIds.size > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <span className="text-indigo-800 font-semibold text-sm">{selectedIds.size} dataset(s) selected</span>
                                <div className="space-x-2 flex items-center">
                                    {activeTab === 'active' ? (
                                        <Button variant="secondary" size="sm" onClick={() => handleBulkAction('trash')} disabled={deletingId === 'bulk'} className="text-red-600 hover:bg-red-50 hover:border-red-200">
                                            <Trash2 className="w-4 h-4 mr-1.5" /> Move to Trash
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="secondary" size="sm" onClick={() => handleBulkAction('restore')} disabled={deletingId === 'bulk'} className="text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200">
                                                <ArchiveRestore className="w-4 h-4 mr-1.5" /> Restore
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleBulkAction('permanent')} disabled={deletingId === 'bulk'}>
                                                <Trash className="w-4 h-4 mr-1.5" /> Delete Forever
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto rounded-lg border border-surface-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3.5 w-12 text-center">
                                            <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === displayedDatasets.length} className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                                        </th>
                                        <th className="px-6 py-3.5">Dataset Name</th>
                                        <th className="px-6 py-3.5">Type</th>
                                        <th className="px-6 py-3.5">Rows Mapped</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Uploaded Date</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 bg-white">
                                    {displayedDatasets.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-surface-500">
                                                {activeTab === 'active' ? 'No active datasets found.' : 'Trash is empty.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedDatasets.map((ds) => (
                                            <tr key={ds._id} className={`hover:bg-surface-50/70 transition-colors ${selectedIds.has(ds._id) ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="px-4 py-4 text-center">
                                                    <input type="checkbox" checked={selectedIds.has(ds._id)} onChange={() => toggleSelect(ds._id)} className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-surface-900 flex items-center gap-2.5">
                                                    <FileSpreadsheet className="w-4 h-4 text-primary-600 shrink-0" />
                                                    <span className="truncate max-w-[200px] lg:max-w-xs">{ds.file_name}</span>
                                                </td>
                                                <td className="px-6 py-4 uppercase text-xs font-mono text-surface-600">
                                                    {ds.file_type}
                                                </td>
                                                <td className="px-6 py-4 text-surface-700 font-medium">
                                                    {ds.row_count ? ds.row_count.toLocaleString() : '--'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        ds.status === 'processed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        ds.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' :
                                                        ds.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        ds.status === 'trashed' ? 'bg-surface-100 text-surface-600 border border-surface-200' :
                                                        'bg-surface-100 text-surface-700'
                                                    }`}>
                                                        {ds.status === 'processed' && <CheckCircle className="w-3 h-3" />}
                                                        {ds.status === 'processing' && <Clock className="w-3 h-3" />}
                                                        {ds.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                                                        {ds.status === 'trashed' && <Trash2 className="w-3 h-3" />}
                                                        <span className="capitalize">{ds.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-surface-500">
                                                    {new Date(ds.uploaded_at).toLocaleDateString()} at {new Date(ds.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {activeTab === 'active' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenPreview(ds)}
                                                                className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-surface-100"
                                                                title="Preview records"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSingleAction(ds._id, ds.file_name, 'trash')}
                                                                disabled={deletingId === ds._id || deletingId === 'bulk'}
                                                                className="p-1.5 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                                title="Move to Trash"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleSingleAction(ds._id, ds.file_name, 'restore')}
                                                                disabled={deletingId === ds._id || deletingId === 'bulk'}
                                                                className="p-1.5 rounded-lg text-surface-500 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                                title="Restore Dataset"
                                                            >
                                                                <ArchiveRestore className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSingleAction(ds._id, ds.file_name, 'permanent')}
                                                                disabled={deletingId === ds._id || deletingId === 'bulk'}
                                                                className="p-1.5 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                                title="Delete Permanently"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            )}

            {/* Preview Modal */}
            {previewDataset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-surface-200">
                            <div>
                                <h3 className="text-lg font-bold text-surface-900">{previewDataset.file_name}</h3>
                                <p className="text-xs text-surface-500">Showing first {previewRecords.length} records</p>
                            </div>
                            <button
                                onClick={() => setPreviewDataset(null)}
                                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            {loadingPreview ? (
                                <div className="py-12 text-center"><Loader /></div>
                            ) : previewRecords.length === 0 ? (
                                <p className="text-center py-8 text-surface-500 text-sm">No records available to display.</p>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase">
                                        <tr>
                                            <th className="px-4 py-2.5">Order ID</th>
                                            <th className="px-4 py-2.5">Date</th>
                                            <th className="px-4 py-2.5">Category</th>
                                            <th className="px-4 py-2.5">Region</th>
                                            <th className="px-4 py-2.5 text-right">Sales</th>
                                            <th className="px-4 py-2.5 text-right">Profit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {previewRecords.map((r, i) => (
                                            <tr key={i} className="hover:bg-surface-50/50">
                                                <td className="px-4 py-2 font-medium text-surface-900">{r.order_id}</td>
                                                <td className="px-4 py-2 text-surface-600">{new Date(r.order_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 text-surface-700">{r.category}</td>
                                                <td className="px-4 py-2 text-surface-700">{r.region}</td>
                                                <td className="px-4 py-2 text-right font-medium">${r.sales?.toFixed(2)}</td>
                                                <td className={`px-4 py-2 text-right font-medium ${r.profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    ${r.profit?.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 bg-surface-50 border-t border-surface-200 flex justify-end">
                            <Button variant="secondary" onClick={() => setPreviewDataset(null)}>Close Preview</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatasetHistory;
