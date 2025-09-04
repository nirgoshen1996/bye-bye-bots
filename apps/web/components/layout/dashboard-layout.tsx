'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex-1 flex flex-col overflow-hidden',
          className
        )}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Logo size="md" />
          <MobileNav />
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
