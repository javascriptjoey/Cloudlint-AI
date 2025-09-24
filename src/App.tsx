import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Menu, Home, Info, Mail, Code } from 'lucide-react'
import { ModeToggle } from "@/components/mode-toggle"
import { TestYAMLValidator } from "./components/TestYAMLValidator"
import './index.css'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">AI-Powered YAML Validator</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional YAML validation with Monaco Editor, AI suggestions, and real-time feedback
              </p>
            </div>
            <TestYAMLValidator />
          </div>
        )
      case 'about':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl font-bold">About</h1>
            <div className="prose prose-lg dark:prose-invert">
              <p>
                This AI-powered YAML validator provides comprehensive validation and editing capabilities
                for YAML files. Built with modern web technologies and designed for developers.
              </p>
              <h2>Features</h2>
              <ul>
                <li>Monaco Editor with syntax highlighting</li>
                <li>Real-time YAML validation</li>
                <li>AI-powered suggestions and recommendations</li>
                <li>JSON conversion and export</li>
                <li>File import/export capabilities</li>
                <li>Search and replace functionality</li>
                <li>Validation history tracking</li>
                <li>Dark/light theme support</li>
                <li>Keyboard shortcuts for power users</li>
              </ul>
            </div>
          </div>
        )
      case 'contact':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-4xl font-bold">Contact</h1>
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Get in touch with us for support, feedback, or collaboration opportunities.
              </p>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">contact@yamlvalidator.dev</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold">GitHub</h3>
                  <p className="text-muted-foreground">github.com/cloudlint-ai/yaml-validator</p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CloudLint AI</span>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    <NavigationMenuLink
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer ${
                        activeSection === item.id ? 'bg-accent text-accent-foreground' : ''
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <ModeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Code className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">CloudLint AI</span>
                  </div>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 CloudLint AI. All rights reserved.
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 md:mt-0">
              Built with React, TypeScript, and shadcn/ui
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
