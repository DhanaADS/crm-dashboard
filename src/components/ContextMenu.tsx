'use client'

import { Button } from "@/components/ui/button"

export default function ContextMenu({
  x,
  y,
  onEdit,
  onDelete,
  onClose,
}: {
  x: number
  y: number
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed z-50 bg-white shadow-lg border rounded w-40"
      style={{ top: y, left: x }}
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault()
        onClose()
      }}
      role="menu"
    >
      <ul className="divide-y">
        <li
          className="p-2 hover:bg-muted cursor-pointer text-sm"
          onClick={onEdit}
          role="menuitem"
        >
          ✏️ Edit
        </li>
        <li
          className="p-2 hover:bg-red-100 text-red-600 cursor-pointer text-sm"
          onClick={onDelete}
          role="menuitem"
        >
          🗑️ Delete
        </li>
      </ul>
    </div>
  )
}