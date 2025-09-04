"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, FileText } from 'lucide-react'

export default function ProcessingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">BotCleaner</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">Processing</span>
            </div>
          </nav>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-20">
        <Container size="md">
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Processing Your Data
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're analyzing your CSV data to identify and remove bot traffic patterns.
            </p>
          </div>

          {/* Processing Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Processing Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing data structure</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Identifying bot patterns</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Generating clean dataset</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Estimated Time */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Estimated Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2-3 minutes</div>
                <p className="text-muted-foreground">
                  Processing time depends on the size of your dataset
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Happens Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Analysis Complete</h4>
                  <p className="text-muted-foreground">
                    We'll analyze your data for bot traffic patterns
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <CheckCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Clean Dataset</h4>
                  <p className="text-muted-foreground">
                    Download your cleaned data without bot traffic
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Report</h4>
                  <p className="text-muted-foreground">
                    Get insights about detected bot patterns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Upload Another File
              </Button>
            </Link>
          </div>

          {/* Note */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              You can close this page and return later. We'll send you an email when processing is complete.
            </p>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <Container>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">BotCleaner</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 BotCleaner. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

