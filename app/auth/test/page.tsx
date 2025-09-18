"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    console.log("[v0] Auth test - checking user")
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    console.log("[v0] Auth test - user result:", { user, error })
    setUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    console.log("[v0] Auth test - logging out")
    const { error } = await supabase.auth.signOut()
    console.log("[v0] Auth test - logout result:", { error })
    setUser(null)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div>
              <p className="text-green-600">✅ User is logged in</p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-red-600">❌ No user logged in</p>
              <div className="space-x-2">
                <Button onClick={() => (window.location.href = "/auth/login")}>Go to Login</Button>
                <Button onClick={() => (window.location.href = "/auth/sign-up")} variant="outline">
                  Go to Sign Up
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
