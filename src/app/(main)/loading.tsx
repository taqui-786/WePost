import { Loader2 } from 'lucide-react'
import React from 'react'

function Loading() {
  return (
   <main className="flex h-screen w-screen  items-center justify-center">
       <Loader2 className="text-primary mx-auto my-3 animate-spin" />
     </main>
  )
}

export default Loading