import { cn } from '@/lib/utils'
import React from 'react'

// THIS IS A GLOBAL CONTAINER 
 function Container({children, className}: {children: React.ReactNode, className?: string}) {
  return (
    <div>
      {/*The cn join the classes, in this case if i dont provide anythin' only will use the default if i provide a className will use both */}
      <div className={cn("mx-auto max-w-6xl xl:max-w-7xl px-8", className)}>{children}</div>
    </div>
  )
}


export default Container