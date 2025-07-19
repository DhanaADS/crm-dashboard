'use client'

import { useState } from "react"
import { InventoryItem } from "@/types/inventory"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialFormState: Omit<InventoryItem, 'ID'> = {
  magazine: '',
  da: 0,
  price: 0,
  traffic: 0,
  indexed: '',
  dofollow: '',
  category: '',
  google_news: '',
  sponsored: '',
  cbd: '',
  casino: '',
  dating: '',
  crypto: '',
  contact: '',
  created_at: new Date().toISOString(),
  last_active_state: ''
}

const yesNoFields = [
  "indexed", "dofollow", "google_news", "sponsored", "cbd", "casino", "dating", "crypto"
]

export default function AddInventoryItem({
  onAdd
}: {
  onAdd: (item: InventoryItem) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    const newItem: InventoryItem = {
      ID: Date.now(),
      ...formData
    }
    onAdd(newItem)
    setFormData(initialFormState)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Item</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <h2 className="text-lg font-semibold">Add New Inventory Item</h2>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(initialFormState).map(([key]) => {
            return (
              <div key={key}>
                <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                {yesNoFields.includes(key) ? (
                  <select
                    className="select w-full"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) =>
                      handleChange(key as keyof typeof formData, e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <Input
                    value={formData[key as keyof typeof formData]}
                    onChange={e =>
                      handleChange(
                        key as keyof typeof formData,
                        ["da", "price", "traffic"].includes(key)
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}