import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UploadCloud,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    ArrowRight,
    Loader2,
    FileText
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { uploadDatasetFile, getDatasetPreview } from '../services/datasetService';

const UploadDataset = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [uploadResult, setUploadResult] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const navigate = useNavigate();

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];

    const validateAndSetFile = (selectedFile) => {
        setError('');
        if (!selectedFile) return;

        const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            setError('Invalid file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.');
            return;
        }

        if (selectedFile.size > 100 * 1024 * 1024) {
            setError('File size exceeds the 100 MB limit.');
            return;
        }

        if (selectedFile.size === 0) {
            setError('The selected file is empty.');
            return;
        }

        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setError('');

        try {
            const res = await uploadDatasetFile(file, (percent) => {
                setProgress(percent);
            });

            setUploadResult(res.data);

            // Fetch preview table
            if (res.data?.dataset?._id) {
                setLoadingPreview(true);
                try {
                    const prevRes = await getDatasetPreview(res.data.dataset._id, 10);
                    setPreviewData(prevRes.data);
                } catch (prevErr) {
                    console.error('Failed to load preview:', prevErr);
                } finally {
                    setLoadingPreview(false);
                }
            }
            // Auto navigate to dashboard after successful upload to ensure Data Flow Lock
            setTimeout(() => {
                navigate('/');
            }, 3500);

        } catch (err) {
            console.error('Upload failed:', err);
            const msg = err.response?.data?.message || err.message || 'File upload failed';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleCSV = () => {
        const csvContent = `order_id,order_date,category,region,ship_mode,sales,quantity,discount,profit
CA-2024-152156,2024-11-08,Furniture,South,Second Class,261.96,2,0.00,41.91
CA-2024-138688,2024-06-12,Office Supplies,West,Second Class,14.62,2,0.00,6.87
US-2024-108966,2024-10-11,Furniture,South,Standard Class,957.57,5,0.45,-383.03
CA-2024-115812,2024-06-09,Technology,West,Standard Class,907.15,6,0.20,90.71
CA-2024-161389,2024-12-05,Technology,East,Standard Class,407.97,3,0.00,132.59
US-2024-118983,2024-11-22,Office Supplies,Central,Standard Class,68.81,5,0.80,-123.85
CA-2024-106320,2024-09-25,Furniture,West,Standard Class,1044.63,3,0.00,240.26
CA-2024-117590,2024-12-08,Technology,Central,Standard Class,899.91,3,0.00,386.96
CA-2024-117415,2024-12-27,Office Supplies,East,Standard Class,532.39,3,0.20,106.47
CA-2024-169194,2024-06-20,Technology,East,Standard Class,1144.00,5,0.00,331.76`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sample_superstore.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Upload Dataset</h1>
                <p className="text-xs sm:text-sm text-surface-500">
                    Import your business transaction records (.csv, .xlsx) for instant KPI generation & health audits.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Upload Zone Card */}
            <Card>
                <CardBody className="p-6 md:p-8">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 relative overflow-hidden ${
                            isDragging
                                ? 'border-primary-500 bg-primary-50/80 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] scale-[1.02]'
                                : 'border-surface-200 hover:border-primary-400 bg-white hover:shadow-lg'
                        }`}
                    >
                        {isDragging && <div className="absolute inset-0 bg-primary-500/5 animate-pulse"></div>}
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-surface-200 text-primary-600 flex items-center justify-center mx-auto mb-4">
                            <UploadCloud className="w-7 h-7" />
                        </div>

                        <h3 className="text-base font-semibold text-surface-900 mb-1">
                            Choose a dataset file or drag & drop here
                        </h3>
                        <p className="text-xs text-surface-500 max-w-md mx-auto mb-5">
                            Supported formats: CSV, XLSX, XLS. Max file size: 100 MB.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <label className="cursor-pointer">
                                <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 shadow-sm transition-all">
                                    Browse Files
                                </span>
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={downloadSampleCSV}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-surface-700 bg-white border border-surface-200 hover:bg-surface-50 shadow-2xs transition-colors"
                            >
                                <Download className="w-3.5 h-3.5 text-primary-600" />
                                <span>Download Sample CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Selected File Details */}
                    {file && (
                        <div className="mt-6 p-4 rounded-xl bg-surface-50 border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-primary-100 text-primary-700">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-surface-900 truncate max-w-xs">{file.name}</h4>
                                    <p className="text-xs text-surface-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleUpload}
                                isLoading={uploading}
                            >
                                <span>Process & Analyze</span>
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="mt-6 space-y-2.5 p-4 rounded-xl bg-surface-50 border border-surface-200">
                            <div className="flex justify-between items-center text-xs font-semibold text-surface-700">
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                                    {progress < 100
                                        ? 'Uploading dataset to server...'
                                        : 'Processing ETL, DAX health score & analytics...'}
                                </span>
                                <span className="text-primary-700 font-bold">{progress}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-surface-200 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        progress === 100 ? 'bg-gradient-to-r from-primary-600 via-indigo-500 to-emerald-500 animate-pulse' : 'bg-primary-600'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            {progress === 100 && (
                                <p className="text-[11px] text-surface-500 animate-pulse">
                                    Running automated deduplication, normalization, and KPI calculations...
                                </p>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Upload Success Summary */}
            {uploadResult && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card className="border-emerald-200 bg-emerald-50/30">
                        <CardBody className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-surface-900">
                                        Dataset Uploaded Successfully!
                                    </h3>
                                    <p className="text-xs text-surface-600">
                                        {uploadResult.summary ? (
                                            `${uploadResult.summary.recordsCount || uploadResult.dataset?.row_count} transactions parsed and evaluated.`
                                        ) : (
                                            'The AI engine is currently analyzing your dataset in the background. It will be available in the dashboard shortly.'
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate('/')}
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Preview Table */}
                    {previewData && (
                        <Card>
                            <CardHeader
                                title="Data Sample Preview (First 10 Rows)"
                                subtitle={`Records parsed from ${previewData.file_name}`}
                            />
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Region</th>
                                            <th className="px-4 py-3 text-right">Sales</th>
                                            <th className="px-4 py-3 text-right">Profit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {previewData.records.map((r, i) => (
                                            <tr key={i} className="hover:bg-surface-50/60">
                                                <td className="px-4 py-2.5 font-medium text-surface-900">{r.order_id}</td>
                                                <td className="px-4 py-2.5 text-surface-600">
                                                    {new Date(r.order_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-surface-700">{r.category}</td>
                                                <td className="px-4 py-2.5 text-surface-700">{r.region}</td>
                                                <td className="px-4 py-2.5 text-right font-medium text-surface-900">
                                                    ${r.sales?.toFixed(2)}
                                                </td>
                                                <td className={`px-4 py-2.5 text-right font-medium ${
                                                    r.profit < 0 ? 'text-red-600' : 'text-emerald-600'
                                                }`}>
                                                    ${r.profit?.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadDataset;
