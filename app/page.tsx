"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Bike, Fuel, Shield } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  const roles = [
    {
      id: "rider",
      title: "Rider",
      description: "Upload and manage your documents",
      icon: Bike,
      color: "bg-accent text-accent-foreground",
      path: "/rider",
    },
    {
      id: "fuel-station",
      title: "Fuel Station",
      description: "Verify rider documents via QR scan",
      icon: Fuel,
      color: "bg-primary text-primary-foreground",
      path: "/fuel-station",
    },
    {
      id: "police",
      title: "Police Officer",
      description: "Verify documents and compliance",
      icon: Shield,
      color: "bg-secondary text-secondary-foreground",
      path: "/police",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Document Verification System</h1>
            <p className="text-muted-foreground text-lg">
              Secure digital document management and verification platform
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Select Your Role</h2>
            <p className="text-muted-foreground">Choose your role to access the appropriate verification tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const IconComponent = role.icon
              return (
                <Card
                  key={role.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => router.push(role.path)}
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-20 h-20 rounded-full ${role.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-10 h-10" />
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-3">{role.title}</h3>

                    <p className="text-muted-foreground mb-6 leading-relaxed">{role.description}</p>

                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(role.path)
                      }}
                    >
                      Access {role.title} Portal
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Features Section */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-8">Platform Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-card rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Secure Upload</h4>
                <p className="text-sm text-muted-foreground">End-to-end encrypted document storage</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">QR Verification</h4>
                <p className="text-sm text-muted-foreground">Instant document verification via QR codes</p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Real-time Sync</h4>
                <p className="text-sm text-muted-foreground">Live updates across all verification points</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
