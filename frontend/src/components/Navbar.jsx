import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, Bell, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar, activeDatasetName }) => {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 glass-card border-b border-surface-200/50">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 lg:hidden focus:outline-none"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    {/* BIDSP Logo */}
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl shadow-md flex-shrink-0" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'}}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                            <rect x="2" y="14" width="3" height="6" rx="0.75" fill="white" opacity="0.85"/>
                            <rect x="7" y="10" width="3" height="10" rx="0.75" fill="white"/>
                            <rect x="12" y="6" width="3" height="14" rx="0.75" fill="white"/>
                            <rect x="17" y="11" width="3" height="9" rx="0.75" fill="white" opacity="0.75"/>
                            <path d="M3.5 13 L8.5 9 L13.5 5 L18.5 10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tight" style={{background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>BIDSP</span>
                        <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                            Analytics AI
                        </span>
                    </div>
                </div>

                {activeDatasetName && (
                    <div className="hidden md:flex items-center ml-4 pl-4 border-l border-surface-200 text-xs text-surface-500">
                        Active: <span className="ml-1 font-semibold text-surface-800 truncate max-w-xs">{activeDatasetName}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 text-xs text-surface-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Engine Active
                </div>

                <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
                    <Link
                        to="/profile"
                        className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="hidden md:inline-block text-sm font-medium text-surface-800">
                            {user?.name || 'User'}
                        </span>
                    </Link>

                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-2 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
