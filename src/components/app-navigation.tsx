"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

const navigationItems = [
  {
    title: "Home",
    href: "#home",
    description: "Welcome to Cloudlint AI",
  },
  {
    title: "About", 
    href: "#about",
    description: "Learn more about our AI solutions",
  },
  {
    title: "Contact",
    href: "#contact", 
    description: "Get in touch with our team",
  },
]

export function AppNavigation() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          {/* Logo */}
          <a className="flex items-center space-x-3 ml-6" href="#home">
            <div className="relative flex items-center justify-center w-10 h-10">
              {/* Simple, reliable logo that will definitely show */}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center relative">
                {/* Code brackets */}
                <span className="text-primary-foreground font-bold text-lg select-none">&lt;/&gt;</span>
                {/* Small cloud indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent"></div>
              </div>
            </div>
            <span className="font-bold text-lg">
              Cloudlint AI
            </span>
          </a>
        </div>

        {/* Mobile Logo (visible on mobile) */}
        <div className="flex md:hidden ml-4">
          <a className="flex items-center space-x-2" href="#home">
            <div className="relative flex items-center justify-center w-8 h-8">
              {/* Simple mobile logo */}
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center relative">
                {/* Code brackets */}
                <span className="text-primary-foreground font-bold text-sm select-none">&lt;/&gt;</span>
                {/* Small cloud indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent"></div>
              </div>
            </div>
            <span className="font-bold text-base">Cloudlint AI</span>
          </a>
        </div>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other content can go here */}
          </div>
          
          {/* Desktop Navigation Links - Right Side */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </a>
            <a href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </a>
            <a href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </a>
          </div>
          
          {/* Theme Toggle and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <ModeToggle />
            
            {/* Mobile Navigation Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Cloudlint AI</SheetTitle>
                  <SheetDescription>
                    Navigate through our platform
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {navigationItems.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => setOpen(false)}
                    >
                      <div className="text-sm font-medium leading-none">
                        {item.title}
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}