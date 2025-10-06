import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'

import { Covenant } from '@/app/types/Covenant'

interface CovenantTableViewProps {
  items: Covenant[]
}

export default function CovenantTableView({ items }: CovenantTableViewProps) {
  const columns: ColumnDef<Covenant>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'code',
        header: 'Code',
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category || '—',
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => row.original.location || '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const color =
            status === 'available'
              ? 'text-green-600 border-green-400'
              : status === 'assigned'
              ? 'text-blue-600 border-blue-400'
              : status === 'maintenance'
              ? 'text-yellow-600 border-yellow-400'
              : status === 'lost'
              ? 'text-red-600 border-red-400'
              : 'text-gray-500 border-gray-400'
          return <Badge variant="outline" className={color}>{status}</Badge>
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Link href={`./covenants/${row.original.id}`}>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> View
            </Button>
          </Link>
        ),
      },
    ],
    []
  )

  return <DataTable columns={columns} data={items} />
}
