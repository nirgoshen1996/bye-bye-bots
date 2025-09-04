'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Upload, 
  CreditCard, 
  Settings, 
  FileText,
  Menu,
  X,
  History
} from 'lucide-react';
import { CreditDisplay } from '@/components/billing/credit-display';
import { Logo } from '@/components/ui/logo';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Upload',
    href: '/upload',
    icon: Upload,
    description: 'Process new CSV files'
  },
  {
    name: 'History',
    href: '/dashboard',
    icon: History,
    description: 'View processing history'
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    description: 'Manage subscription'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account preferences'
  }
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden h-8 w-8 p-0"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                                  <Logo size="md" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-soft'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className={cn(
                            'h-5 w-5 flex-shrink-0',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">
                                {item.name}
                              </span>
                              {item.name === 'Upload' && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs opacity-70 truncate">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Credit Display */}
                <div className="p-4 border-t border-border">
                  <CreditDisplay />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
