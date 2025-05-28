import React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { ConnectionStatus } from '@/Components/Support/Chatbot/ConnectionStatus'
import { ErrorBoundary } from '@/Components/Support/Chatbot/ErrorBoundary'
import { ChatbotInterface } from '@/Components/Support/Chatbot/ChatbotInterface'
import { Head } from '@inertiajs/react'


export default function SupportChatbot() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Head title="Support Agent" />
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Assistant</h1>
                    <p className="text-gray-600">Get instant help with your questions and issues</p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    Chat Support
                                </CardTitle>
                                <CardDescription className="text-blue-100">
                                    Ask me anything about your account, billing, or technical issues
                                </CardDescription>
                            </div>
                            <ConnectionStatus />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ErrorBoundary>
                            <ChatbotInterface />
                        </ErrorBoundary>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}