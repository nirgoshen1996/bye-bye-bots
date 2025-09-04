'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function DragDropUpload({
  onFileSelect,
  acceptedTypes = ['.csv'],
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: DragDropUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragActive(false);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        error('File too large', 'Please select a file smaller than 10MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        error('Invalid file type', 'Please select a CSV file');
      } else {
        error('Upload failed', 'Please try again with a valid CSV file');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      success('File selected', `${file.name} is ready for processing`);
    }
  }, [error, success]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize,
    multiple: false,
    disabled
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
    success('File selected', `${file.name} is ready for processing`);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      await onFileSelect(selectedFile);
    } catch (err) {
      error('Processing failed', 'Please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={cn(
              'relative p-8 text-center transition-all duration-200 cursor-pointer',
              'border-2 border-dashed rounded-2xl',
              isDragActive && !isDragReject && 'border-primary bg-primary/5',
              isDragReject && 'border-destructive bg-destructive/5',
              !isDragActive && !selectedFile && 'border-muted-foreground/25 hover:border-primary/50',
              selectedFile && 'border-accent bg-accent/5',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            <AnimatePresence mode="wait">
              {!selectedFile ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <motion.div
                    animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center"
                  >
                    <Upload className="w-8 h-8 text-primary" />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                    </h3>
                    <p className="text-muted-foreground">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </div>
                  
                  <Button variant="outline" disabled={disabled}>
                    Choose File
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      variant="outline"
                    >
                      Remove
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessFile();
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Process File'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      
      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 bg-muted/50 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="p-1 bg-info/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-info" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Privacy & Security</p>
            <p className="text-muted-foreground">
              Your files are processed securely and never stored permanently. 
              All data is encrypted in transit and deleted after processing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
