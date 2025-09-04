'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Clock,
  Settings,
  Zap,
  Shield
} from 'lucide-react';
import { useCSV } from '@/contexts/csv-context';
import { ColumnMappingSelect } from '@/components/column-mapping-select';
import { ColumnPreview } from '@/components/column-preview';
import { detectColumnMappings, validateColumnMapping, MappedColumns } from '@/lib/column-mapping';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Stepper } from '@/components/ui/stepper';
import { useToast } from '@/components/providers/toast-provider';

interface AdvancedOptions {
  enableMxCheck: boolean;
  treatInvalidAsBots: boolean;
}

const steps = [
  {
    id: 'upload',
    title: 'Upload File',
    description: 'Select your CSV file',
    icon: CheckCircle
  },
  {
    id: 'preview',
    title: 'Preview Data',
    description: 'Review your data',
    icon: CheckCircle
  },
  {
    id: 'map',
    title: 'Map Columns',
    description: 'Configure processing',
    icon: CheckCircle
  }
];

export default function MapPage() {
  const router = useRouter();
  const { csvData } = useCSV();
  const [mappedColumns, setMappedColumns] = useState<MappedColumns>({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isValid, setIsValid] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    enableMxCheck: true,
    treatInvalidAsBots: true
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { success, error: showError } = useToast();

  // Redirect if no CSV data
  useEffect(() => {
    if (!csvData?.file || !csvData?.headers) {
      router.push('/upload');
      return;
    }

    // Auto-detect column mappings
    const detectedMappings = detectColumnMappings(csvData.headers);
    setMappedColumns(detectedMappings);
  }, [csvData, router]);

  // Validate mapping whenever it changes
  useEffect(() => {
    const validation = validateColumnMapping(mappedColumns, csvData?.headers || []);
    setIsValid(validation.isValid);
  }, [mappedColumns, csvData?.headers]);

  const handleColumnChange = (columnType: keyof MappedColumns, value: string) => {
    setMappedColumns(prev => ({
      ...prev,
      [columnType]: value
    }));
  };

  const handleAdvancedOptionChange = (option: keyof AdvancedOptions, value: boolean) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleContinue = () => {
    if (!isValid) {
      showError('Invalid mapping', 'Please select an email column to continue');
      return;
    }

    // Build URL with parameters
    const params = new URLSearchParams();
    params.set('email', mappedColumns.email);
    if (mappedColumns.firstName) params.set('firstName', mappedColumns.firstName);
    if (mappedColumns.lastName) params.set('lastName', mappedColumns.lastName);
    params.set('enableMxCheck', advancedOptions.enableMxCheck.toString());
    params.set('treatInvalidAsBots', advancedOptions.treatInvalidAsBots.toString());

    router.push(`/results?${params.toString()}`);
  };

  const handleBack = () => {
    router.push('/upload');
  };

  const getEstimatedTime = () => {
    const rowCount = csvData?.rows.length || 0;
    const baseTime = Math.ceil(rowCount / 1000); // Base time in minutes
    const mxCheckMultiplier = advancedOptions.enableMxCheck ? 3 : 1;
    return Math.max(1, Math.ceil(baseTime * mxCheckMultiplier));
  };

  if (!csvData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No CSV data found. Please upload a file first.</p>
            <Button onClick={() => router.push('/upload')} className="mt-4">
              Go to Upload
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-3xl font-bold">Map Columns</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Configure how your CSV columns should be processed for bot detection.
          </p>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Stepper steps={steps} currentStep={2} />
        </motion.div>

        {/* Column Mapping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Column Mapping
              </CardTitle>
              <CardDescription>
                Select which columns contain email addresses and names
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Email Address
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </label>
                  <ColumnMappingSelect
                    columns={csvData.headers}
                    value={mappedColumns.email}
                    onChange={(value) => handleColumnChange('email', value)}
                    placeholder="Select email column"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <ColumnMappingSelect
                    columns={csvData.headers}
                    value={mappedColumns.firstName}
                    onChange={(value) => handleColumnChange('firstName', value)}
                    placeholder="Select first name column"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <ColumnMappingSelect
                    columns={csvData.headers}
                    value={mappedColumns.lastName}
                    onChange={(value) => handleColumnChange('lastName', value)}
                    placeholder="Select last name column"
                  />
                </div>
              </div>

              {/* Column Preview */}
              {mappedColumns.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <ColumnPreview
                    headers={csvData.headers}
                    rows={csvData.rows.slice(0, 5)}
                    mappedColumns={mappedColumns}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Advanced Options
                    </div>
                    {isAdvancedOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Configure additional processing options
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="mxCheck"
                        checked={advancedOptions.enableMxCheck}
                        onCheckedChange={(checked) => 
                          handleAdvancedOptionChange('enableMxCheck', checked as boolean)
                        }
                      />
                      <div className="space-y-1">
                        <label htmlFor="mxCheck" className="text-sm font-medium cursor-pointer">
                          Perform MX record check
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Verify email domains have valid mail servers (slower but more accurate)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="treatInvalidAsBots"
                        checked={advancedOptions.treatInvalidAsBots}
                        onCheckedChange={(checked) => 
                          handleAdvancedOptionChange('treatInvalidAsBots', checked as boolean)
                        }
                      />
                      <div className="space-y-1">
                        <label htmlFor="treatInvalidAsBots" className="text-sm font-medium cursor-pointer">
                          Treat invalid emails as bots
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Mark emails with invalid syntax or no MX records as bots
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Processing Estimate */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Estimated Processing Time</p>
                        <p className="text-xs text-muted-foreground">
                          Approximately {getEstimatedTime()} minute{getEstimatedTime() !== 1 ? 's' : ''} for {csvData.rows.length.toLocaleString()} records
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex justify-between items-center"
          >
            <Button variant="outline" onClick={handleBack}>
              Back to Upload
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={handleContinue} 
                      disabled={!isValid}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      Start Processing
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isValid && (
                  <TooltipContent>
                    <p>Please select an email column to continue</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}