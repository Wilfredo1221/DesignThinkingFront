"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Heart, Hash, ArrowRight, Users, DollarSign, Activity, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ListingData {
  id: string
  type: "challenge" | "project"
  title: string
  status: "active" | "completed"
  progress: number
  publisher: string
  description: string
  likes: number
  hashtags: string[]
  startDate: string
  endDate: string
  specs?: {
    functionality?: string
    budget?: string
    scalability?: string
  }
}

export function ListingCard({ data, source }: { data: ListingData; source?: string }) {
  const [isJoined, setIsJoined] = useState(false)
  const [showCheckAnimation, setShowCheckAnimation] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleJoin = () => {
    setShowCheckAnimation(true)
    setTimeout(() => {
      setIsJoined(true)
      setShowCheckAnimation(false)
    }, 800)
  }

  return (
    <motion.div layout transition={{ duration: 0.3, type: "spring", stiffness: 100 }}>
      <Card className="overflow-hidden border-none shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow bg-card/50 backdrop-blur-sm relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-primary"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Info className="w-5 h-5" />
        </Button>

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 pr-8">
            <div>
              <Badge
                variant="secondary"
                className={
                  data.status === "active"
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    : "bg-muted text-muted-foreground"
                }
              >
                {data.status === "active" ? "Activo" : "Completado"}
              </Badge>
              <h3 className="text-xl font-bold mt-2 leading-tight">{data.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">por {data.publisher}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{data.progress}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={data.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">Progreso</p>
          </div>

          <div className="space-y-4 pt-2">
            <p className={cn("text-sm text-muted-foreground leading-relaxed", !showDetails && "line-clamp-3")}>
              {data.description}
            </p>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-background/50">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-xs">Finaliza:</span>
                      <span className="font-medium text-foreground">{data.endDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>{data.likes} Likes</span>
                  </div>
                </div>

                {data.type === "project" && data.specs && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      Funcionalidad: {data.specs.functionality}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      {data.specs.budget}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {data.type === "project" && (
              <div className="relative flex-1">
                <Button
                  onClick={handleJoin}
                  disabled={isJoined}
                  className="w-full relative overflow-hidden"
                  variant={isJoined ? "secondary" : "default"}
                >
                  <span className={isJoined ? "opacity-100" : "opacity-100"}>
                    {isJoined ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Unido
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Unirme al Proyecto
                      </>
                    )}
                  </span>
                </Button>

                <AnimatePresence>
                  {showCheckAnimation && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-green-500 rounded-full p-3">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <Link
              href={
                data.type === "project"
                  ? `/dashboard/project/${data.id}${source ? `?source=${source}` : ""}`
                  : `/dashboard/details/${data.id}`
              }
              className={data.type === "project" ? "flex-1" : "w-full"}
            >
              <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-none hover:shadow-lg hover:shadow-primary/20 transition-all">
                Ver Detalles <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
