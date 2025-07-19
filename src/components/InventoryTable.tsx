'use client'

import { useState } from "react"
import { InventoryItem } from "@/types/inventory"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Download, XCircle, Eye, ArrowDown, ArrowUp, GripVertical } from "lucide-react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { Parser } from "json2csv"
import {
  DndContext,
  closestCenter,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AddInventoryItem from "@/components/AddInventoryItem"

interface InventoryTableProps {
  items: InventoryItem[]
  status: "idle" | "loading" | "success" | "error"
}

const allColumns = [
  "ID", "Magazine", "DA", "Price", "Traffic", "Indexed", "DoFollow", "Category",
  "Google News", "Sponsored", "CBD", "Casino", "Dating", "Crypto",
  "Contact", "Created", "Active"
]

const columnKeyMap: Record<string, keyof InventoryItem> = {
  "ID": "ID",
  "Magazine": "magazine",
  "DA": "da",
  "Price": "price",
  "Traffic": "traffic",
  "Indexed": "indexed",
  "DoFollow": "dofollow",
  "Category": "category",
  "Google News": "google_news",
  "Sponsored": "sponsored",
  "CBD": "cbd",
  "Casino": "casino",
  "Dating": "dating",
  "Crypto": "crypto",
  "Contact": "contact",
  "Created": "created_at",
  "Active": "last_active_state",
}

interface SortableHeaderProps {
  col: string
  onClick: () => void
  sorted: boolean
  direction: 'asc' | 'desc'
}

interface SortableHeaderProps {
  col: string
  onClick: () => void
  sorted: boolean
  direction: 'asc' | 'desc'
}

function SortableHeader({ col, onClick, sorted, direction }: SortableHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: col })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move'
  }
  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="text-center bg-muted whitespace-nowrap select-none"
    >
      <div className="flex items-center justify-center gap-1">
        <GripVertical className="w-3 h-3 opacity-50" />
        {col}
        {sorted && (direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </div>
    </TableHead>
  )
}

export default function InventoryTable({ items, status }: InventoryTableProps) {
  const [filters, setFilters] = useState({ minDA: '', category: '', sponsored: '', dofollow: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns])
  const [columnOrder, setColumnOrder] = useState<string[]>([...allColumns])
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem, direction: 'asc' | 'desc' } | null>(null)
  const [localItems, setLocalItems] = useState<InventoryItem[]>([])

  const handleChange = (field: string, value: string) => setFilters(prev => ({ ...prev, [field]: value }))
  const handleClearFilters = () => setFilters({ minDA: '', category: '', sponsored: '', dofollow: '' })
  const toggleColumn = (col: string) => setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])

  const handleSort = (key: keyof InventoryItem) => {
    if (sortConfig?.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      setSortConfig({ key, direction: 'asc' })
    }
  }

  const combinedItems = [...items, ...localItems]

  const filteredItems = combinedItems.filter(item => {
    const daPass = filters.minDA ? item.da >= parseInt(filters.minDA) : true
    const categoryPass = filters.category ? item.category?.toLowerCase().includes(filters.category.toLowerCase()) : true
    const sponsoredPass = filters.sponsored ? item.sponsored === filters.sponsored : true
    const dofollowPass = filters.dofollow ? item.dofollow === filters.dofollow : true
    const searchPass = searchTerm
      ? Object.values(item).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(searchTerm)
        )
      : true

    return daPass && categoryPass && sponsoredPass && dofollowPass && searchPass
  })

  const sortedItems = sortConfig ? [...filteredItems].sort((a, b) => {
    const valA = a[sortConfig.key]
    const valB = b[sortConfig.key]
    if (valA === valB) return 0
    const dir = sortConfig.direction === 'asc' ? 1 : -1
    return valA > valB ? dir : -dir
  }) : filteredItems

  const getExportData = () => {
    return sortedItems.map(item => {
      const row: Record<string, any> = {}
      columnOrder.forEach(col => {
        if (visibleColumns.includes(col)) {
          const key = columnKeyMap[col]
          row[col] = item[key]
        }
      })
      return row
    })
  }

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(getExportData())
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory")
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "inventory_export.xlsx")
  }

  const exportCSV = () => {
    const exportFields = columnOrder.filter(col => visibleColumns.includes(col))
    const parser = new Parser({ fields: exportFields })
    const csv = parser.parse(getExportData())
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "inventory_export.csv")
  }

  const sensors = useSensors(useSensor(MouseSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string)
        const newIndex = prev.indexOf(over?.id as string)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  if (status === "loading") return <p>Loading inventory...</p>
  if (status === "error") return <p className="text-red-500">Failed to load inventory</p>
  if (status === "success" && items.length === 0) return <p>No inventory items found</p>

  return (
    <div className="w-full">
      <Card className="w-full overflow-x-auto p-0 border border-border bg-card text-card-foreground shadow">

        {/* Filters + Actions */}
        <div className="flex flex-wrap items-end justify-between gap-6 p-4 border-b border-border bg-muted text-sm">
          <div className="flex gap-6 flex-wrap items-end">
            <div>
              <label className="block font-medium mb-1">Min DA</label>
              <input type="number" className="input" placeholder="e.g. 50" value={filters.minDA} onChange={(e) => handleChange('minDA', e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Category</label>
              <input type="text" className="input" placeholder="e.g. Tech" value={filters.category} onChange={(e) => handleChange('category', e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Sponsored</label>
              <select className="select" value={filters.sponsored} onChange={(e) => handleChange('sponsored', e.target.value)}>
                <option value="">All</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">DoFollow</label>
              <select className="select" value={filters.dofollow} onChange={(e) => handleChange('dofollow', e.target.value)}>
                <option value="">All</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
            </div>
            <div className="w-full flex justify-end sm:w-auto sm:ml-auto">
              <div>
                <label className="block font-medium mb-1 text-center">Search</label>
                <input
                  type="text"
                  className="input w-[250px]"
                  placeholder="Search..."
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <AddInventoryItem onAdd={(item) => setLocalItems(prev => [...prev, item])} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"><Eye className="w-4 h-4 mr-1" /> View Columns</Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <p className="text-sm font-semibold mb-2">Toggle Columns</p>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {allColumns.map(col => (
                    <div key={col} className="flex items-center gap-2">
                      <Checkbox checked={visibleColumns.includes(col)} onCheckedChange={() => toggleColumn(col)} id={`col-${col}`} />
                      <label htmlFor={`col-${col}`} className="text-sm">{col}</label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleClearFilters}><XCircle className="w-4 h-4 mr-1" /> Clear Filters</Button>
            <Button onClick={exportExcel}><Download className="w-4 h-4 mr-1" /> Excel</Button>
            <Button onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
          </div>
        </div>

        {/* Show Result Count */}
        <div className="px-4 py-2 text-sm border-b border-border bg-muted">
          Showing {sortedItems.length} result{sortedItems.length !== 1 && 's'}
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[70vh]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
              <Table className="bg-card">
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    {columnOrder.map(col => visibleColumns.includes(col) && (
                      <SortableHeader
                        key={col}
                        col={col}
                        onClick={() => handleSort(columnKeyMap[col])}
                        sorted={sortConfig?.key === columnKeyMap[col]}
                        direction={sortConfig?.direction}
                      />
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item, index) => (
                    <TableRow
                      key={item.ID || `inv-${index}`}
                      className="even:bg-muted/50 text-sm"
                    >
                      {columnOrder.map(col => visibleColumns.includes(col) && (
                        <TableCell key={col} className="text-center">
                          {col === 'Magazine' ? (
                            <a href={item.magazine} className="underline text-primary" target="_blank">
                              {item.magazine}
                            </a>
                          ) : (
                            String(item[columnKeyMap[col]] ?? '')
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        </div>
      </Card>
    </div>
  )
}