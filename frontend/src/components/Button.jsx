import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = 'primary', size = 'md', isLoading = false, className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";
    
    const variants = {
        primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-md hover:shadow-lg focus:ring-primary-500",
        secondary: "bg-white text-surface-800 border border-surface-200 hover:bg-surface-50 shadow-sm focus:ring-surface-200",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-md hover:shadow-lg focus:ring-red-500",
        ghost: "bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900"
    };
    
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
