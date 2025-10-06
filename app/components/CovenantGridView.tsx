import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'

import { Covenant } from '@/app/types/Covenant'
interface CovenantGridViewProps {
  items: Covenant[]
}

export default function CovenantGridView({ items }: CovenantGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((cov) => (
        <Card
          key={cov.id}
          className="border border-border/40 hover:shadow-md transition duration-300 bg-muted/30"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground/90 truncate max-w-[80%]">
                {cov.name}
              </h3>
              <Badge
                variant="outline"
                className={
                  cov.status === 'available'
                    ? 'text-green-600 border-green-400'
                    : cov.status === 'assigned'
                    ? 'text-blue-600 border-blue-400'
                    : cov.status === 'maintenance'
                    ? 'text-yellow-600 border-yellow-400'
                    : cov.status === 'lost'
                    ? 'text-red-600 border-red-400'
                    : 'text-gray-500 border-gray-400'
                }
              >
                {cov.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground font-medium">Code:</span>{' '}
              <span className="font-semibold">{cov.code}</span>
            </p>
            {cov.category && (
              <p>
                <span className="text-muted-foreground font-medium">Category:</span>{' '}
                <span>{cov.category}</span>
              </p>
            )}
            {cov.location && (
              <p>
                <span className="text-muted-foreground font-medium">Location:</span>{' '}
                <span>{cov.location}</span>
              </p>
            )}

            <div className="pt-2">
              <Link href={`./covenants/${cov.id}`}>
                <Button size="sm" variant="outline" className="w-full flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
