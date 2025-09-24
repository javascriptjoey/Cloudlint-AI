import { useCallback } from 'react'

export function useFileOperations() {
  const downloadYAML = useCallback((yamlContent: string) => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const downloadJSON = useCallback((jsonContent: string) => {
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const handleFileUpload = useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
    onContentLoaded: (content: string) => void
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const isYamlFile = file.type === 'text/yaml' || 
                      file.type === 'application/x-yaml' || 
                      file.name.endsWith('.yaml') || 
                      file.name.endsWith('.yml')
    
    if (isYamlFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onContentLoaded(content)
      }
      reader.readAsText(file)
    }
    
    // Reset the input so the same file can be uploaded again
    event.target.value = ''
  }, [])

  return {
    downloadYAML,
    downloadJSON,
    handleFileUpload
  }
}