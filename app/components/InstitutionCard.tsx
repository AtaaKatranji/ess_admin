import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InstitutionCardProps {
  name: string
  address: string
  onClick: () => void
  children?: React.ReactNode
}

export default function InstitutionCard({ name, address, onClick, children }: InstitutionCardProps) {
  return (
    <Card
  onClick={onClick}
  className="group relative overflow-hidden rounded-2xl border transition-colors cursor-pointer hover:bg-accent/40 p-0"
>
  {/* Pseudo-element to apply the background image with mask */}
  <div
    className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
    style={{
      backgroundImage: `url('https://img.freepik.com/premium-vector/school-seamless-pattern-with-one-color-elements_1299659-33.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      maskImage: `linear-gradient(to left, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0))`, // Applies a transparency gradient
      WebkitMaskImage: `linear-gradient(to left, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1),rgba(0, 0, 0, 0),rgba(0, 0, 0, 0))`, // Webkit compatibility
    }}
  />

  {/* Content inside the card */}
  <CardHeader className="relative z-10 px-4 py-3 sm:px-5 sm:py-4">
    <CardTitle className="flex items-center gap-2 sm:gap-3">
      
        {children}
        <span className="text-base sm:text-lg font-semibold" style={{ color: '#002E3BFF' }}>{name}</span>
      
    </CardTitle>
  </CardHeader>
  
  <CardContent className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
    <p className="text-sm text-muted-foreground">{address}</p>
  </CardContent>
</Card>

  )
}