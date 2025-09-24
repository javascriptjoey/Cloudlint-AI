import { useState, useCallback } from 'react'
import * as yaml from 'js-yaml'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  jsonOutput?: string
}

interface ErrorPattern {
  pattern: RegExp
  friendly: string
}

// Error patterns for user-friendly messages
const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /end of the stream or a document separator is expected/i,
    friendly: "Missing closing quote or bracket. Check that all quotes, brackets, and braces are properly closed."
  },
  {
    pattern: /unexpected end of stream/i,
    friendly: "The YAML file appears incomplete. Check if content was cut off or if quotes/brackets need to be closed."
  },
  {
    pattern: /mapping values are not allowed here/i,
    friendly: "Invalid colon placement. Make sure colons are only used for key-value pairs and check your indentation."
  },
  {
    pattern: /could not find expected ':'/i,
    friendly: "Missing colon after a key. Each key in YAML must be followed by a colon and space."
  },
  {
    pattern: /found character '\\t' that cannot start any token/i,
    friendly: "Tab characters are not allowed in YAML. Use spaces for indentation instead of tabs."
  },
  {
    pattern: /bad indentation of a mapping entry/i,
    friendly: "Indentation error detected. Check this line and the ones below - all keys at the same level (like 'name:', 'age:', 'email:') must be aligned with the same number of spaces."
  },
  {
    pattern: /found undefined tag/i,
    friendly: "Unknown YAML tag found. Remove or correct any custom tags that aren't standard YAML."
  },
  {
    pattern: /duplicated mapping key/i,
    friendly: "Duplicate key found. Each key in a YAML object must be unique."
  },
  {
    pattern: /expected <block end>/i,
    friendly: "Block structure not properly closed. Check your indentation and make sure nested items are properly aligned."
  }
]

export function useYamlValidation() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  // Convert technical YAML errors to user-friendly messages
  const makeErrorFriendly = useCallback((errorMessage: string): string => {
    // Check each pattern and return friendly message if found
    for (const { pattern, friendly } of ERROR_PATTERNS) {
      if (pattern.test(errorMessage)) {
        // Extract line/column info if available
        const lineMatch = errorMessage.match(/\((\d+):(\d+)\)/);
        const lineInfo = lineMatch ? ` (Around Line ${lineMatch[1]})` : '';
        return `${friendly}${lineInfo}`;
      }
    }

    // If no pattern matches, try to extract just the essential part
    const cleanError = errorMessage
      .replace(/^YAMLException:\s*/i, '')
      .replace(/\s*\(\d+:\d+\)$/, '')
      .replace(/\s*at line \d+, column \d+:?/i, '');

    // Extract line/column info if available  
    const lineMatch = errorMessage.match(/\((\d+):(\d+)\)/);
    const lineInfo = lineMatch ? ` (Around Line ${lineMatch[1]})` : '';

    return `${cleanError}${lineInfo}`;
  }, [])

  const validateYaml = useCallback((yamlContent: string) => {
    try {
      if (!yamlContent.trim()) {
        setValidationResult({
          isValid: false,
          errors: ['YAML content is empty']
        })
        return
      }

      // Parse YAML with strict error handling
      const parsed = yaml.load(yamlContent, { 
        onWarning: (warning) => {
          console.warn('YAML Warning:', warning)
        }
      })
      const jsonOutput = JSON.stringify(parsed, null, 2)
      
      setValidationResult({
        isValid: true,
        errors: [],
        jsonOutput
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Convert technical YAML error to user-friendly message
      const friendlyError = makeErrorFriendly(errorMessage)
      
      setValidationResult({
        isValid: false,
        errors: [friendlyError]
      })
    }
  }, [makeErrorFriendly])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  return {
    validationResult,
    validateYaml,
    clearValidation
  }
}