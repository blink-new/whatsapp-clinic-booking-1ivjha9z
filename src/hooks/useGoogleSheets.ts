import { useContext } from 'react'
import { GoogleSheetsContext } from '@/lib/googleSheetsContext'

export function useGoogleSheets() {
  const context = useContext(GoogleSheetsContext)
  if (context === undefined) {
    throw new Error('useGoogleSheets must be used within a GoogleSheetsProvider')
  }
  return context
}