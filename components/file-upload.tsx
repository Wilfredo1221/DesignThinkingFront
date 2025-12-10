"use client"

import { Upload, File, X } from 'lucide-react'
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function FileUpload({ label = "Archivos adjuntos" }: { label?: string }) {
  const [files, setFiles] = useState<string[]>([])

  const handleUpload = () => {
    // Simulate upload
    setFiles([...files, "documento_proyecto.pdf"])
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={handleUpload}>
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Haz clic para subir archivos</p>
          <p className="text-xs text-muted-foreground">PDF, PNG, JPG (Max 10MB)</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-primary" />
                <span>{file}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
