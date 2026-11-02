import React from 'react';

const Loader = ({ fullScreen = false }) => {
    const containerClasses = fullScreen 
        ? "fixed inset-0 z-50 flex items-center justify-center bg-surface-100/80 backdrop-blur-sm"
        : "flex items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <div className="relative flex justify-center items-center">
                <div className="absolute animate-ping w-12 h-12 rounded-full bg-primary-100 opacity-75"></div>
                <div className="relative w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
            </div>
        </div>
    );
};

export default Loader;
