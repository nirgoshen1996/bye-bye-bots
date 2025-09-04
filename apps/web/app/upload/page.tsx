'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CSVPreview } from '@/components/csv-preview';
import { useCSV } from '@/contexts/csv-context';
import { parseCSVFile, ParseResult } from '@/lib/csv-parser';
import { CSVData } from '@/lib/validation';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DragDropUpload } from '@/components/upload/drag-drop-upload';
import { Stepper } from '@/components/ui/stepper';
import { useToast } from '@/components/providers/toast-provider';

const steps = [
  {
    id: 'upload',
    title: 'Upload File',
    description: 'Select your CSV file',
    icon: Upload
  },
  {
    id: 'preview',
    title: 'Preview Data',
    description: 'Review your data',
    icon: FileText
  },
  {
    id: 'map',
    title: 'Map Columns',
    description: 'Configure processing',
    icon: CheckCircle
  }
];

export default function UploadPage() {
  const router = useRouter();
  const { setCSVData } = useCSV();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { success, error: showError } = useToast();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showError('Invalid file type', 'Please select a CSV file (.csv extension required)');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setParseResult(null);

    try {
      const result = await parseCSVFile(file);
      setParseResult(result);
      
      if (result.success && result.data) {
        setCSVData(result.data);
        setCurrentStep(1);
        success('File uploaded successfully', `${file.name} is ready for processing`);
      } else {
        showError('Upload failed', result.error || 'Failed to parse CSV file');
      }
    } catch (error) {
      showError('Upload failed', 'An unexpected error occurred while processing the file');
      setParseResult({
        success: false,
        error: 'An unexpected error occurred while processing the file',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [setCSVData, success, showError]);

  const handleContinue = () => {
    if (parseResult?.success) {
      router.push('/map');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Upload CSV File</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your email list to detect and remove bot accounts. 
            Your data is processed securely and never stored permanently.
          </p>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Stepper steps={steps} currentStep={currentStep} />
        </motion.div>

        {/* Upload Section */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DragDropUpload
              onFileSelect={handleFileSelect}
              disabled={isProcessing}
            />
          </motion.div>
        )}

        {/* Preview Section */}
        {currentStep === 1 && parseResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {parseResult.success ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      File Uploaded Successfully
                    </CardTitle>
                    <CardDescription>
                      {selectedFile?.name} • {(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold text-foreground">
                          {parseResult.data?.headers.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Columns</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold text-foreground">
                          {parseResult.data?.rows.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Rows</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold text-accent">
                          {parseResult.data?.rows.filter(row => row.some(cell => cell && cell.toString().includes('@'))).length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">With Email</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold text-primary">
                          {parseResult.data?.rows.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>
                      First 10 rows of your uploaded data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CSVPreview 
                      headers={parseResult.data?.headers || []} 
                      rows={parseResult.data?.rows.slice(0, 10) || []} 
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleContinue} size="lg">
                    Continue to Mapping
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Upload Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {parseResult.error}
                    </AlertDescription>
                  </Alert>
                  <div className="mt-4">
                    <Button variant="outline" onClick={handleBack}>
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center py-12"
          >
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Processing File</h3>
                <p className="text-muted-foreground">
                  Analyzing your CSV file structure...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}