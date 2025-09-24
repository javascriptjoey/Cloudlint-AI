import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { AppNavigation } from "@/components/app-navigation"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <AppNavigation />
        
        <main className="container mx-auto p-8 max-w-6xl">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">YAML Validator</h1>
              <p className="text-xl text-muted-foreground">
                Intelligent YAML validation and syntax checking
              </p>
            </div>
            
            {/* YAML Input Section */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  YAML Validation
                  <Badge variant="secondary">AI-Powered</Badge>
                </CardTitle>
                <CardDescription>
                  Paste your YAML content below for validation and syntax checking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="yaml-input" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    YAML Content
                  </label>
                  <textarea
                    id="yaml-input"
                    placeholder={`# Paste your YAML here for validation
apiVersion: v1
kind: ConfigMap
metadata:
  name: example-config
data:
  config.yaml: |
    database:
      host: localhost
      port: 5432
      name: myapp`}
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                    style={{
                      resize: 'vertical',
                      minHeight: '300px'
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Kubernetes</Badge>
                    <Badge variant="outline">Docker Compose</Badge>
                    <Badge variant="outline">GitHub Actions</Badge>
                    <Badge variant="outline">OpenAPI</Badge>
                  </div>
                  
                  <Button size="lg" className="px-8">
                    Validate YAML
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Info Section */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>YAML Validation Features</CardTitle>
                <CardDescription>
                  Comprehensive YAML validation with intelligent error detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Badge>Syntax Check</Badge>
                    <p className="text-sm text-muted-foreground">Validate YAML syntax</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Badge variant="secondary">Schema Validation</Badge>
                    <p className="text-sm text-muted-foreground">Check against schemas</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Badge variant="outline">Error Detection</Badge>
                    <p className="text-sm text-muted-foreground">Precise error locations</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Badge>Best Practices</Badge>
                    <p className="text-sm text-muted-foreground">YAML best practices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
