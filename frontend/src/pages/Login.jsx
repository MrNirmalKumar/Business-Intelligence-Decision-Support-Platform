import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, BarChart2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!email.trim() || !password) {
            setFormError('Please enter both email and password');
            return;
        }

        setLoading(true);
        const result = await login(email.trim(), password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setFormError(result.error || 'Invalid credentials');
        }
    };

    const fillDemoUser = () => {
        setEmail('demo@bidsp.com');
        setPassword('Password123');
        setFormError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-100 via-primary-50/20 to-surface-200">
            <div className="w-full max-w-md">
                {/* Brand header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/30 mb-4">
                        <BarChart2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Welcome to BIDSP</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Business Intelligence & Decision Support Platform
                    </p>
                </div>

                <Card isGlass={true} className="border-surface-200/80 shadow-xl">
                    <CardBody className="p-8">
                        <h2 className="text-xl font-bold text-surface-900 mb-6">Sign in to your account</h2>

                        {formError && (
                            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                                        Password
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={loading}
                                className="w-full mt-2"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-surface-200/60 flex flex-col gap-3 text-center">
                            <button
                                type="button"
                                onClick={fillDemoUser}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium py-1 px-2 rounded-md hover:bg-primary-50 transition-colors"
                            >
                                Fill with Demo Credentials (Quick Test)
                            </button>

                            <p className="text-xs text-surface-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-primary-600 hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </CardBody>
                </Card>

                <div className="text-center mt-6 text-xs text-surface-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>256-bit JWT Encrypted Session</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
