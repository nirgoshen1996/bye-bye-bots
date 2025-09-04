"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { CSVData } from '@/lib/validation'

interface CSVContextType {
  csvData: CSVData | null
  setCSVData: (data: CSVData | null) => void
  clearCSVData: () => void
}

const CSVContext = createContext<CSVContextType | undefined>(undefined)

export function CSVProvider({ children }: { children: ReactNode }) {
  const [csvData, setCSVData] = useState<CSVData | null>(null)

  const clearCSVData = () => {
    setCSVData(null)
  }

  return (
    <CSVContext.Provider value={{ csvData, setCSVData, clearCSVData }}>
      {children}
    </CSVContext.Provider>
  )
}

export function useCSV() {
  const context = useContext(CSVContext)
  if (context === undefined) {
    throw new Error('useCSV must be used within a CSVProvider')
  }
  return context
}

