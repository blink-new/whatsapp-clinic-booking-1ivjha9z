import { useState, useEffect, ReactNode } from 'react'
import { GoogleSheetsService, GoogleSheetsConfig } from '@/services/googleSheets'
import { GoogleSheetsContext } from '@/lib/googleSheetsContext'

interface GoogleSheetsProviderProps {
  children: ReactNode
}

export function GoogleSheetsProvider({ children }: GoogleSheetsProviderProps) {
  const [service, setService] = useState<GoogleSheetsService | null>(null)
  const [config, setConfigState] = useState<GoogleSheetsConfig | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Load configuration from localStorage on mount
    const savedConfig = localStorage.getItem('googleSheetsConfig')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfigState(parsedConfig)
        
        // Create service and test connection
        const newService = new GoogleSheetsService(parsedConfig)
        setService(newService)
        
        // Test connection in background
        newService.testConnection().then(result => {
          setIsConnected(result.success)
          if (!result.success) {
            console.warn('Google Sheets connection failed:', result.error)
          }
        }).catch((error) => {
          console.error('Error testing Google Sheets connection:', error)
          setIsConnected(false)
        })
      } catch (error) {
        console.error('Error loading Google Sheets config:', error)
      }
    }
  }, [])

  const setConfig = (newConfig: GoogleSheetsConfig | null) => {
    setConfigState(newConfig)
    
    if (newConfig) {
      const newService = new GoogleSheetsService(newConfig)
      setService(newService)
      
      // Test connection
      newService.testConnection().then(result => {
        setIsConnected(result.success)
        if (!result.success) {
          console.warn('Google Sheets connection failed:', result.error)
        }
      }).catch((error) => {
        console.error('Error testing Google Sheets connection:', error)
        setIsConnected(false)
      })
    } else {
      setService(null)
      setIsConnected(false)
    }
  }

  return (
    <GoogleSheetsContext.Provider value={{
      service,
      isConnected,
      config,
      setConfig
    }}>
      {children}
    </GoogleSheetsContext.Provider>
  )
}