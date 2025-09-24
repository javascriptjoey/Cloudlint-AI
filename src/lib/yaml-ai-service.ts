// AI Suggestion Service for YAML validation and improvements
import { load } from 'js-yaml'

export interface AISuggestion {
  readonly type: 'formatting' | 'naming' | 'best-practice' | 'logical' | 'security'
  readonly severity: 'info' | 'warning' | 'suggestion'
  readonly line?: number
  readonly column?: number
  readonly message: string
  readonly suggestion: string
  readonly improvedCode?: string
}

export interface AIAnalysisResult {
  readonly hasImprovements: boolean
  readonly suggestions: readonly AISuggestion[]
  readonly improvedYaml?: string
  readonly confidenceScore: number
}

export class YAMLAIService {
  private readonly openaiApiKey?: string

  constructor(apiKey?: string) {
    this.openaiApiKey = apiKey
  }

  /**
   * Analyze YAML content and provide AI-powered suggestions
   */
  async analyzeYAML(yamlContent: string): Promise<AIAnalysisResult> {
    try {
      // First, parse to ensure it's valid YAML
      const parsed = load(yamlContent)
      
      // Get rule-based suggestions (always available)
      const ruleBasedSuggestions = this.getRuleBasedSuggestions(yamlContent, parsed)
      
      // Get AI-powered suggestions if API key is available
      const aiSuggestions = this.openaiApiKey 
        ? await this.getAISuggestions(yamlContent, parsed)
        : []

      const allSuggestions = [...ruleBasedSuggestions, ...aiSuggestions]
      
      // Generate improved YAML if we have suggestions
      const improvedYaml = allSuggestions.length > 0 
        ? this.generateImprovedYaml(yamlContent, allSuggestions)
        : undefined

      return {
        hasImprovements: allSuggestions.length > 0,
        suggestions: allSuggestions,
        improvedYaml,
        confidenceScore: this.calculateConfidenceScore(allSuggestions)
      }
    } catch (error) {
      // If YAML is invalid, return empty suggestions
      return {
        hasImprovements: false,
        suggestions: [],
        confidenceScore: 0
      }
    }
  }

  /**
   * Rule-based suggestions (no API required)
   */
  private getRuleBasedSuggestions(yamlContent: string, parsed: unknown): AISuggestion[] {
    const suggestions: AISuggestion[] = []
    const lines = yamlContent.split('\n')

    // Check for formatting issues
    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Tab detection
      if (line.includes('\t')) {
        suggestions.push({
          type: 'formatting',
          severity: 'warning',
          line: lineNumber,
          column: line.indexOf('\t') + 1,
          message: 'Tabs detected in YAML indentation',
          suggestion: 'Use spaces instead of tabs for consistent indentation',
          improvedCode: line.replace(/\t/g, '  ')
        })
      }

      // Inconsistent indentation
      const indentation = line.length - line.trimStart().length
      if (indentation > 0 && indentation % 2 !== 0 && !line.trim().startsWith('#')) {
        suggestions.push({
          type: 'formatting',
          severity: 'suggestion',
          line: lineNumber,
          column: 1,
          message: 'Inconsistent indentation detected',
          suggestion: 'Use consistent 2-space or 4-space indentation throughout',
          improvedCode: '  '.repeat(Math.ceil(indentation / 2)) + line.trimStart()
        })
      }

      // Trailing whitespace
      if (line !== line.trimEnd() && line.trim().length > 0) {
        suggestions.push({
          type: 'formatting',
          severity: 'info',
          line: lineNumber,
          column: line.trimEnd().length + 1,
          message: 'Trailing whitespace found',
          suggestion: 'Remove trailing spaces for cleaner code',
          improvedCode: line.trimEnd()
        })
      }
    })

    // Check for naming conventions and best practices
    if (this.isRecord(parsed)) {
      this.checkNamingConventions(parsed, suggestions)
      this.checkBestPractices(parsed, suggestions, yamlContent)
    }

    return suggestions
  }

  /**
   * AI-powered suggestions using OpenAI API
   */
  private async getAISuggestions(yamlContent: string, parsed: unknown): Promise<AISuggestion[]> {
    if (!this.openaiApiKey) return []

    try {
      // This would integrate with OpenAI API
      // For demo purposes, returning mock AI suggestions
      return this.getMockAISuggestions(yamlContent, parsed)
    } catch (error) {
      console.warn('AI suggestions unavailable:', error)
      return []
    }
  }

  /**
   * Mock AI suggestions for demo (replace with actual OpenAI integration)
   */
  private getMockAISuggestions(yamlContent: string, parsed: unknown): AISuggestion[] {
    const suggestions: AISuggestion[] = []

    // Mock logical issue detection
    if (yamlContent.includes('port:') && yamlContent.includes('port: "')) {
      suggestions.push({
        type: 'logical',
        severity: 'warning',
        message: 'Port number appears to be a string',
        suggestion: 'Port numbers should typically be integers for proper parsing',
        improvedCode: yamlContent.replace(/port:\s*"(\d+)"/g, 'port: $1')
      })
    }

    // Mock security suggestions
    if (yamlContent.toLowerCase().includes('password') || yamlContent.toLowerCase().includes('secret')) {
      suggestions.push({
        type: 'security',
        severity: 'warning',
        message: 'Potential sensitive data detected',
        suggestion: 'Consider using environment variables or secret management for sensitive values',
        improvedCode: yamlContent.replace(/(password|secret):\s*"[^"]*"/gi, '$1: ${$1_FROM_ENV}')
      })
    }

    // Mock best practice suggestions
    if (this.isRecord(parsed) && Object.keys(parsed).length > 10) {
      suggestions.push({
        type: 'best-practice',
        severity: 'suggestion',
        message: 'Large configuration file detected',
        suggestion: 'Consider splitting large configurations into multiple files or using includes',
      })
    }

    return suggestions
  }

  /**
   * Check naming conventions in YAML keys
   */
  private checkNamingConventions(obj: Record<string, unknown>, suggestions: AISuggestion[], path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key

      // Check for camelCase in keys (suggest kebab-case or snake_case)
      if (/[a-z][A-Z]/.test(key)) {
        const kebabCase = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
        const snakeCase = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
        
        suggestions.push({
          type: 'naming',
          severity: 'suggestion',
          message: `camelCase key "${key}" detected`,
          suggestion: `Consider using kebab-case ("${kebabCase}") or snake_case ("${snakeCase}") for YAML keys`,
          improvedCode: `${kebabCase}: # or ${snakeCase}:`
        })
      }

      // Recursively check nested objects
      if (this.isRecord(value)) {
        this.checkNamingConventions(value, suggestions, currentPath)
      }
    }
  }

  /**
   * Check for YAML best practices
   */
  private checkBestPractices(obj: Record<string, unknown>, suggestions: AISuggestion[], yamlContent: string): void {
    // Check for missing version field (common in config files)
    if (!('version' in obj) && !('apiVersion' in obj)) {
      suggestions.push({
        type: 'best-practice',
        severity: 'suggestion',
        message: 'No version field found',
        suggestion: 'Consider adding a version field to track configuration schema versions',
        improvedCode: 'version: "1.0"\n' + yamlContent
      })
    }

    // Check for hardcoded URLs or IPs
    const urlRegex = /https?:\/\/[^\s"']+/g
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
    
    if (urlRegex.test(yamlContent) || ipRegex.test(yamlContent)) {
      suggestions.push({
        type: 'best-practice',
        severity: 'info',
        message: 'Hardcoded URLs or IP addresses detected',
        suggestion: 'Consider using environment variables for URLs and IP addresses to improve portability',
      })
    }
  }

  /**
   * Generate improved YAML based on suggestions
   */
  private generateImprovedYaml(original: string, suggestions: readonly AISuggestion[]): string {
    let improved = original

    // Apply code improvements from suggestions
    for (const suggestion of suggestions) {
      if (suggestion.improvedCode && suggestion.type === 'formatting') {
        // Apply line-specific improvements
        if (suggestion.line) {
          const lines = improved.split('\n')
          if (lines[suggestion.line - 1]) {
            lines[suggestion.line - 1] = suggestion.improvedCode
            improved = lines.join('\n')
          }
        }
      } else if (suggestion.improvedCode && suggestion.type !== 'formatting') {
        // Apply global improvements
        improved = suggestion.improvedCode
      }
    }

    return improved
  }

  /**
   * Calculate confidence score based on suggestions
   */
  private calculateConfidenceScore(suggestions: readonly AISuggestion[]): number {
    if (suggestions.length === 0) return 1.0

    const weights = {
      formatting: 0.8,
      naming: 0.6,
      'best-practice': 0.7,
      logical: 0.9,
      security: 0.95
    }

    const totalWeight = suggestions.reduce((sum, s) => sum + (weights[s.type] || 0.5), 0)
    const maxPossibleWeight = suggestions.length

    return Math.max(0.1, 1 - (totalWeight / maxPossibleWeight))
  }

  /**
   * Type guard for record objects
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && 
           value !== null && 
           !Array.isArray(value)
  }
}

// Default instance
export const yamlAI = new YAMLAIService(process.env.VITE_OPENAI_API_KEY)