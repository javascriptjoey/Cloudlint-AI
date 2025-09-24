import { type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { YAMLEditor } from '@/components/YAMLEditor'
import { type AISuggestion } from '@/lib/yaml-ai-service'
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  Shield, 
  Code2,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react'

interface YAMLResultsPanelProps {
  readonly originalYaml: string
  readonly isValid: boolean
  readonly suggestions: readonly AISuggestion[]
  readonly improvedYaml?: string
  readonly jsonOutput?: string
  readonly showWhitespace: boolean
  readonly theme: 'light' | 'dark'
  readonly onCopy: (content: string, type: string) => Promise<void>
  readonly onDownload: (content: string, filename: string, type: 'yaml' | 'json') => void
  readonly onApplyImprovement: (improvedYaml: string) => void
}

export function YAMLResultsPanel({
  originalYaml,
  isValid,
  suggestions,
  improvedYaml,
  jsonOutput,
  showWhitespace,
  theme,
  onCopy,
  onDownload,
  onApplyImprovement
}: YAMLResultsPanelProps) {
  const getSuggestionIcon = (suggestion: AISuggestion): ReactNode => {
    switch (suggestion.type) {
      case 'formatting':
        return <Code2 className="h-4 w-4 text-blue-500" />
      case 'naming':
        return <Code2 className="h-4 w-4 text-purple-500" />
      case 'best-practice':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'logical':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSuggestionBadgeVariant = (severity: AISuggestion['severity']) => {
    switch (severity) {
      case 'warning':
        return 'destructive' as const
      case 'info':
        return 'secondary' as const
      case 'suggestion':
        return 'outline' as const
      default:
        return 'secondary' as const
    }
  }

  const totalSuggestions = suggestions.length
  const criticalSuggestions = suggestions.filter(s => s.severity === 'warning').length

  return (
    <div className="w-full">
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions" className="relative">
            AI Suggestions
            {totalSuggestions > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {totalSuggestions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="improvements" disabled={!improvedYaml}>
            Improvements
            {criticalSuggestions > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                {criticalSuggestions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="conversion" disabled={!isValid}>
            JSON Output
          </TabsTrigger>
        </TabsList>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Analysis Results</h3>
              {isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Valid YAML</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">Invalid YAML</span>
                </div>
              )}
            </div>

            {suggestions.length === 0 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Perfect YAML! ✨</AlertTitle>
                <AlertDescription className="text-green-700">
                  No improvements suggested. Your YAML follows best practices.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3 pr-4">
                  {suggestions.map((suggestion, index) => (
                    <Alert key={`suggestion-${index}`} className="relative">
                      <div className="flex items-start gap-3">
                        {getSuggestionIcon(suggestion)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTitle className="capitalize">
                              {suggestion.type.replace('-', ' ')} Issue
                            </AlertTitle>
                            <Badge variant={getSuggestionBadgeVariant(suggestion.severity)}>
                              {suggestion.severity}
                            </Badge>
                            {suggestion.line && (
                              <Badge variant="outline" className="text-xs">
                                Line {suggestion.line}
                              </Badge>
                            )}
                          </div>
                          <AlertDescription className="space-y-2">
                            <div className="text-sm">{suggestion.message}</div>
                            <div className="text-sm font-medium text-blue-600">
                              💡 {suggestion.suggestion}
                            </div>
                            {suggestion.improvedCode && (
                              <pre className="text-xs bg-gray-100 p-2 rounded border overflow-x-auto">
                                {suggestion.improvedCode}
                              </pre>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI-Improved YAML</h3>
              <div className="flex gap-2">
                {improvedYaml && (
                  <>
                    <Button
                      onClick={() => onCopy(improvedYaml, 'improved YAML')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => onDownload(improvedYaml, 'improved', 'yaml')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => onApplyImprovement(improvedYaml)}
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Apply Changes
                    </Button>
                  </>
                )}
              </div>
            </div>

            {improvedYaml ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Original YAML</h4>
                  <YAMLEditor
                    value={originalYaml}
                    onChange={() => {}} // Read-only
                    errors={[]}
                    showWhitespace={showWhitespace}
                    theme={theme}
                    className="h-[350px]"
                  />
                </div>

                {/* Improved */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">AI-Improved YAML</h4>
                  <YAMLEditor
                    value={improvedYaml}
                    onChange={() => {}} // Read-only
                    errors={[]}
                    showWhitespace={showWhitespace}
                    theme={theme}
                    className="h-[350px]"
                  />
                </div>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No improvements available</AlertTitle>
                <AlertDescription>
                  Your YAML is already well-formatted, or improvements are not applicable.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* JSON Conversion Tab */}
        <TabsContent value="conversion" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">JSON Output</h3>
              <div className="flex gap-2">
                {jsonOutput && (
                  <>
                    <Button
                      onClick={() => onCopy(jsonOutput, 'JSON')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                    <Button
                      onClick={() => onDownload(jsonOutput, 'converted', 'json')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON
                    </Button>
                  </>
                )}
              </div>
            </div>

            {jsonOutput ? (
              <ScrollArea className="h-[400px] w-full">
                <pre className="text-sm font-mono bg-gray-50 p-4 rounded-md overflow-x-auto border">
                  {jsonOutput}
                </pre>
              </ScrollArea>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>JSON conversion not available</AlertTitle>
                <AlertDescription>
                  Please validate your YAML first to enable JSON conversion.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}