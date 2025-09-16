/**
 * TypeScript definitions for Unlayer Email Editor
 */

export interface UnlayerOptions {
  displayMode?: 'email' | 'web'
  [key: string]: any // allow extra Unlayer config keys
}

export interface UnlayerDesign {
  body: {
    rows: UnlayerRow[]
    values?: Record<string, any>
  }
  counters?: Record<string, number>
  schemaVersion?: number
}

export interface UnlayerRow {
  id: string
  cells: number[]
  columns: UnlayerColumn[]
  values: Record<string, any>
}

export interface UnlayerColumn {
  id: string
  contents: UnlayerContent[]
  values: Record<string, any>
}

export interface UnlayerContent {
  id: string
  type: string
  values: Record<string, any>
}

export interface UnlayerExportData {
  html: string
  design: UnlayerDesign
}

export interface UnlayerOptions {
  projectId?: number
  displayMode?: 'email' | 'web'
  locale?: string
  appearance?: {
    theme?: 'light' | 'dark'
    panels?: {
      tools?: {
        dock?: 'left' | 'right'
      }
    }
  }
  features?: {
    preview?: boolean
    imageEditor?: boolean
    undoRedo?: boolean
  }
  mergeTags?: Record<string, string>
  designTags?: Record<string, string>
  customJS?: string[]
  customCSS?: string[]
}

export interface UnlayerTools {
  enabled?: string[]
  disabled?: string[]
}

export interface UnlayerEditorInstance {
  init: (config: UnlayerInitConfig) => void
  loadDesign: (design: UnlayerDesign, callback?: () => void) => void
  saveDesign: (callback: (design: UnlayerDesign) => void) => void
  exportHtml: (callback: (data: UnlayerExportData) => void) => void
  setDisplayMode: (mode: 'email' | 'web') => void
  addEventListener: (event: string, callback: (data?: any) => void) => void
  removeEventListener: (event: string, callback: (data?: any) => void) => void
}

export interface UnlayerInitConfig {
  id: string
  projectId?: number
  displayMode?: 'email' | 'web'
  locale?: string
  appearance?: {
    theme?: 'light' | 'dark'
    panels?: {
      tools?: {
        dock?: 'left' | 'right'
      }
    }
  }
  features?: {
    preview?: boolean
    imageEditor?: boolean
    undoRedo?: boolean
  }
  tools?: UnlayerTools
  mergeTags?: Record<string, string>
  designTags?: Record<string, string>
  customJS?: string[]
  customCSS?: string[]
}

declare global {
  interface Window {
    unlayer: UnlayerEditorInstance
  }
}
