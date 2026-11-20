"use client"

import { useEffect, useState, useRef } from "react"
import {
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  FileText,
  Mic,
  MoreHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTypingChange?: (typing: boolean) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  onTypingChange,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingRef = useRef(false)
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  )

  const stopTyping = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    idleTimeoutRef.current = null
    if (!typingRef.current) return
    typingRef.current = false
    setIsTyping(false)
    onTypingChange?.(false)
  }

  useEffect(
    () => () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (typingRef.current) onTypingChange?.(false)
    },
    [onTypingChange],
  )

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      stopTyping()
      onSendMessage(trimmedMessage)
      setMessage("")

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }

    if (!value.trim()) {
      stopTyping()
      return
    }

    if (!typingRef.current) {
      typingRef.current = true
      setIsTyping(true)
      onTypingChange?.(true)
      heartbeatIntervalRef.current = setInterval(() => {
        onTypingChange?.(true)
      }, 3500)
    }

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    idleTimeoutRef.current = setTimeout(stopTyping, 1100)
  }

  const handleFileUpload = (type: "image" | "file") => {
    // In a real app, this would open a file picker
    console.log(`Upload ${type}`)
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-2">
        {/* Attachment button */}
        <TooltipProvider>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        className="cursor-pointer disabled:cursor-not-allowed"
                      />
                    }
                  />
                }
              >
                <Paperclip />
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach file</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleFileUpload("image")}
                  className="cursor-pointer"
                >
                  <ImageIcon />
                  Photo or video
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFileUpload("file")}
                  className="cursor-pointer"
                >
                  <FileText />
                  Document
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>

        {/* Message input */}
        <InputGroup className="flex-1">
          <InputGroupTextarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none cursor-text disabled:cursor-not-allowed"
            rows={1}
          />

          {/* Input action buttons */}
          <InputGroupAddon align="inline-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      size="icon-xs"
                      disabled={disabled}
                      className="cursor-pointer disabled:cursor-not-allowed"
                    />
                  }
                >
                  <Smile />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      size="icon-xs"
                      disabled={disabled}
                      className="cursor-pointer disabled:cursor-not-allowed"
                    />
                  }
                >
                  <MoreHorizontal />
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </InputGroupAddon>
        </InputGroup>

        {/* Voice message or send button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                message.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    disabled={disabled}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  />
                )
              }
            >
              {message.trim() ? <Send /> : <Mic />}
            </TooltipTrigger>
            <TooltipContent>
              <p>{message.trim() ? "Send message" : "Voice message"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Typing indicator */}
      {/* {isTyping && (
        <div className="text-xs text-muted-foreground mt-2">
          You are typing...
        </div>
      )} */}
    </div>
  )
}
