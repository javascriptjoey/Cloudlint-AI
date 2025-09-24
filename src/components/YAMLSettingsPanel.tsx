import { useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Moon, 
  Sun, 
  Eye, 
  Settings2, 
  Sparkles, 
  Zap,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'

export interface YAMLValidatorSettings {
  readonly theme: 'light' | 'dark'
  readonly showWhitespace: boolean
  readonly enableAISuggestions: boolean
  readonly autoValidate: boolean
  readonly formatOnPaste: boolean
  readonly showLineNumbers: boolean
  readonly enableMinimap: boolean
}

interface YAMLSettingsPanelProps {
  readonly settings: YAMLValidatorSettings
  readonly onSettingsChange: (settings: YAMLValidatorSettings) => void
  readonly onExportSettings: () => void
  readonly onImportSettings: () => void
  readonly onResetSettings: () => void
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

export function YAMLSettingsPanel({
  settings,
  onSettingsChange,
  onExportSettings,
  onImportSettings,
  onResetSettings
}: YAMLSettingsPanelProps) {
  const handleSettingChange = useCallback(<K extends keyof YAMLValidatorSettings>(
    key: K,
    value: YAMLValidatorSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }, [settings, onSettingsChange])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {settings.theme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of the YAML validator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme-toggle">Dark mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={settings.theme === 'dark'}
              onCheckedChange={(checked) => 
                handleSettingChange('theme', checked ? 'dark' : 'light')
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="whitespace-toggle" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Show whitespace
              </Label>
              <p className="text-sm text-muted-foreground">
                Display spaces and tabs in the editor
              </p>
            </div>
            <Switch
              id="whitespace-toggle"
              checked={settings.showWhitespace}
              onCheckedChange={(checked) => 
                handleSettingChange('showWhitespace', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="line-numbers-toggle">Show line numbers</Label>
              <p className="text-sm text-muted-foreground">
                Display line numbers in the editor
              </p>
            </div>
            <Switch
              id="line-numbers-toggle"
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) => 
                handleSettingChange('showLineNumbers', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="minimap-toggle">Enable minimap</Label>
              <p className="text-sm text-muted-foreground">
                Show minimap overview of the document
              </p>
            </div>
            <Switch
              id="minimap-toggle"
              checked={settings.enableMinimap}
              onCheckedChange={(checked) => 
                handleSettingChange('enableMinimap', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Features
            <Badge variant="secondary" className="text-xs">
              Enhanced
            </Badge>
          </CardTitle>
          <CardDescription>
            Configure AI-powered validation and suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ai-suggestions-toggle" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI suggestions
              </Label>
              <p className="text-sm text-muted-foreground">
                Get intelligent suggestions for improvements
              </p>
            </div>
            <Switch
              id="ai-suggestions-toggle"
              checked={settings.enableAISuggestions}
              onCheckedChange={(checked) => 
                handleSettingChange('enableAISuggestions', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-validate-toggle" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Auto-validate
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically validate as you type (with debounce)
              </p>
            </div>
            <Switch
              id="auto-validate-toggle"
              checked={settings.autoValidate}
              onCheckedChange={(checked) => 
                handleSettingChange('autoValidate', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="format-paste-toggle">Format on paste</Label>
              <p className="text-sm text-muted-foreground">
                Automatically format YAML content when pasted
              </p>
            </div>
            <Switch
              id="format-paste-toggle"
              checked={settings.formatOnPaste}
              onCheckedChange={(checked) => 
                handleSettingChange('formatOnPaste', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings Management
          </CardTitle>
          <CardDescription>
            Import, export, or reset your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onExportSettings}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            
            <Button
              onClick={onImportSettings}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Settings
            </Button>
            
            <Button
              onClick={onResetSettings}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Theme:</span>
                <Badge variant="outline">{settings.theme}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Whitespace:</span>
                <Badge variant={settings.showWhitespace ? "default" : "secondary"}>
                  {settings.showWhitespace ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Suggestions:</span>
                <Badge variant={settings.enableAISuggestions ? "default" : "secondary"}>
                  {settings.enableAISuggestions ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-validate:</span>
                <Badge variant={settings.autoValidate ? "default" : "secondary"}>
                  {settings.autoValidate ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format on paste:</span>
                <Badge variant={settings.formatOnPaste ? "default" : "secondary"}>
                  {settings.formatOnPaste ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Line numbers:</span>
                <Badge variant={settings.showLineNumbers ? "default" : "secondary"}>
                  {settings.showLineNumbers ? 'On' : 'Off'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for managing settings
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