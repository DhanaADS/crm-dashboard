'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GmailAuthCard() {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Connect Gmail</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign in to link your Gmail account.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full">
          <span className="mr-2">📩</span> Connect Google
        </Button>
      </CardContent>
    </Card>
  )
}