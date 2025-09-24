import { useState, useCallback, type ChangeEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { validateYAML, type ValidationResult, type ValidationError } from '@/lib/yaml-validator'
import { AlertTriangle, CheckCircle, Copy, Download, FileText } from 'lucide-react'

interface YAMLValidatorProps {
  readonly className?: string
}

export function YAMLValidator({ className }: YAMLValidatorProps) {
  const [yamlContent, setYamlContent] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set())

  const handleValidation = useCallback(async (): Promise<void> => {
    if (!yamlContent.trim()) {
      toast.error('Please enter some YAML content to validate')
      return
    }

    setIsValidating(true)
    
    // Simulate async validation using modern Promise patterns
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = validateYAML(yamlContent)
        setValidationResult(result)
        
        // Highlight error lines - using modern Set operations
        const errorLines = new Set(result.errors.map(error => error.line))
        setHighlightedLines(errorLines)
        
        if (result.isValid) {
          toast.success('YAML is valid! 🎉')
        } else {
          const errorCount = result.errors.length
          toast.error(`Found ${errorCount} validation error${errorCount === 1 ? '' : 's'}`)
        }
        
        setIsValidating(false)
        resolve()
      }, 300)
    })
  }, [yamlContent])

  const handleCopyYAML = useCallback(async (): Promise<void> => {
    const contentToCopy = validationResult?.formatted ?? yamlContent
    
    if (!contentToCopy.trim()) {
      toast.error('No YAML content to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(contentToCopy)
      toast.success('YAML content copied to clipboard!')
    } catch (error: unknown) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }, [validationResult, yamlContent])

  const handleDownloadYAML = useCallback((): void => {
    if (!yamlContent.trim()) {
      toast.error('No YAML content to download')
      return
    }

    const contentToDownload = validationResult?.formatted ?? yamlContent
    const blob = new Blob([contentToDownload], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'validated.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('YAML file downloaded!')
  }, [yamlContent, validationResult])

  const handleTextareaChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    setYamlContent(e.target.value)
  }, [])

  const getErrorIcon = useCallback((type: ValidationError['type']) => {
    const iconClass = "h-4 w-4"
    switch (type) {
      case 'syntax':
        return <AlertTriangle className={`${iconClass} text-red-500`} />
      case 'structure':
        return <AlertTriangle className={`${iconClass} text-orange-500`} />
      case 'format':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />
      default:
        return <AlertTriangle className={iconClass} />
    }
  }, [])

  const getErrorTypeColor = useCallback((type: ValidationError['type']): string => {
    switch (type) {
      case 'syntax':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'structure':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'format':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }, [])

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 space-y-6 ${className ?? ''}`}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">YAML Validator</h1>
        <p className="text-muted-foreground">
          Paste your YAML content below and validate it for syntax errors, structural issues, and formatting problems.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">YAML Input</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyYAML}
                variant="outline"
                size="sm"
                disabled={!yamlContent.trim()}
                type="button"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleDownloadYAML}
                variant="outline"
                size="sm"
                disabled={!yamlContent.trim()}
                type="button"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleValidation}
                disabled={!yamlContent.trim() || isValidating}
                type="button"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isValidating ? 'Validating...' : 'Validate YAML'}
              </Button>
            </div>
          </div>
          
          <Textarea
            placeholder="Paste your YAML content here..."
            value={yamlContent}
            onChange={handleTextareaChange}
            className="min-h-[300px] font-mono text-sm resize-y"
            style={{
              backgroundColor: highlightedLines.size > 0 ? 'rgb(254 242 242)' : undefined
            }}
            aria-label="YAML input textarea"
          />
        </div>

        <Separator />

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Validation Results</h2>
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>

            {validationResult.isValid ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">YAML is Valid! ✅</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your YAML content has been successfully validated with no errors found.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Found {validationResult.errors.length} error{validationResult.errors.length === 1 ? '' : 's'}:
                </div>
                
                <ScrollArea className="h-[300px] w-full">
                  <div className="space-y-3 pr-4">
                    {validationResult.errors.map((error, index) => (
                      <Alert key={`error-${index}`} className={getErrorTypeColor(error.type)}>
                        {getErrorIcon(error.type)}
                        <AlertTitle className="capitalize">
                          {error.type} Error (Line {error.line}, Column {error.column})
                        </AlertTitle>
                        <AlertDescription className="space-y-2">
                          <div>{error.message}</div>
                          {error.suggestion && (
                            <div className="text-sm font-medium">
                              💡 Suggestion: {error.suggestion}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {/* Formatted Output */}
        {validationResult?.isValid && validationResult.formatted && (
          <>
            <Separator />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Formatted YAML</h2>
              <ScrollArea className="h-[200px] w-full">
                <pre className="text-sm font-mono bg-gray-50 p-4 rounded-md overflow-x-auto">
                  {validationResult.formatted}
                </pre>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </div>
  )
}