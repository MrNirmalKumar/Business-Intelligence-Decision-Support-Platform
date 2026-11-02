import React from 'react';

const Card = ({ children, className = '', isGlass = false }) => {
    const glassClasses = isGlass ? 'glass' : 'bg-white shadow-sm border border-surface-200';
    
    return (
        <div className={`rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${glassClasses} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
    <div className={`px-6 py-5 border-b border-surface-100 flex justify-between items-center ${className}`}>
        <div>
            <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
            {subtitle && <p className="text-sm text-surface-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export default Card;
