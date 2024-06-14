import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { IconGitHub } from './ui/icons'
import cn from 'mxcn'

export async function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1>
          <Link href="/" className="font-bold">
            <span
              aria-hidden="true"
              className="mr-1 select-none rounded-lg border border-muted-foreground/10 bg-muted px-[0.2rem] py-[0.1rem] text-sm font-bold shadow-2xl"
            >
              ⌘
            </span>
            Langbase
          </Link>
        </h1>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/LangbaseInc/langbase/tree/main/examples/chatbot"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="ml-2 hidden md:flex">GitHub</span>
        </a>
      </div>
    </header>
  )
}
