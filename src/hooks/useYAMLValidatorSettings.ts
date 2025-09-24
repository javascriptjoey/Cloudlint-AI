export interface YAMLValidatorSettings {
  readonly theme: 'light' | 'dark'
  readonly showWhitespace: boolean
  readonly enableAISuggestions: boolean
  readonly autoValidate: boolean
  readonly formatOnPaste: boolean
  readonly showLineNumbers: boolean
  readonly enableMinimap: boolean
}

const defaultSettings: YAMLValidatorSettings = {
  theme: 'light',
  showWhitespace: false,
  enableAISuggestions: true,
  autoValidate: true,
  formatOnPaste: false,
  showLineNumbers: true,
  enableMinimap: false
}

export function useYAMLValidatorSettings() {
  const getStoredSettings = (): YAMLValidatorSettings => {
    try {
      const stored = localStorage.getItem('yaml-validator-settings')
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch {
      return defaultSettings
    }
  }

  const saveSettings = (settings: YAMLValidatorSettings) => {
    try {
      localStorage.setItem('yaml-validator-settings', JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }

  const exportSettings = () => {
    const settings = getStoredSettings()
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'yaml-validator-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const settings = JSON.parse(event.target?.result as string)
          saveSettings({ ...defaultSettings, ...settings })
          window.location.reload() // Simple way to apply all settings
        } catch (error) {
          console.error('Failed to import settings:', error)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const resetSettings = () => {
    saveSettings(defaultSettings)
    window.location.reload() // Simple way to reset all settings
  }

  return {
    getStoredSettings,
    saveSettings,
    exportSettings,
    importSettings,
    resetSettings,
    defaultSettings
  }
}