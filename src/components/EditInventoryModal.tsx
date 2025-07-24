'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from '@/components/ui/button'

export default function EditInventoryModal({
  open,
  onClose,
  item,
  onSave
}: {
  open: boolean
  onClose: () => void
  item: any
  onSave: (updatedItem: any) => void
}) {
  const [form, setForm] = useState(item || {})

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSave(form)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">Edit Inventory Item</Dialog.Title>

          {/* Example fields (customize based on table) */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Magazine</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={form.magazine || ''}
                onChange={(e) => handleChange('magazine', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">DA</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={form.da || ''}
                onChange={(e) => handleChange('da', e.target.value)}
              />
            </div>
            {/* Add more fields as needed */}
          </div>

          <div className="flex justify-end mt-5 gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}