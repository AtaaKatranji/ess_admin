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
  className="cursor-pointer border hover:bg-accent transition-colors relative overflow-hidden"
>
  {/* Pseudo-element to apply the background image with mask */}
  <div
    className="absolute inset-0 z-0 pointer-events-none"
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
  <CardHeader className="relative z-10">
    <CardTitle className="flex items-center justify-start space-x-10">
      <div className="flex items-center">
        {children}
        <span className="ml-2" style={{ color: '#002E3BFF' }}>{name}</span>
      </div>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="relative z-10">
    <p className="text-sm text-muted-foreground">{address}</p>
  </CardContent>
</Card>

  )
}