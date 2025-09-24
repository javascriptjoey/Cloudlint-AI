import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Editor from '@monaco-editor/react'
import * as yaml from 'js-yaml'
import { yamlAI, type AIAnalysisResult } from '@/lib/yaml-ai-service'
import { Lightbulb, AlertTriangle, CheckCircle, Info, Moon, Sun, Settings } from 'lucide-react'

export function SimpleYAMLValidator() {
  const [yamlContent, setYamlContent] = useState('# Enter your YAML here\nname: John Doe\nage: 30\ncity: New York')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
    parsed?: string
    jsonOutput?: string
  } | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const validateYAML = async () => {
    if (!yamlContent.trim()) {
      setValidationResult({ isValid: false, errors: ['YAML content is empty'] })
      setAiAnalysis(null)
      return
    }

    try {
      const parsed = yaml.load(yamlContent)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      setValidationResult({ 
        isValid: true, 
        errors: [], 
        parsed: JSON.stringify(parsed, null, 2),
        jsonOutput
      })

      // Run AI analysis
      setIsAnalyzing(true)
      try {
        const analysis = await yamlAI.analyzeYAML(yamlContent)
        setAiAnalysis(analysis)
      } catch (error) {
        console.error('AI analysis failed:', error)
        setAiAnalysis(null)
      } finally {
        setIsAnalyzing(false)
      }

    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
      setAiAnalysis(null)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Settings */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered YAML Validator</h1>
          <p className="text-muted-foreground">Professional YAML validation with Monaco Editor, AI suggestions, and JSON conversion</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={setIsDarkMode}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-4 w-4" />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your YAML validator preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch 
                id="dark-mode"
                checked={isDarkMode} 
                onCheckedChange={setIsDarkMode}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              More settings coming soon...
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* YAML Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">YAML Input</label>
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="400px"
                  defaultLanguage="yaml"
                  value={yamlContent}
                  onChange={(value) => setYamlContent(value || '')}
                  theme={isDarkMode ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <Tabs defaultValue="validation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                  <TabsTrigger value="ai-suggestions">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    AI Suggestions
                  </TabsTrigger>
                  <TabsTrigger value="json">JSON Output</TabsTrigger>
                </TabsList>
                
                <TabsContent value="validation" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {validationResult ? (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                              {validationResult.isValid ? "✅ Valid" : "❌ Invalid"}
                            </Badge>
                          </div>
                          
                          {validationResult.isValid ? (
                            <p className="text-green-600">YAML is syntactically correct!</p>
                          ) : (
                            <div>
                              <p className="text-red-600 mb-2">Errors found:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {validationResult.errors.map((error, index) => (
                                  <li key={index} className="text-sm text-red-600">
                                    {error}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Click "Validate YAML" to see results</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-suggestions" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Analyzing YAML with AI...</p>
                        </div>
                      ) : aiAnalysis ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {aiAnalysis.suggestions.length} suggestions
                            </Badge>
                            <Badge variant="outline">
                              Score: {Math.round(aiAnalysis.confidenceScore * 100)}%
                            </Badge>
                          </div>
                          
                          {aiAnalysis.suggestions.length > 0 ? (
                            <div className="space-y-3">
                              {aiAnalysis.suggestions.map((suggestion, index) => (
                                <div key={index} className="border rounded-lg p-3 space-y-2">
                                  <div className="flex items-start gap-2">
                                    {getSeverityIcon(suggestion.severity)}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{suggestion.type}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {suggestion.severity}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {suggestion.message}
                                      </p>
                                      {suggestion.suggestion && (
                                        <div className="text-xs">
                                          <span className="font-medium text-green-600">Suggestion: </span>
                                          <span className="text-muted-foreground">{suggestion.suggestion}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                              <p className="text-sm font-medium text-green-600">Excellent YAML!</p>
                              <p className="text-xs text-muted-foreground">No suggestions needed</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          {validationResult?.isValid === false 
                            ? "Fix YAML errors to see AI suggestions" 
                            : "Validate YAML to see AI analysis"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="json" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {validationResult?.isValid && validationResult.jsonOutput ? (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">Converted JSON:</label>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(validationResult.jsonOutput || '')}
                            >
                              Copy JSON
                            </Button>
                          </div>
                          <div className="border rounded-md overflow-hidden">
                            <Editor
                              height="300px"
                              defaultLanguage="json"
                              value={validationResult.jsonOutput}
                              theme={isDarkMode ? "vs-dark" : "light"}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                readOnly: true,
                                automaticLayout: true,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          {validationResult?.isValid === false 
                            ? "Fix YAML errors to see JSON output" 
                            : "Validate YAML to see JSON conversion"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={validateYAML} size="lg" disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Validate YAML'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}