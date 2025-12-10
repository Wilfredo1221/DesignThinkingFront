"use client"

import { useState } from "react"
import { Search, MoreVertical, Phone, Video, Paperclip, Smile, Send } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const CHATS = [
  { id: 1, name: "Ana García", lastMessage: "¡Me encanta tu propuesta!", time: "10:30 AM", unread: 2, avatar: "AG" },
  { id: 2, name: "Banco Futuro", lastMessage: "Hemos revisado los documentos...", time: "Ayer", unread: 0, avatar: "BF" },
  { id: 3, name: "Carlos Ruiz", lastMessage: "¿Cuándo es la fecha límite?", time: "Ayer", unread: 0, avatar: "CR" },
]

const MESSAGES = [
  { id: 1, text: "Hola Juan, vi tu propuesta para el reto de banca.", sender: "them", time: "10:00 AM" },
  { id: 2, text: "¡Hola Ana! Gracias, ¿qué te pareció?", sender: "me", time: "10:05 AM" },
  { id: 3, text: "Me encanta el enfoque minimalista. Creo que tiene mucho potencial.", sender: "them", time: "10:15 AM" },
  { id: 4, text: "¡Me encanta tu propuesta!", sender: "them", time: "10:30 AM" },
]

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1)

  return (
    <div className="h-[calc(100vh-8rem)] bg-card border rounded-3xl overflow-hidden flex shadow-sm">
      {/* Chat List */}
      <div className="w-80 border-r flex flex-col bg-secondary/10">
        <div className="p-4 border-b space-y-4">
          <h2 className="text-xl font-bold px-2">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar chat..." className="pl-9 bg-background rounded-xl border-none shadow-sm" />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {CHATS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "w-full p-3 flex items-center gap-3 rounded-xl transition-all hover:bg-background/50",
                  selectedChat === chat.id ? "bg-background shadow-sm" : ""
                )}
              >
                <Avatar>
                  <AvatarFallback>{chat.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-bold">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">Ana García</h3>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                En línea
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6 bg-secondary/5">
          <div className="space-y-4">
            {MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.sender === "me" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] p-4 rounded-2xl shadow-sm",
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card text-foreground rounded-tl-none"
                  )}
                >
                  <p>{msg.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1 text-right opacity-70",
                    msg.sender === "me" ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-2xl">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input 
              placeholder="Escribe un mensaje..." 
              className="border-none bg-transparent shadow-none focus-visible:ring-0" 
            />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Smile className="w-5 h-5" />
            </Button>
            <Button size="icon" className="rounded-xl shadow-lg shadow-primary/20">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
