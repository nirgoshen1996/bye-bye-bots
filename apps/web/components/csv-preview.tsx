"use client"

import React from 'react'
import { CSVData } from '@/lib/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CSVPreviewProps {
  data: CSVData
}

export function CSVPreview({ data }: CSVPreviewProps) {
  const previewRows = data.rows.slice(0, 10)
  const totalRows = data.rows.length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CSV Preview</span>
          <Badge variant="secondary">
            {totalRows} total rows
          </Badge>
        </CardTitle>
        <CardDescription>
          Showing first 10 rows of {totalRows} total rows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-muted">
                {data.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-border px-4 py-2 text-sm text-foreground max-w-xs truncate"
                      title={cell}
                    >
                      {cell || <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalRows > 10 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ... and {totalRows - 10} more rows
          </div>
        )}
      </CardContent>
    </Card>
  )
}

