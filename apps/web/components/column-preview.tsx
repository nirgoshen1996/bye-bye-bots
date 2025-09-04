"use client"

import React from 'react'
import { CSVData } from '@/lib/validation'
import { ColumnMapping } from '@/lib/column-mapping'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ColumnPreviewProps {
  csvData: CSVData
  mapping: ColumnMapping
}

export function ColumnPreview({ csvData, mapping }: ColumnPreviewProps) {
  const getColumnIndex = (columnName: string | null) => {
    if (!columnName) return -1
    return csvData.headers.findIndex(header => header === columnName)
  }

  const getSampleData = (columnName: string | null, maxRows: number = 5) => {
    const index = getColumnIndex(columnName)
    if (index === -1) return []
    
    return csvData.rows.slice(0, maxRows).map(row => row[index] || '')
  }

  const mappedColumns = [
    { key: 'email' as const, label: 'Email', required: true },
    { key: 'firstName' as const, label: 'First Name', required: false },
    { key: 'lastName' as const, label: 'Last Name', required: false },
  ]

  const hasAnyMapping = Object.values(mapping).some(value => value !== null)

  if (!hasAnyMapping) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Column Preview</CardTitle>
        <CardDescription>
          Preview of the selected columns with sample data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mappedColumns.map(({ key, label, required }) => {
            const columnName = mapping[key]
            if (!columnName) return null

            const sampleData = getSampleData(columnName)
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{label}</h4>
                  {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  <Badge variant="outline" className="text-xs">
                    {columnName}
                  </Badge>
                </div>
                
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    Sample data (first {sampleData.length} rows):
                  </div>
                  <div className="space-y-1">
                    {sampleData.map((value, index) => (
                      <div key={index} className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {value || <span className="text-muted-foreground">—</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

