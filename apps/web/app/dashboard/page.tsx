'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  BarChart3, 
  Download, 
  MoreVertical, 
  Trash2, 
  FileText, 
  Bot, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Upload,
  Plus,
  TrendingUp
} from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';
import { PieChartComponent } from '@/components/charts/pie-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/providers/toast-provider';

interface RunRecord {
  id: string;
  created_at: string;
  filename: string;
  options: {
    enableMxCheck: boolean;
    treatInvalidAsBots: boolean;
  };
  counts: {
    total_rows: number;
    rows_with_email: number;
    rows_without_email: number;
    bots_count: number;
    clean_count: number;
    valid_emails?: number;
    invalid_syntax?: number;
    no_mx?: number;
    unknown?: number;
  };
  zip_url: string;
  credits_used: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseClient();
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/runs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load runs');
      }

      const data = await response.json();
      setRuns(data);
    } catch (err) {
      setError('Failed to load processing history');
      showError('Failed to load runs', 'Please try again later');
      console.error('Error loading runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/runs/${runId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete run');
      }

      setRuns(prev => prev.filter(run => run.id !== runId));
      success('Run deleted', 'Processing record removed successfully');
    } catch (err) {
      showError('Delete failed', 'Please try again');
      console.error('Error deleting run:', err);
    }
  };

  const handleDownload = async (runId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/download/${runId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
      success('Download started', 'Your files are being prepared');
    } catch (err) {
      showError('Download failed', 'Please try again');
      console.error('Error downloading:', err);
    }
  };

  // Calculate stats
  const stats = {
    totalEmails: runs.reduce((sum, run) => sum + run.counts.total_rows, 0),
    botsDetected: runs.reduce((sum, run) => sum + run.counts.bots_count, 0),
    validEmails: runs.reduce((sum, run) => sum + run.counts.clean_count, 0),
    creditsRemaining: 1000, // This would come from billing info
    creditsUsed: runs.reduce((sum, run) => sum + run.credits_used, 0),
    creditsLimit: 1000
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto pt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Error Loading Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadRuns} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Your bot detection processing overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/upload')} size="lg">
                <Upload className="h-4 w-4 mr-2" />
                New Upload
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Charts Section */}
          {runs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Bot Detection Results
                  </CardTitle>
                  <CardDescription>
                    Distribution of bots vs clean emails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChartComponent data={[
                    { name: 'Clean Emails', value: stats.validEmails, color: '#10b981' },
                    { name: 'Bots Detected', value: stats.botsDetected, color: '#ef4444' }
                  ]} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Processing History
                  </CardTitle>
                  <CardDescription>
                    Recent processing activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent data={runs.slice(0, 5).map(run => ({
                    name: run.filename,
                    value: run.counts.total_rows,
                    bots: run.counts.bots_count,
                    clean: run.counts.clean_count
                  }))} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Runs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Recent Processing</h2>
              {runs.length > 0 && (
                <Button variant="outline" onClick={loadRuns}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>

            {runs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No processing history yet"
                description="Start by uploading your first CSV file to see your processing history and analytics here."
                action={{
                  label: 'Upload First File',
                  onClick: () => router.push('/upload')
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {runs.map((run, index) => (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-soft-lg transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                              {run.filename}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(run.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleDownload(run.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Results
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRun(run.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted/50 rounded-xl">
                            <div className="text-2xl font-bold text-foreground">
                              {run.counts.total_rows.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Emails</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-xl">
                            <div className="text-2xl font-bold text-accent">
                              {run.counts.clean_count.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Clean</div>
                          </div>
                        </div>

                        {/* Bot Detection */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium">Bots Detected</span>
                          </div>
                          <Badge variant="destructive">
                            {run.counts.bots_count.toLocaleString()}
                          </Badge>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">MX Check</span>
                            <Badge variant={run.options.enableMxCheck ? "default" : "secondary"}>
                              {run.options.enableMxCheck ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Credits Used</span>
                            <span className="font-medium">{run.credits_used.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}