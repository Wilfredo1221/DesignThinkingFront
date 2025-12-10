import { OrbitView } from "@/components/orbit-view"

export default function DetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-[calc(100vh-8rem)] w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-secondary/10 to-primary/5 border shadow-inner">
      <OrbitView id={params.id} />
    </div>
  )
}
