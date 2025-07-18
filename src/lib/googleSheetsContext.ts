import { createContext } from 'react'
import { GoogleSheetsService, GoogleSheetsConfig } from '@/services/googleSheets'

export interface GoogleSheetsContextType {
  service: GoogleSheetsService | null
  isConnected: boolean
  config: GoogleSheetsConfig | null
  setConfig: (config: GoogleSheetsConfig | null) => void
}

export const GoogleSheetsContext = createContext<GoogleSheetsContextType | undefined>(undefined)