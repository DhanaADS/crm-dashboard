'use client'

import { useState } from "react"
import { InventoryItem } from "@/types/inventory"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

// Match Supabase schema exactly (excluding 'ID', which is auto-generated)
const initialFormState: Omit<InventoryItem, 'ID'> = {
  magazine: '',
  da: 0,
  price: '',
  traffic: '',
  indexed: '',
  category: '',
  dofollow: '',
  google_news: '',
  sponsored: '',
  cbd: '',
  casino: '',
  dating: '',
  crypto: '',
  contact: '',
  created_at: new Date().toISOString(),
  last_active_state: 'Active'
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
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const cleanCurrency = (val: string) => val.replace(/[^0-9.]/g, '')

  const handleSubmit = async () => {
    setLoading(true)

    const payload = {
      ...formData,
      price: cleanCurrency(formData.price),
      traffic: cleanCurrency(formData.traffic)
    }

    const { data, error } = await supabase
      .from('web_inventory')
      .insert([payload])
      .select()

    setLoading(false)

    if (error) {
      console.error("❌ Supabase insert error:", error)
      return
    }

    console.log("✅ Supabase insert success:", data)

    if (data && data[0]) {
      onAdd(data[0] as InventoryItem)
    }

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
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(initialFormState).map(([key]) => (
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
                  type={key === 'da' ? 'number' : 'text'}
                  value={formData[key as keyof typeof formData] as string | number}
                  onChange={e =>
                    handleChange(
                      key as keyof typeof formData,
                      key === 'da' ? Number(e.target.value) : e.target.value
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}