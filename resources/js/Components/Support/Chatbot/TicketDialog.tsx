import React, { useState } from "react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import { chatbotApi } from "@/lib/chatbot-api"
import { useToast } from "@/hooks/use-toast"

interface TicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string | null
}

export function TicketDialog({ open, onOpenChange, conversationId }: TicketDialogProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const { toast } = useToast()

  const handleSubmit = async () => {
    if (!conversationId || !title.trim()) return

    setIsSubmitting(true)
    try {
      const response = await chatbotApi.createTicket({
        conversation_id: conversationId,
        title: title.trim(),
        priority,
        category_id: undefined, // Let AI categorize automatically
      })

      // toast({
      //   title: "Ticket created successfully!",
      //   description: `Your ticket #${response.ticket.id} has been created. You'll receive updates via email.`,
      // })

      onOpenChange(false)
      setTitle("")
      setPriority("medium")
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to create ticket. Please try again.",
      //   variant: "destructive",
      // })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Create a support ticket from this conversation. Our team will review it and get back to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Ticket Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your issue"
              className="mt-1"
              maxLength={255}
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="text-xs space-y-1">
              <li>• Your conversation will be included in the ticket</li>
              <li>• Our AI will automatically categorize your issue</li>
              <li>• You'll receive email updates on progress</li>
              <li>• A support agent will review and respond</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
