"use client"

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ColumnMappingSelectProps {
  label: string
  value: string | null
  onValueChange: (value: string) => void
  options: string[]
  required?: boolean
  placeholder?: string
  className?: string
}

export function ColumnMappingSelect({
  label,
  value,
  onValueChange,
  options,
  required = false,
  placeholder = "Select a column",
  className,
}: ColumnMappingSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-2">
        {label}
        {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
      </Label>
      <Select value={value || ""} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

