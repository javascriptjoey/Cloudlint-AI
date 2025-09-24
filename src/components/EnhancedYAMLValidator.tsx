import { useState, useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// Components
import { YAMLEditor } from '@/components/YAMLEditor'
import { YAMLResultsPanel } from '@/components/YAMLResultsPanel'
import { YAMLSettingsPanel, useYAMLValidatorSettings, type YAMLValidatorSettings } from '@/components/YAMLSettingsPanel'

// Services
import { validateYAML, type ValidationResult } from '@/lib/yaml-validator'
import { yamlAI, type AIAnalysisResult } from '@/lib/yaml-ai-service'
import { YAMLJSONConverter } from '@/lib/yaml-json-converter'

// Icons
import { 
  FileText, 
  Sparkles, 
  Settings2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Code2
} from 'lucide-react'

interface EnhancedYAMLValidatorProps {
  readonly className?: string
}

export function EnhancedYAMLValidator({ className }: EnhancedYAMLValidatorProps) {
  // Settings management
  const { 
    getStoredSettings, 
    saveSettings, 
    exportSettings, 
    importSettings, 
    resetSettings 
  } = useYAMLValidatorSettings()
  
  const [settings, setSettings] = useState<YAMLValidatorSettings>(getStoredSettings())
  
  // Core state
  const [yamlContent, setYamlContent] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')

  // Derived state
  const jsonOutput = useMemo(() => {
    if (!validationResult?.isValid || !yamlContent.trim()) return null
    const result = YAMLJSONConverter.yamlToJSON(yamlContent, { indent: 2 })
    return result.success ? result.result : null
  }, [validationResult, yamlContent])

  const isValid = validationResult?.isValid ?? false
  const hasErrors = validationResult && !validationResult.isValid
  const totalSuggestions = aiAnalysis?.suggestions.length ?? 0

  // Validation function
  const performValidation = useCallback(async (content: string) => {
    if (!content.trim()) {
      setValidationResult(null)
      setAIAnalysis(null)
      return
    }

    setIsValidating(true)

    try {
      // Basic validation
      const validation = validateYAML(content)
      setValidationResult(validation)

      // AI analysis if enabled and YAML is valid
      if (settings.enableAISuggestions) {
        setIsAnalyzing(true)
        try {
          const analysis = await yamlAI.analyzeYAML(content)
          setAIAnalysis(analysis)
        } catch (error) {
          console.warn('AI analysis failed:', error)
          setAIAnalysis(null)
        } finally {
          setIsAnalyzing(false)
        }
      }

      // Show results
      if (validation.isValid) {
        toast.success('YAML is valid! ✅')
      } else {
        const errorCount = validation.errors.length
        toast.error(`Found ${errorCount} validation error${errorCount === 1 ? '' : 's'}`)
      }
    } finally {
      setIsValidating(false)
    }
  }, [settings.enableAISuggestions])

  // Auto-validation with debounce
  useEffect(() => {
    if (!settings.autoValidate || !yamlContent) return

    const timer = setTimeout(() => {
      performValidation(yamlContent)
    }, 1000) // 1 second debounce

    return () => clearTimeout(timer)
  }, [yamlContent, settings.autoValidate, performValidation])

  // Settings change handler
  const handleSettingsChange = useCallback((newSettings: YAMLValidatorSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [saveSettings])

  // Content change handler
  const handleContentChange = useCallback((content: string) => {
    let processedContent = content

    // Format on paste if enabled
    if (settings.formatOnPaste && content.length > yamlContent.length + 10) {
      const formatResult = YAMLJSONConverter.formatYAML(content)
      if (formatResult.success && formatResult.result) {
        processedContent = formatResult.result
        toast.success('YAML formatted automatically')
      }
    }

    setYamlContent(processedContent)
    
    // Clear previous results if not auto-validating
    if (!settings.autoValidate) {
      setValidationResult(null)
      setAIAnalysis(null)
    }
  }, [yamlContent.length, settings.formatOnPaste, settings.autoValidate])

  // Manual validation handler
  const handleManualValidation = useCallback(() => {
    if (!yamlContent.trim()) {
      toast.error('Please enter some YAML content to validate')
      return
    }
    performValidation(yamlContent)
  }, [yamlContent, performValidation])

  // Copy handler
  const handleCopy = useCallback(async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success(`${type} copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  // Download handler
  const handleDownload = useCallback((content: string, filename: string, type: 'yaml' | 'json') => {
    YAMLJSONConverter.downloadFile(content, filename, type)
    toast.success(`${type.toUpperCase()} file downloaded!`)
  }, [])

  // Apply improvement handler
  const handleApplyImprovement = useCallback((improvedYaml: string) => {
    setYamlContent(improvedYaml)
    toast.success('Improvements applied! 🎉')
    
    // Re-validate after applying improvements
    if (settings.autoValidate) {
      setTimeout(() => performValidation(improvedYaml), 500)
    }
  }, [settings.autoValidate, performValidation])

  // Clear all handler
  const handleClearAll = useCallback(() => {
    setYamlContent('')
    setValidationResult(null)
    setAIAnalysis(null)
    toast.info('Content cleared')
  }, [])

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 space-y-6 ${className ?? ''}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Code2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold tracking-tight">AI-Powered YAML Validator</h1>
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced YAML validation with AI suggestions, syntax highlighting, error visualization, and JSON conversion
        </p>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : hasErrors ? 'bg-red-500' : 'bg-gray-300'}`} />
            <span className="text-muted-foreground">
              {isValid ? 'Valid' : hasErrors ? 'Invalid' : 'Not validated'}
            </span>
          </div>
          {totalSuggestions > 0 && (
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-muted-foreground">{totalSuggestions} suggestions</span>
            </div>
          )}
          {yamlContent.length > 0 && (
            <div className="text-muted-foreground">
              {yamlContent.split('\n').length} lines, {yamlContent.length} chars
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="relative">
            <FileText className="h-4 w-4 mr-2" />
            YAML Editor
            {hasErrors && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                {validationResult?.errors.length}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="results" disabled={!validationResult && !aiAnalysis}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Analysis
            {totalSuggestions > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {totalSuggestions}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="settings">
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    YAML Editor
                    {isValid && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {hasErrors && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  </CardTitle>
                  <CardDescription>
                    {settings.autoValidate 
                      ? 'Auto-validation enabled - changes are validated automatically'
                      : 'Click "Validate" to check your YAML'
                    }
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {settings.enableAISuggestions && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Enabled
                    </Badge>
                  )}
                  
                  {settings.autoValidate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Auto-validate
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={handleManualValidation}
                    disabled={!yamlContent.trim() || (isValidating || isAnalyzing)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {isValidating ? 'Validating...' : isAnalyzing ? 'Analyzing...' : 'Validate YAML'}
                  </Button>
                  
                  {yamlContent && (
                    <Button
                      onClick={() => handleCopy(yamlContent, 'YAML content')}
                      variant="outline"
                      size="default"
                    >
                      Copy
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {jsonOutput && (
                    <Button
                      onClick={() => handleDownload(jsonOutput, 'converted', 'json')}
                      variant="outline"
                      size="default"
                    >
                      Download JSON
                    </Button>
                  )}
                  
                  {yamlContent && (
                    <>
                      <Button
                        onClick={() => handleDownload(yamlContent, 'validated', 'yaml')}
                        variant="outline"
                        size="default"
                      >
                        Download YAML
                      </Button>
                      
                      <Button
                        onClick={handleClearAll}
                        variant="outline"
                        size="default"
                        className="text-red-600 hover:text-red-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* YAML Editor */}
              <YAMLEditor
                value={yamlContent}
                onChange={handleContentChange}
                errors={validationResult?.errors ?? []}
                showWhitespace={settings.showWhitespace}
                theme={settings.theme}
                className="min-h-[400px]"
              />

              {/* Status Bar */}
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded">
                <div className="flex items-center gap-4">
                  <span>Lines: {yamlContent.split('\n').length}</span>
                  <span>Characters: {yamlContent.length}</span>
                  {validationResult && (
                    <span className={`flex items-center gap-1 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {isValid ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {isValid ? 'Valid YAML' : `${validationResult.errors.length} errors`}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {(isValidating || isAnalyzing) && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                      <span>{isValidating ? 'Validating' : 'AI Analyzing'}...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-6">
          {(validationResult || aiAnalysis) ? (
            <YAMLResultsPanel
              originalYaml={yamlContent}
              isValid={isValid}
              suggestions={aiAnalysis?.suggestions ?? []}
              improvedYaml={aiAnalysis?.improvedYaml}
              jsonOutput={jsonOutput ?? undefined}
              showWhitespace={settings.showWhitespace}
              theme={settings.theme}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onApplyImprovement={handleApplyImprovement}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analysis Results</h3>
                <p className="text-muted-foreground mb-4">
                  Validate your YAML to see AI-powered suggestions and analysis
                </p>
                <Button
                  onClick={() => setActiveTab('editor')}
                  variant="outline"
                >
                  Go to Editor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <YAMLSettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onExportSettings={exportSettings}
            onImportSettings={importSettings}
            onResetSettings={resetSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}