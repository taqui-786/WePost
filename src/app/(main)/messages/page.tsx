import { Card, CardContent } from '@/components/ui/card'
import { Send } from 'lucide-react'
import React from 'react'

async function page() {
  return (
    <div className="w-2/3 grid place-content-center">
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-6 py-8 text-center">
            <div className="bg-muted mb-3 flex h-24 w-24 items-center justify-center rounded-full">
            <Send className="text-muted-foreground h-12 w-12" />
            </div>
            <h4 className="mb-1 text-xl font-medium">Your messages</h4>
            <p className="text-muted-foreground mb-4 text-base">
              Select any user to start a chat.
            </p>
          </CardContent>
        </Card>
    </div>
  )
}

export default page