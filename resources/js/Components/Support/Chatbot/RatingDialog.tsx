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
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { chatbotApi } from "@/lib/chatbot-api"
// import { useToast } from "@/hooks/use-toast"

interface RatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string | null
  messageIndex: number | null
}

export function RatingDialog({ open, onOpenChange, conversationId, messageIndex }: RatingDialogProps) {
  const [rating, setRating] = useState<"helpful" | "not_helpful" | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const { toast } = useToast()

  const handleSubmit = async () => {
    if (!conversationId || messageIndex === null || !rating) return

    setIsSubmitting(true)
    try {
      await chatbotApi.rateResponse({
        conversation_id: conversationId,
        message_index: messageIndex,
        rating,
        feedback: feedback.trim() || undefined,
      })

      // toast({
      //   title: "Thank you for your feedback!",
      //   description: "Your rating helps us improve our service.",
      // })

      onOpenChange(false)
      setRating(null)
      setFeedback("")
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to submit rating. Please try again.",
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
          <DialogTitle>Rate this response</DialogTitle>
          <DialogDescription>Help us improve by rating how helpful this response was.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Was this response helpful?</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={rating === "helpful" ? "default" : "outline"}
                onClick={() => setRating("helpful")}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Helpful
              </Button>
              <Button
                variant={rating === "not_helpful" ? "default" : "outline"}
                onClick={() => setRating("not_helpful")}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Not Helpful
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="feedback" className="text-sm font-medium">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us how we can improve..."
              className="mt-1"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{feedback.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!rating || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
