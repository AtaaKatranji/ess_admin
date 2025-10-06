'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, LayoutGrid, List } from 'lucide-react'
import { toast } from 'react-toastify'
import { useParams } from 'next/navigation'
import CovenantGridView from '@/app/components/CovenantGridView'
import CovenantTableView from '@/app/components/CovenantTableView'
import AddCovenantDialog from '@/app/components/AddCovenantDialog'

const BaseUrl = process.env.NEXT_PUBLIC_API_URL

export default function CovenantsPage() {
  const { slug } = useParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [covenants, setCovenants] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCovenants = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BaseUrl}/institutions/${slug}/covenants?q=${search}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch covenants')
      const data = await res.json()
      setCovenants(data.items || [])
    } catch (err) {
      console.error(err)
      toast.error('Error loading covenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCovenants()
  }, [search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Institution Covenants</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search covenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 md:w-64"
          />

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="grid" className="flex items-center gap-1 text-sm">
                <LayoutGrid className="w-4 h-4" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1 text-sm">
                <List className="w-4 h-4" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1">
            <PlusCircle className="w-4 h-4" /> Add Covenant
          </Button>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : covenants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No covenants found.</p>
        ) : viewMode === 'grid' ? (
          <CovenantGridView items={covenants} />
        ) : (
          <CovenantTableView items={covenants} />
        )}
      </div>

      {/* Add Dialog */}
      <AddCovenantDialog open={isAddOpen} onOpenChange={setIsAddOpen} onAdded={fetchCovenants} />
    </div>
  )
}
