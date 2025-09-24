import { load, dump } from 'js-yaml'

export interface ConversionResult {
  readonly success: boolean
  readonly result?: string
  readonly error?: string
}

export interface ConversionOptions {
  readonly indent?: number
  readonly skipInvalid?: boolean
  readonly flowLevel?: number
  readonly sortKeys?: boolean
}

export class YAMLJSONConverter {
  /**
   * Convert YAML to JSON
   */
  static yamlToJSON(yamlContent: string, options: ConversionOptions = {}): ConversionResult {
    try {
      if (!yamlContent.trim()) {
        return {
          success: false,
          error: 'Input YAML is empty'
        }
      }

      // Parse YAML
      const parsed = load(yamlContent)
      
      if (parsed === undefined) {
        return {
          success: false,
          error: 'YAML content is empty or invalid'
        }
      }

      // Convert to JSON with formatting
      const jsonString = JSON.stringify(
        parsed,
        options.sortKeys ? Object.keys(parsed as object).sort() : null,
        options.indent ?? 2
      )

      return {
        success: true,
        result: jsonString
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      }
    }
  }

  /**
   * Convert JSON to YAML
   */
  static jsonToYAML(jsonContent: string, options: ConversionOptions = {}): ConversionResult {
    try {
      if (!jsonContent.trim()) {
        return {
          success: false,
          error: 'Input JSON is empty'
        }
      }

      // Parse JSON
      const parsed = JSON.parse(jsonContent)

      // Convert to YAML with formatting options
      const yamlString = dump(parsed, {
        indent: options.indent ?? 2,
        skipInvalid: options.skipInvalid ?? false,
        flowLevel: options.flowLevel ?? -1,
        sortKeys: options.sortKeys ?? false,
        lineWidth: 80,
        noRefs: false,
        noCompatMode: false,
        condenseFlow: false,
        quotingType: '"',
        forceQuotes: false
      })

      return {
        success: true,
        result: yamlString
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      }
    }
  }

  /**
   * Validate and format YAML
   */
  static formatYAML(yamlContent: string, options: ConversionOptions = {}): ConversionResult {
    try {
      // Parse and re-dump to format
      const parsed = load(yamlContent)
      
      if (parsed === undefined) {
        return {
          success: false,
          error: 'YAML content is empty or invalid'
        }
      }

      const formatted = dump(parsed, {
        indent: options.indent ?? 2,
        skipInvalid: options.skipInvalid ?? false,
        flowLevel: options.flowLevel ?? -1,
        sortKeys: options.sortKeys ?? false,
        lineWidth: 80,
        noRefs: false,
        noCompatMode: false,
        condenseFlow: false,
        quotingType: '"',
        forceQuotes: false
      })

      return {
        success: true,
        result: formatted
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to format YAML'
      }
    }
  }

  /**
   * Minify YAML (remove extra whitespace and comments)
   */
  static minifyYAML(yamlContent: string): ConversionResult {
    return this.formatYAML(yamlContent, {
      indent: 0,
      flowLevel: 0,
      skipInvalid: true
    })
  }

  /**
   * Check if content is valid JSON
   */
  static isValidJSON(content: string): boolean {
    try {
      JSON.parse(content)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if content is valid YAML
   */
  static isValidYAML(content: string): boolean {
    try {
      load(content)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get file extension based on content type
   */
  static getFileExtension(contentType: 'yaml' | 'json'): string {
    return contentType === 'yaml' ? '.yaml' : '.json'
  }

  /**
   * Get MIME type based on content type
   */
  static getMimeType(contentType: 'yaml' | 'json'): string {
    return contentType === 'yaml' ? 'text/yaml' : 'application/json'
  }

  /**
   * Download converted content as file
   */
  static downloadFile(
    content: string, 
    filename: string, 
    contentType: 'yaml' | 'json'
  ): void {
    const blob = new Blob([content], { type: this.getMimeType(contentType) })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename + this.getFileExtension(contentType)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Copy content to clipboard
   */
  static async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Detect content type from string
   */
  static detectContentType(content: string): 'yaml' | 'json' | 'unknown' {
    const trimmed = content.trim()
    
    // Check for JSON indicators
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return this.isValidJSON(trimmed) ? 'json' : 'unknown'
    }
    
    // Check for YAML indicators
    if (trimmed.includes(':') || trimmed.includes('-') || trimmed.startsWith('---')) {
      return this.isValidYAML(trimmed) ? 'yaml' : 'unknown'
    }
    
    return 'unknown'
  }

  /**
   * Batch convert multiple YAML/JSON files
   */
  static batchConvert(
    files: Array<{ name: string; content: string; type: 'yaml' | 'json' }>,
    targetType: 'yaml' | 'json'
  ): Array<{ name: string; result: ConversionResult }> {
    return files.map(file => ({
      name: file.name,
      result: file.type === 'yaml' 
        ? (targetType === 'json' ? this.yamlToJSON(file.content) : this.formatYAML(file.content))
        : (targetType === 'yaml' ? this.jsonToYAML(file.content) : { success: true, result: file.content })
    }))
  }
}