import { useState, useCallback } from 'react'

interface MonacoEditor {
  getValue(): string
  setValue(value: string): void
  setScrollTop(scrollTop: number): void
  setPosition(position: { lineNumber: number; column: number }): void
  focus(): void
  getModel(): any
  onDidFocusEditorWidget(callback: () => void): void
  onDidBlurEditorWidget(callback: () => void): void
}

export function useMonacoEditor() {
  const [monacoEditor, setMonacoEditor] = useState<MonacoEditor | null>(null)
  const [editorFocused, setEditorFocused] = useState<boolean>(false)

  const resetEditorScroll = useCallback(() => {
    if (monacoEditor) {
      setTimeout(() => {
        monacoEditor.setScrollTop(0)
        monacoEditor.setPosition({ lineNumber: 1, column: 1 })
        monacoEditor.focus()
      }, 50)
    }
  }, [monacoEditor])

  const clearEditor = useCallback(() => {
    if (monacoEditor) {
      const monaco = (window as any).monaco
      if (monaco) {
        monacoEditor.setValue('')
        monaco.editor.setModelMarkers(monacoEditor.getModel(), 'yamlValidator', [])
      }
    }
  }, [monacoEditor])

  const clearEditorMarkers = useCallback(() => {
    if (monacoEditor) {
      const monaco = (window as any).monaco
      if (monaco) {
        monaco.editor.setModelMarkers(monacoEditor.getModel(), 'yaml-validator', [])
      }
    }
  }, [monacoEditor])

  const handleEditorMount = useCallback((editor: MonacoEditor) => {
    setMonacoEditor(editor)
    // Ensure editor starts scrolled to top
    editor.setScrollTop(0)
    editor.setPosition({ lineNumber: 1, column: 1 })
    
    // Add focus/blur event handlers for visual feedback
    editor.onDidFocusEditorWidget(() => {
      setEditorFocused(true)
    })
    
    editor.onDidBlurEditorWidget(() => {
      setEditorFocused(false)
    })
    
    // Focus the editor to ensure cursor is visible
    setTimeout(() => editor.focus(), 100)
  }, [])

  return {
    monacoEditor,
    editorFocused,
    resetEditorScroll,
    clearEditor,
    clearEditorMarkers,
    handleEditorMount
  }
}