import { load, type YAMLException } from 'js-yaml'

export interface ValidationError {
  readonly type: 'syntax' | 'structure' | 'format'
  readonly line: number
  readonly column: number
  readonly message: string
  readonly suggestion?: string
}

export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: readonly ValidationError[]
  readonly formatted?: string
  readonly originalYaml: string
}

export function validateYAML(yamlText: string): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    originalYaml: yamlText
  }

  // Check for empty input
  if (!yamlText.trim()) {
    return {
      ...result,
      errors: [{
        type: 'structure',
        line: 1,
        column: 1,
        message: 'YAML input is empty',
        suggestion: 'Please enter some YAML content to validate'
      }]
    }
  }

  try {
    // Parse YAML with unknown type for better type safety
    const parsed: unknown = load(yamlText)
    
    // If parsing succeeds, run additional structural checks
    const structuralErrors = checkStructuralIssues(yamlText, parsed)
    
    if (structuralErrors.length === 0) {
      return {
        ...result,
        isValid: true,
        errors: [],
        formatted: formatYAML(yamlText)
      }
    }
    
    return {
      ...result,
      errors: structuralErrors
    }
  } catch (error: unknown) {
    // Use proper type guards for error handling
    if (isYAMLException(error)) {
      return {
        ...result,
        errors: [{
          type: 'syntax',
          line: error.mark?.line ? error.mark.line + 1 : 1,
          column: error.mark?.column ? error.mark.column + 1 : 1,
          message: error.reason || 'YAML syntax error',
          suggestion: getSyntaxSuggestion(error.reason || '')
        }]
      }
    }
    
    return {
      ...result,
      errors: [{
        type: 'syntax',
        line: 1,
        column: 1,
        message: 'Unknown YAML parsing error',
        suggestion: 'Please check your YAML syntax'
      }]
    }
  }
}

// Type guard for YAMLException
function isYAMLException(error: unknown): error is YAMLException {
  return error instanceof Error && 
         'reason' in error && 
         'mark' in error
}

function checkStructuralIssues(yamlText: string, parsed: unknown): ValidationError[] {
  const errors: ValidationError[] = []
  const lines = yamlText.split('\n')

  // Check for common structural issues
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()

    // Check for tabs instead of spaces
    if (line.includes('\t')) {
      errors.push({
        type: 'format',
        line: lineNumber,
        column: line.indexOf('\t') + 1,
        message: 'YAML uses tabs instead of spaces for indentation',
        suggestion: 'Replace tabs with spaces (2 or 4 spaces recommended)'
      })
    }

    // Check for trailing whitespace
    if (line.length > 0 && line !== line.trimEnd()) {
      errors.push({
        type: 'format',
        line: lineNumber,
        column: line.trimEnd().length + 1,
        message: 'Line has trailing whitespace',
        suggestion: 'Remove trailing spaces and tabs'
      })
    }

    // Check for inconsistent indentation
    if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
      const indentation = line.length - line.trimStart().length
      if (indentation > 0 && indentation % 2 !== 0) {
        errors.push({
          type: 'format',
          line: lineNumber,
          column: 1,
          message: 'Inconsistent indentation (should be even number of spaces)',
          suggestion: 'Use consistent indentation (2 or 4 spaces)'
        })
      }
    }
  })

  // Check for duplicate keys at root level with proper type checking
  if (isRecord(parsed)) {
    errors.push(...checkDuplicateKeys(parsed, yamlText))
  }

  return errors
}

// Type guard for record objects
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && 
         value !== null && 
         !Array.isArray(value)
}

function checkDuplicateKeys(obj: Record<string, unknown>, yamlText: string): ValidationError[] {
  const errors: ValidationError[] = []
  // This is a simplified duplicate key check
  // In practice, js-yaml will throw an error for duplicates during parsing
  const keys = Object.keys(obj)
  const seen = new Set<string>()
  
  for (const key of keys) {
    if (seen.has(key)) {
      const lineNumber = findKeyLineNumber(key, yamlText)
      errors.push({
        type: 'structure',
        line: lineNumber,
        column: 1,
        message: `Duplicate key: "${key}"`,
        suggestion: 'Remove or rename the duplicate key'
      })
    }
    seen.add(key)
  }
  
  return errors
}

function findKeyLineNumber(key: string, yamlText: string): number {
  const lines = yamlText.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.trim().startsWith(`${key}:`)) {
      return i + 1
    }
  }
  return 1
}

function getSyntaxSuggestion(reason: string): string {
  if (reason.includes('indent')) {
    return 'Check your indentation - YAML uses spaces, not tabs'
  }
  if (reason.includes('mapping')) {
    return 'Check for missing colons (:) after keys'
  }
  if (reason.includes('sequence')) {
    return 'Check your list syntax - items should start with "- "'
  }
  if (reason.includes('quote') || reason.includes('string')) {
    return 'Check for unmatched quotes or special characters in strings'
  }
  return 'Please check your YAML syntax'
}

function formatYAML(yamlText: string): string {
  try {
    load(yamlText) // Validate the YAML structure
    // For now, return the original text
    // You could use a YAML formatter library here
    return yamlText.trim()
  } catch {
    return yamlText
  }
}

export function downloadYAML(content: string, filename = 'validated.yaml'): void {
  const blob = new Blob([content], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}