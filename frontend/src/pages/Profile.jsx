import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, Database, Key, LogOut } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { getDatasets } from '../services/datasetService';

const Profile = () => {
    const { user, logout } = useAuth();
    const [datasetCount, setDatasetCount] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await getDatasets();
                setDatasetCount(res.data?.length || 0);
            } catch (err) {
                console.error(err);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">User Profile & Account</h1>
                <p className="text-xs sm:text-sm text-surface-500">
                    Manage your identity, view role privileges, and inspect platform activity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 text-center p-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl shadow-inner mb-4">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <h3 className="text-lg font-bold text-surface-900">{user?.name || 'Authorized Member'}</h3>
                    <p className="text-xs text-surface-500 mb-4">{user?.email}</p>

                    <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 mb-6">
                        Enterprise Analyst
                    </span>

                    <Button variant="danger" size="sm" onClick={logout} className="w-full mt-auto">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Sign Out</span>
                    </Button>
                </Card>

                {/* Details & Security */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader title="Account Details" subtitle="Registered credentials & identity" />
                        <CardBody className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-surface-100">
                                <span className="text-xs text-surface-500 flex items-center gap-2">
                                    <User className="w-4 h-4 text-surface-400" /> Full Name
                                </span>
                                <span className="text-sm font-semibold text-surface-900">{user?.name}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-surface-100">
                                <span className="text-xs text-surface-500 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-surface-400" /> Email Address
                                </span>
                                <span className="text-sm font-semibold text-surface-900">{user?.email}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-surface-100">
                                <span className="text-xs text-surface-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-surface-400" /> Member Since
                                </span>
                                <span className="text-sm font-semibold text-surface-900">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-surface-500 flex items-center gap-2">
                                    <Database className="w-4 h-4 text-surface-400" /> Connected Datasets
                                </span>
                                <span className="text-sm font-bold text-primary-600">{datasetCount} Sources</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Security & Authentication" subtitle="Session tokens & cryptographic standards" />
                        <CardBody className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-900">JWT Token Session Active</h4>
                                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                                        Your session is signed with HMAC SHA-256 and authenticated with every API transaction via Bearer headers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-50 border border-surface-200">
                                <Key className="w-5 h-5 text-surface-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-surface-900">Bcrypt Password Hashing (Cost 12)</h4>
                                    <p className="text-[11px] text-surface-500 leading-relaxed mt-0.5">
                                        Credentials are salted and hashed on the MongoDB cluster. Plaintext passwords are never stored.
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
