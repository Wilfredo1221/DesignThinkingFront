"use client"

import { ListingCard } from "@/components/listing-card"

const MY_PROJECTS = [
  {
    id: "1",
    type: "project" as const,
    title: "E-commerce Sostenible",
    status: "active" as const,
    progress: 65,
    publisher: "EcoStore Inc.",
    description:
      "Plataforma de comercio electrónico dedicada exclusivamente a productos sustentables y de bajo impacto ambiental. Buscamos desarrolladores comprometidos con el medio ambiente.",
    likes: 89,
    hashtags: ["React", "Node.js", "GreenTech"],
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    specs: {
      functionality: "Marketplace completo",
      budget: "$5,000 - $8,000",
      scalability: "Alta",
    },
  },
  {
    id: "3",
    type: "project" as const,
    title: "App de Meditación AI",
    status: "active" as const,
    progress: 30,
    publisher: "Mindful Tech",
    description:
      "Aplicación móvil que utiliza inteligencia artificial para generar sesiones de meditación personalizadas basadas en el estado de ánimo del usuario.",
    likes: 156,
    hashtags: ["Flutter", "Python", "AI"],
    startDate: "2025-02-01",
    endDate: "2025-08-15",
    specs: {
      functionality: "Generación de audio AI",
      budget: "$10,000+",
      scalability: "Media",
    },
  },
]

export default function MyProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Proyectos</h1>
        <p className="text-muted-foreground mt-2">Gestiona los proyectos en los que estás participando.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MY_PROJECTS.map((project) => (
          <ListingCard key={project.id} data={project} source="my-projects" />
        ))}
      </div>
    </div>
  )
}
