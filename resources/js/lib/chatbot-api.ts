// API service for chatbot interactions
const API_BASE_URL = "http://localhost:8000"


export interface ChatRequest {
  message: string
  conversation_id?: string | null
  context?: Record<string, any>
}

export interface ChatResponse {
  conversation_id: string
  response: string
  intent: string
  suggestions: string[]
  actions: Array<{
    type: "link" | "action"
    label: string
    url?: string
    action?: string
  }>
  confidence: number
  requires_human: boolean
}

export interface RateRequest {
  conversation_id: string
  message_index: number
  rating: "helpful" | "not_helpful"
  feedback?: string
}

export interface TicketRequest {
  conversation_id: string
  title: string
  priority: "low" | "medium" | "high" | "urgent"
  category_id?: number
}

export interface EscalationRequest {
  conversation_id: string
  reason?: string
}

export interface Suggestion {
  text: string
  intent: string
  category: string
}

class ChatbotAPI {
  

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {    

    const url = `${API_BASE_URL}/support/chatbot${endpoint}`

    const response = await fetch(url, {
      credentials: "include", // Important for Laravel session/CSRF
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest", // Laravel AJAX header
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getConversation(conversationId: string) {
    return this.request(`/conversation?conversation_id=${conversationId}`)
  }

  async getSuggestions(): Promise<{ suggestions: Suggestion[] }> {
    return this.request<{ suggestions: Suggestion[] }>("/suggestions")
  }

  async rateResponse(data: RateRequest): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>("/rate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async createTicket(data: TicketRequest): Promise<{ success: boolean; ticket: any; message: string }> {
    return this.request<{ success: boolean; ticket: any; message: string }>("/create-ticket", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async escalateToHuman(
    data: EscalationRequest,
  ): Promise<{ success: boolean; message: string; escalation_id: string }> {
    return this.request<{ success: boolean; message: string; escalation_id: string }>("/escalate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const chatbotApi = new ChatbotAPI()
