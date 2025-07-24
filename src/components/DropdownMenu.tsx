'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Pencil, Copy, Archive, Trash } from 'lucide-react'

export default function OptionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-sm font-medium px-4 py-2">
          Options
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-md p-1 w-48 z-50">
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
  <Pencil className="w-4 h-4" />
  Edit
</DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
          📄 Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
          🗂️ Archive
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md cursor-pointer">
          🗑️ Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}