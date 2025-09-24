import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Editor from '@monaco-editor/react'
import { Download, Upload, Code, Copy, RotateCcw } from 'lucide-react'
import { useYamlValidation } from '@/hooks/useYamlValidation'
import { useFileOperations } from '@/hooks/useFileOperations'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'

// TypeScript interface for editor options
interface EditorOptions {
  minimap: { enabled: boolean }
  fontSize: number
  lineNumbers: 'on' | 'off' | 'relative' | 'interval'
  automaticLayout: boolean
  scrollBeyondLastLine: boolean
  smoothScrolling: boolean
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
  cursorSmoothCaretAnimation: 'off' | 'explicit' | 'on'
  cursorWidth: number
  selectOnLineNumbers: boolean
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all'
  showFoldingControls: 'always' | 'mouseover'
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  contextmenu: boolean
  bracketPairColorization: { enabled: boolean }
  guides: {
    indentation: boolean
    highlightActiveIndentation: boolean
  }
  readOnly?: boolean
}

interface EditorOptions {
  minimap: { enabled: boolean }
  fontSize: number
  lineNumbers: 'on' | 'off' | 'relative' | 'interval'
  automaticLayout: boolean
  scrollBeyondLastLine: boolean
  smoothScrolling: boolean
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
  cursorSmoothCaretAnimation: 'off' | 'explicit' | 'on'
  cursorWidth: number
  selectOnLineNumbers: boolean
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all'
  showFoldingControls: 'always' | 'mouseover'
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  contextmenu: boolean
  bracketPairColorization: { enabled: boolean }
  guides: {
    indentation: boolean
    highlightActiveIndentation: boolean
  }
  readOnly?: boolean
}

// Common editor options to avoid repetition
const COMMON_EDITOR_OPTIONS: Omit<EditorOptions, 'readOnly'> = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'on',
  cursorWidth: 2,
  selectOnLineNumbers: true,
  renderLineHighlight: 'all',
  showFoldingControls: 'mouseover',
  wordWrap: 'on',
  contextmenu: true,
  bracketPairColorization: { enabled: true },
  guides: {
    indentation: true,
    highlightActiveIndentation: true
  }
}

// Tailwind CSS class patterns following best practices
const TAILWIND_CLASSES = {
  // Status indicators with proper dark mode patterns
  validStatus: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",
  errorStatus: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100",
  
  // Card backgrounds with consistent dark mode
  validCard: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  errorCard: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  
  // Success and error gradients
  validGradient: "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-800",
  errorGradient: "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 border border-red-200 dark:border-red-800",
  
  // Text colors for different states
  validText: {
    primary: "text-green-800 dark:text-green-200",
    secondary: "text-green-600 dark:text-green-400"
  },
  errorText: {
    primary: "text-red-800 dark:text-red-200", 
    secondary: "text-red-600 dark:text-red-400",
    detail: "text-red-700 dark:text-red-300"
  },
  
  // Placeholder text colors
  placeholderText: {
    primary: "text-gray-300 dark:text-gray-300",
    secondary: "text-gray-400 dark:text-gray-400"
  },
  
  // Editor focus states
  editorBorder: {
    focused: "border-blue-500 ring-2 ring-blue-500/20 shadow-lg",
    normal: "border-gray-700 hover:border-gray-600 dark:border-gray-700 dark:hover:border-gray-600"
  }
} as const



export function TestYAMLValidator() {
  const [yamlContent, setYamlContent] = useState<string>('')
  const [isDarkMode] = useState<boolean>(true) // Fixed to dark theme
  const [autoValidate] = useState<boolean>(true) // Fixed to auto-validate
  
  // Custom hooks
  const { validationResult, validateYaml, clearValidation } = useYamlValidation()
  const { downloadYAML, downloadJSON, handleFileUpload } = useFileOperations()
  const { 
    monacoEditor, 
    editorFocused, 
    resetEditorScroll, 
    clearEditor, 
    handleEditorMount 
  } = useMonacoEditor()

  // Handle validation using the custom hook
  const handleValidate = useCallback(() => {
    validateYaml(yamlContent)
    // Clear Monaco editor error markers on validation
    if (monacoEditor) {
      const monaco = (window as any).monaco
      if (monaco) {
        monaco.editor.setModelMarkers(monacoEditor.getModel(), 'yaml-validator', [])
      }
    }
  }, [yamlContent, validateYaml, monacoEditor])

  // Debounced auto-validation
  const debouncedValidate = useCallback(() => {
    if (autoValidate) {
      handleValidate()
    }
  }, [handleValidate, autoValidate])

  useEffect(() => {
    if (autoValidate && yamlContent.trim()) {
      const timeoutId = setTimeout(debouncedValidate, 500)
      return () => clearTimeout(timeoutId)
    } else if (!yamlContent.trim()) {
      // Clear validation results when content is empty
      clearValidation()
    }
  }, [yamlContent, debouncedValidate, autoValidate, clearValidation])

  // Wrapper for file upload to handle content loading
  const onFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, (content: string) => {
      setYamlContent(content)
      clearValidation()
      resetEditorScroll()
    })
  }, [handleFileUpload, clearValidation, resetEditorScroll])

  // YAML formatting function
  // Copy functions
  const copyValidationResults = useCallback(() => {
    if (!validationResult) return
    
    let copyText = `YAML Validation Results\n${'='.repeat(25)}\n\n`
    copyText += `Status: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}\n`
    
    if (!validationResult.isValid && validationResult.errors.length > 0) {
      copyText += `\nErrors:\n${validationResult.errors.map(error => `• ${error}`).join('\n')}`
    }
    
    if (validationResult.isValid && validationResult.jsonOutput) {
      copyText += `\nJSON Output:\n${validationResult.jsonOutput}`
    }
    
    navigator.clipboard.writeText(copyText)
  }, [validationResult])

  const resetAll = useCallback(() => {
    setYamlContent('')
    clearValidation()
    
    // Clear Monaco editor content and markers
    if (monacoEditor) {
      clearEditor()
    }
    
    // Reset scroll to top
    resetEditorScroll()
  }, [clearValidation, monacoEditor, clearEditor, resetEditorScroll])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to validate
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        handleValidate()
      }
      
      // Ctrl+R or Cmd+R to reset everything
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        resetAll()
      }
      
      // Ctrl+S or Cmd+S to download YAML
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        downloadYAML(yamlContent)
      }
      
      // Ctrl+O or Cmd+O to open file upload
      if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault()
        document.getElementById('file-upload')?.click()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleValidate, yamlContent, downloadYAML, resetAll])

  return (
    <Card 
      className={`max-w-6xl mx-auto transition-all duration-300 ${
        validationResult?.isValid 
          ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/10' 
          : validationResult?.isValid === false 
            ? 'ring-2 ring-red-500 bg-red-50/50 dark:bg-red-950/10' 
            : ''
      }`}
    >
      <CardHeader>
        <CardTitle>Test YAML Validator with Full Features</CardTitle>
        <CardDescription>Testing YAML validation and JSON conversion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YAML Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">YAML Input</label>
              <div className="flex gap-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".yaml,.yml,text/yaml,application/x-yaml"
                  onChange={onFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadYAML(yamlContent)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  YAML
                </Button>
              </div>
            </div>
            <div className="border rounded-md overflow-hidden relative">
              {!yamlContent && (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 ${
                  isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'
                }`}>
                  <div className="text-center">
                    <Code className={`h-8 w-8 mx-auto mb-2 opacity-60 ${TAILWIND_CLASSES.placeholderText.secondary}`} />
                    <p className={`text-sm font-medium ${TAILWIND_CLASSES.placeholderText.primary}`}>
                      Paste your YAML code here
                    </p>
                    <p className={`text-xs ${TAILWIND_CLASSES.placeholderText.secondary}`}>
                      Start typing or use Ctrl+V to paste
                    </p>
                  </div>
                </div>
              )}
              <div 
                className={`rounded-md overflow-hidden border-2 transition-all duration-200 ${
                  editorFocused 
                    ? TAILWIND_CLASSES.editorBorder.focused
                    : TAILWIND_CLASSES.editorBorder.normal
                }`}
                onClick={() => {
                  if (monacoEditor) {
                    monacoEditor.focus()
                  }
                }}
              >
                <Editor
                  height="350px"
                  defaultLanguage="yaml"
                  value={yamlContent}
                  onChange={(value) => {
                    setYamlContent(value || '')
                    // Scroll to top when content changes (especially on paste)
                    if (monacoEditor && value && value !== yamlContent) {
                      setTimeout(() => {
                        monacoEditor.setScrollTop(0)
                        monacoEditor.setPosition({ lineNumber: 1, column: 1 })
                      }, 10)
                    }
                  }}
                  onMount={handleEditorMount}
                  theme={isDarkMode ? "vs-dark" : "vs-light"}
                  options={COMMON_EDITOR_OPTIONS}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Results</label>
            <Tabs defaultValue="validation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="json">JSON Output</TabsTrigger>
              </TabsList>
              
              <TabsContent value="validation" className="mt-4">
                <Card className={
                  validationResult?.isValid 
                    ? TAILWIND_CLASSES.validCard
                    : validationResult?.isValid === false 
                      ? TAILWIND_CLASSES.errorCard
                      : ""
                }>
                  <CardContent className="p-4">
                    {validationResult ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Badge 
                            variant={validationResult.isValid ? "default" : "destructive"}
                            className={`animate-pulse ${
                              validationResult.isValid 
                                ? TAILWIND_CLASSES.validStatus
                                : TAILWIND_CLASSES.errorStatus
                            }`}
                          >
                            {validationResult.isValid ? "🎉 Valid YAML! Perfect!" : "🚨 Invalid YAML - Errors Found!"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={copyValidationResults}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Results
                          </Button>
                        </div>
                        
                        {!validationResult.isValid && (
                          <div className={`p-4 ${TAILWIND_CLASSES.errorGradient} rounded-lg animate-pulse`}>
                            <div className="flex items-center space-x-3">
                              <div className="text-3xl animate-bounce">🚨</div>
                              <div className="flex-1">
                                <p className={`text-lg font-semibold ${TAILWIND_CLASSES.errorText.primary}`}>
                                  YAML Validation Failed!
                                </p>
                                <p className={`text-sm ${TAILWIND_CLASSES.errorText.secondary} mb-3`}>
                                  Your YAML contains syntax errors that need to be fixed.
                                </p>
                                <div>
                                  <ul className="text-sm space-y-1">
                                    {validationResult.errors.map((error, index) => (
                                      <li key={index} className={`${TAILWIND_CLASSES.errorText.detail} text-xs flex items-start`}>
                                        <span className="text-red-500 mr-2">💥</span>
                                        <span>{error}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-center">
                              <div className="text-2xl">🔥 ⚠️ 🔥</div>
                            </div>
                          </div>
                        )}
                        
                        {validationResult.isValid && (
                          <div className={`p-4 ${TAILWIND_CLASSES.validGradient} rounded-lg animate-pulse`}>
                            <div className="flex items-center space-x-3">
                              <div className="text-3xl animate-bounce">🎉</div>
                              <div>
                                <p className={`text-lg font-semibold ${TAILWIND_CLASSES.validText.primary}`}>
                                  Perfect! Your YAML is Valid!
                                </p>
                                <p className={`text-sm ${TAILWIND_CLASSES.validText.secondary}`}>
                                  No errors found. Your YAML content is properly formatted and ready to use!
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 text-center">
                              <div className="text-2xl">✨ 🚀 ✨</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Click "Validate" to check your YAML</p>
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
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(validationResult.jsonOutput || '')}
                            >
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => validationResult?.jsonOutput && downloadJSON(validationResult.jsonOutput)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              JSON
                            </Button>
                          </div>
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <Editor
                            height="250px"
                            defaultLanguage="json"
                            value={validationResult.jsonOutput}
                            theme={isDarkMode ? "vs-dark" : "vs-light"}
                            options={{
                              ...COMMON_EDITOR_OPTIONS,
                              readOnly: true
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
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
        
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <Button 
              onClick={resetAll}
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}