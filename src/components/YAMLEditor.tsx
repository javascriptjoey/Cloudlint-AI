import { useCallback, useEffect, useRef } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import { type ValidationError } from '@/lib/yaml-validator'

interface YAMLEditorProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly errors: readonly ValidationError[]
  readonly showWhitespace?: boolean
  readonly theme?: 'light' | 'dark'
  readonly className?: string
}

export function YAMLEditor({
  value,
  onChange,
  errors,
  showWhitespace = false,
  theme = 'light',
  className
}: YAMLEditorProps) {
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = useCallback((editor: any, monaco: Monaco) => {
    monacoRef.current = monaco
    editorRef.current = editor

    // Configure YAML language features
    monaco.languages.setLanguageConfiguration('yaml', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      folding: {
        offSide: true
      }
    })

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderWhitespace: showWhitespace ? 'all' : 'none',
      renderControlCharacters: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
      padding: { top: 16, bottom: 16 },
      suggest: {
        showKeywords: true,
        showSnippets: true
      }
    })

    // Add YAML syntax highlighting rules
    monaco.languages.setMonarchTokensProvider('yaml', {
      tokenizer: {
        root: [
          // Comments
          [/#.*$/, 'comment'],
          
          // Keys
          [/^(\s*)([\w.-]+)(\s*)(:)/, ['white', 'key', 'white', 'delimiter']],
          
          // Strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'], // unterminated string
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],
          
          // Numbers
          [/-?\d+(?:\.\d+)?([eE][+-]?\d+)?/, 'number'],
          
          // Booleans and null
          [/\b(true|false|null|~)\b/, 'constant'],
          
          // List markers
          [/^\s*-/, 'delimiter'],
          
          // Multiline indicators
          [/[|>][-+]?/, 'operator'],
          
          // Anchors and references
          [/&\w+/, 'type'],
          [/\*\w+/, 'type'],
          
          // Document separators
          [/^---/, 'delimiter'],
          [/^\.\.\./, 'delimiter']
        ],
        
        string_double: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ],
        
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, 'string', '@pop']
        ]
      }
    })
  }, [showWhitespace])

  // Update error markers when errors change
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return

    const monaco = monacoRef.current
    const editor = editorRef.current
    const model = editor.getModel()
    
    if (!model) return

    // Clear existing markers
    monaco.editor.setModelMarkers(model, 'yaml-validator', [])

    // Add new error markers
    const markers = errors.map(error => ({
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.column + 10, // Highlight a reasonable amount of text
      message: `${error.type.toUpperCase()}: ${error.message}${error.suggestion ? `\n💡 ${error.suggestion}` : ''}`,
      severity: error.type === 'syntax' 
        ? monaco.MarkerSeverity.Error
        : error.type === 'structure' 
        ? monaco.MarkerSeverity.Warning 
        : monaco.MarkerSeverity.Info,
      source: 'YAML Validator'
    }))

    monaco.editor.setModelMarkers(model, 'yaml-validator', markers)
  }, [errors])

  // Update whitespace visibility when prop changes
  useEffect(() => {
    if (!editorRef.current) return
    
    editorRef.current.updateOptions({
      renderWhitespace: showWhitespace ? 'all' : 'none'
    })
  }, [showWhitespace])

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }, [onChange])

  return (
    <div className={`border rounded-md overflow-hidden ${className ?? ''}`}>
      <Editor
        height="400px"
        defaultLanguage="yaml"
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false
          }
        }}
        loading={
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Loading YAML Editor...
            </div>
          </div>
        }
      />
    </div>
  )
}