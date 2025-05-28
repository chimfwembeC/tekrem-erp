import React,{ useState } from "react"
import { Button } from "@/Components/ui/button"
import { Textarea } from "@/Components/ui/textarea"
import { Label } from "@/Components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { chatbotApi } from "@/lib/chatbot-api"
// import { useToast } from "@/hooks/use-toast"

interface EscalationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string | null
}

export function EscalationDialog({ open, onOpenChange, conversationId }: EscalationDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const { toast } = useToast()

  const handleSubmit = async () => {
    if (!conversationId) return

    setIsSubmitting(true)
    try {
      await chatbotApi.escalateToHuman({
        conversation_id: conversationId,
        reason: reason.trim() || undefined,
      })

      // toast({
      //   title: "Escalated to human agent",
      //   description: "A human agent will join this conversation shortly. Please wait for assistance.",
      // })

      onOpenChange(false)
      setReason("")
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to escalate conversation. Please try again.",
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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Connect with Human Agent
          </DialogTitle>
          <DialogDescription>
            We'll connect you with a human agent who can provide more personalized assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for escalation (optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let us know why you need human assistance..."
              className="mt-1"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p className="font-medium mb-1">What to expect:</p>
            <ul className="text-xs space-y-1">
              <li>• A human agent will review your conversation</li>
              <li>• Response time: typically 5-15 minutes</li>
              <li>• You'll be notified when an agent joins</li>
              <li>• Your conversation history will be preserved</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Connecting..." : "Connect with Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
