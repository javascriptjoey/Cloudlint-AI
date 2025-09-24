import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from "@/components/theme-provider"
import { AppNavigation } from "@/components/app-navigation"
import { YAMLValidator } from "@/components/YAMLValidator"
import { Toaster } from "sonner"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <AppNavigation />
        
        <main className="container mx-auto p-8 max-w-6xl">
          <YAMLValidator />
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          
          <div className="space-y-8 mt-8">
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
