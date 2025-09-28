"use client"
import { useState, useRef } from "react"
import type React from "react"

export interface UseMessageComposerReturn {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleSendMessage: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export function useMessageComposer(onSendMessage: (content: string, file?: File) => void): UseMessageComposerReturn {
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setIsLoading(true)
      try {
        await onSendMessage(newMessage)
        setNewMessage("")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      try {
        await onSendMessage(file.name, file)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return {
    newMessage,
    setNewMessage,
    fileInputRef,
    handleSendMessage,
    handleFileUpload,
    handleKeyPress,
    isLoading,
  }
}
