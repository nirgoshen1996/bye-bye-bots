'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, AlertCircle, RefreshCw, FileText, Bot, Users, BarChart3 } from 'lucide-react';
import { useCSV } from '@/contexts/csv-context';
import { createSupabaseClient } from '@/lib/supabase';

interface ProcessingSummary {
  total_rows: number;
  rows_with_email: number;
  rows_without_email: number;
  bots_count: number;
  clean_count: number;
  timestamp: string;
}

interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  summary?: ProcessingSummary;
  zipBlob?: Blob;
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { csvData, clearCSVData } = useCSV();
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  });

  // Check if we have the required data to process
  useEffect(() => {
    if (!csvData?.file || !csvData?.headers) {
      router.push('/upload');
      return;
    }

    // Check if we have mapping data from the map page
    const mapping = searchParams.get('mapping');
    if (!mapping) {
      router.push('/map');
      return;
    }

    // Get advanced options (optional)
    const options = searchParams.get('options');

    // Start processing automatically
    startProcessing(mapping, options);
  }, [csvData, searchParams, router]);

  const startProcessing = async (mappingParam: string, optionsParam?: string | null) => {
    try {
      setProcessingState({
        status: 'uploading',
        progress: 10
      });

      // Parse mapping
      let mapping;
      try {
        mapping = JSON.parse(mappingParam);
      } catch (e) {
        throw new Error('Invalid mapping configuration');
      }

      // Parse advanced options (optional)
      let advancedOptions = {
        enableMxCheck: true,
        treatInvalidAsBots: true
      };
      
      if (optionsParam) {
        try {
          advancedOptions = JSON.parse(optionsParam);
        } catch (e) {
          console.warn('Invalid options configuration, using defaults');
        }
      }

      // Validate required fields
      if (!mapping.email) {
        throw new Error('Email column mapping is required');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', csvData!.file);
      formData.append('mapping', JSON.stringify(mapping));

      // Build query parameters for advanced options
      const queryParams = new URLSearchParams();
      queryParams.append('enable_syntax_check', 'true');
      queryParams.append('enable_mx_check', advancedOptions.enableMxCheck.toString());
      queryParams.append('treat_invalid_as_bots', advancedOptions.treatInvalidAsBots.toString());
      queryParams.append('mx_check_timeout', '5.0');
      queryParams.append('bot_threshold', '1.0');

      setProcessingState(prev => ({
        ...prev,
        status: 'processing',
        progress: 30
      }));

      // Get auth token
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Make API request with authentication
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
      const response = await fetch(`${serverUrl}/process?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
      }

      setProcessingState(prev => ({
        ...prev,
        progress: 80
      }));

      // Get the JSON response
      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Processing failed');
      }

      // Download the ZIP file
      const zipResponse = await fetch(result.zip_url);
      const zipBlob = await zipResponse.blob();

      setProcessingState(prev => ({
        ...prev,
        status: 'success',
        progress: 100,
        summary: result.summary,
        zipBlob
      }));

      // Save run data (already saved by server)
      await saveRunToHistory(result.summary, advancedOptions, zipBlob);

    } catch (error) {
      console.error('Processing error:', error);
      setProcessingState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const extractSummaryFromZip = async (zipBlob: Blob): Promise<ProcessingSummary> => {
    try {
      // Use JSZip to extract the summary.json file
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipBlob);
      
      const summaryFile = zipContent.file('summary.json');
      if (!summaryFile) {
        throw new Error('Summary file not found in ZIP');
      }

      const summaryText = await summaryFile.async('string');
      return JSON.parse(summaryText);
    } catch (error) {
      console.error('Error extracting summary:', error);
      // Return a fallback summary
      return {
        total_rows: csvData?.rows?.length || 0,
        rows_with_email: 0,
        rows_without_email: 0,
        bots_count: 0,
        clean_count: 0,
        timestamp: new Date().toISOString()
      };
    }
  };

  const downloadFile = async (filename: string, content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const downloadFromZip = async (filename: string) => {
    if (!processingState.zipBlob) {
      alert('No ZIP file available for download');
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(processingState.zipBlob);
      
      const file = zipContent.file(filename);
      if (!file) {
        alert(`File ${filename} not found in ZIP`);
        return;
      }

      const content = await file.async('string');
      downloadFile(filename, content);
    } catch (error) {
      console.error('Error extracting file from ZIP:', error);
      alert('Failed to extract file from ZIP. Please try again.');
    }
  };

  const saveRunToHistory = async (
    summary: ProcessingSummary, 
    advancedOptions: { enableMxCheck: boolean; treatInvalidAsBots: boolean },
    zipBlob: Blob
  ) => {
    try {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No session found, skipping save to history');
        return;
      }

      // The run is already saved to Supabase by the server
      // We just need to refresh the dashboard if needed
      console.log('Run saved to Supabase successfully');
    } catch (error) {
      console.error('Error saving run to history:', error);
      // Don't throw - this shouldn't break the main flow
    }
  };

  const handleTryAgain = () => {
    clearCSVData();
    router.push('/upload');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (processingState.status === 'idle') {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Preparing to process...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (processingState.status === 'uploading' || processingState.status === 'processing') {
    return (
      <Container>
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {processingState.status === 'uploading' ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Uploading CSV File
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Processing Data
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {processingState.status === 'uploading' 
                  ? 'Uploading your CSV file to our servers...'
                  : 'Analyzing your data and detecting bots...'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{processingState.progress}%</span>
                </div>
                <Progress value={processingState.progress} className="h-2" />
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                {processingState.status === 'uploading' && (
                  <p>This may take a few moments depending on file size...</p>
                )}
                {processingState.status === 'processing' && (
                  <p>Running bot detection algorithms...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (processingState.status === 'error') {
    return (
      <Container>
        <div className="max-w-2xl mx-auto pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">Processing Failed</p>
                <p className="text-sm">{processingState.error}</p>
                <Button onClick={handleTryAgain} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  if (processingState.status === 'success' && processingState.summary) {
    const { summary } = processingState;
    
    return (
      <Container>
        <div className="max-w-4xl mx-auto pt-8 space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
              <h1 className="text-3xl font-bold">Processing Complete!</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Your CSV has been successfully processed and analyzed for bot detection.
            </p>
            <p className="text-sm text-muted-foreground">
              Completed at {formatTimestamp(summary.timestamp)}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Rows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.total_rows)}</div>
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  With Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.rows_with_email)}</div>
                <Users className="h-4 w-4 text-muted-foreground mt-1" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bots Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(summary.bots_count)}
                </div>
                <Bot className="h-4 w-4 text-red-600 mt-1" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Clean Rows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(summary.clean_count)}
                </div>
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Summary</CardTitle>
              <CardDescription>
                Detailed breakdown of your data processing results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Rows without email:</span>
                  <Badge variant="secondary">{formatNumber(summary.rows_without_email)}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Bot detection rate:</span>
                  <Badge variant="outline">
                    {summary.rows_with_email > 0 
                      ? `${((summary.bots_count / summary.rows_with_email) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Clean data rate:</span>
                  <Badge variant="outline">
                    {summary.total_rows > 0 
                      ? `${((summary.clean_count / summary.total_rows) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle>Download Results</CardTitle>
              <CardDescription>
                Download your processed data in different formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => downloadFromZip('clean.csv')}
                  className="h-auto p-4 flex-col gap-2"
                  variant="outline"
                >
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Download Clean</div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(summary.clean_count)} rows
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => downloadFromZip('bots.csv')}
                  className="h-auto p-4 flex-col gap-2"
                  variant="outline"
                >
                  <Bot className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Download Bots</div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(summary.bots_count)} rows
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => downloadFromZip('annotated.csv')}
                  className="h-auto p-4 flex-col gap-2"
                  variant="outline"
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Download Annotated</div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(summary.total_rows)} rows
                    </div>
                  </div>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>All files include UTF-8 BOM encoding for Excel compatibility</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleTryAgain} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Another File
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
            <Button onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return null;
}
