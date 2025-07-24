'use client'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function DeleteInventoryButton({
  id,
  onDeleted
}: {
  id: number
  onDeleted: (id: number) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    const { error } = await supabase.from('web_inventory').delete().eq('ID', id)

    if (error) {
      console.error('❌ Error deleting item:', error)
    } else {
      console.log(`✅ Deleted row ID: ${id}`)
      onDeleted(id)
    }

    setLoading(false)
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  )
}