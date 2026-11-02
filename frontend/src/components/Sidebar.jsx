import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    UploadCloud,
    Database,
    Lightbulb,
    FileText,
    UserCheck,
    HelpCircle,
    Box,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Upload Dataset', path: '/upload', icon: UploadCloud },
        { name: 'Dataset History', path: '/datasets', icon: Database },
        { name: 'Insights & Rules', path: '/insights', icon: Lightbulb },
        { name: 'Executive Reports', path: '/reports', icon: FileText },
        { name: '3D Visualize', path: '/visualize', icon: Box },
        { name: 'User Profile', path: '/profile', icon: UserCheck },
        { name: 'Help & Docs', path: '/help', icon: HelpCircle },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-surface-900/40 backdrop-blur-xs lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-card border-r border-surface-200/50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header in sidebar */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'linear-gradient(135deg,#4f46e5,#06b6d4)'}}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                                <rect x="2" y="14" width="3" height="6" rx="0.75" fill="white" opacity="0.85"/>
                                <rect x="7" y="10" width="3" height="10" rx="0.75" fill="white"/>
                                <rect x="12" y="6" width="3" height="14" rx="0.75" fill="white"/>
                                <rect x="17" y="11" width="3" height="9" rx="0.75" fill="white" opacity="0.75"/>
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <span className="font-black text-sm block" style={{background:'linear-gradient(135deg,#4f46e5,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BIDSP</span>
                            <span className="text-[10px] text-surface-400 font-mono">Analytics AI · v2.0</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 lg:hidden">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? item.path === '/visualize'
                                                ? 'text-white shadow-sm'
                                                : 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                                            : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                                    }`
                                }
                                style={({ isActive }) => isActive && item.path === '/visualize'
                                    ? { background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', boxShadow: '0 2px 12px rgba(79,70,229,0.4)' }
                                    : {}}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer card in sidebar */}
                <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 text-center">
                    <span className="text-xs font-semibold text-primary-900 flex items-center justify-center gap-1.5 mb-1" title="AI Rule Engine Running">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Health Engine Active
                    </span>
                    <p className="text-[11px] text-primary-700 leading-relaxed mb-3">
                        AI continuously analyzes your business data and flags critical risks in real-time.
                    </p>
                    <NavLink
                        to="/insights"
                        onClick={onClose}
                        className="inline-block text-xs font-medium text-primary-600 bg-white hover:bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 shadow-2xs"
                    >
                        View Health Score
                    </NavLink>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
