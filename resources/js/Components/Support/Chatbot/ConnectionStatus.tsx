import { useState, useEffect } from "react"
import { Badge } from "@/Components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/chatbot/suggestions`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
      setIsConnected(response.ok)
    } catch (error) {
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (isConnected === null) {
    return (
      <Badge variant="secondary" className="text-xs">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-1"></div>
        Connecting...
      </Badge>
    )
  }

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </>
      )}
    </Badge>
  )
}
