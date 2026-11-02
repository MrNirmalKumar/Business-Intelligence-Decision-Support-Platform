import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeDatasetName, setActiveDatasetName] = useState(null);

    return (
        <div className="min-h-screen bg-surface-100 flex flex-col">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-64 flex flex-col flex-1">
                <Navbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    activeDatasetName={activeDatasetName}
                />

                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
                    <Outlet context={{ setActiveDatasetName }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
