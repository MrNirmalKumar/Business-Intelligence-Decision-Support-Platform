import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface-100">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight mb-2">404</h1>
                <h2 className="text-lg font-bold text-surface-800 mb-2">Page Not Found</h2>
                <p className="text-xs text-surface-500 mb-6">
                    The requested route does not exist or has been relocated within the BIDSP workspace.
                </p>
                <Link to="/">
                    <Button variant="primary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span>Return to Dashboard</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
