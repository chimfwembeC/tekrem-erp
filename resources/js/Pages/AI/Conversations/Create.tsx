import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import { 
    MessageSquare, 
    Bot, 
    ArrowLeft,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';

interface AIModel {
    id: number;
    name: string;
    type: string;
    service: {
        id: number;
        name: string;
        provider: string;
    };
}

interface Props {
    models: AIModel[];
    contextTypes: string[];
}

interface FormData {
    title: string;
    ai_model_id: string;
    context_type: string;
    context_id: string;
    initial_message: string;
    metadata: Record<string, any>;
}

export default function Create({ models, contextTypes }: Props) {
    const { t } = useTranslate();
    const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        title: '',
        ai_model_id: '',
        context_type: '',
        context_id: '',
        initial_message: '',
        metadata: {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ai.conversations.store'));
    };

    const handleModelChange = (modelId: string) => {
        setData('ai_model_id', modelId);
        const model = models.find(m => m.id.toString() === modelId);
        setSelectedModel(model || null);
    };

    const getContextTypeColor = (contextType: string) => {
        const colors = {
            crm: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            general: 'bg-gray-100 text-gray-800',
        };
        return colors[contextType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout
            title={t('Create AI Conversation')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('Back')}
                        </Button>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {t('Create AI Conversation')}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('Start a new conversation with an AI model')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        >
            <Head title={t('Create AI Conversation')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Main Form Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    {t('Conversation Details')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Configure your new AI conversation settings')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">{t('Conversation Title')} *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder={t('Enter a descriptive title for this conversation')}
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* AI Model Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="ai_model_id">{t('AI Model')} *</Label>
                                    <Select value={data.ai_model_id} onValueChange={handleModelChange}>
                                        <SelectTrigger className={errors.ai_model_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t('Select an AI model')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {models.map((model) => (
                                                <SelectItem key={model.id} value={model.id.toString()}>
                                                    <div className="flex items-center space-x-2">
                                                        <Bot className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{model.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {model.service.name} • {model.type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ai_model_id && (
                                        <p className="text-sm text-red-600">{errors.ai_model_id}</p>
                                    )}
                                    
                                    {/* Model Info */}
                                    {selectedModel && (
                                        <Alert>
                                            <Bot className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>{selectedModel.name}</strong> - {selectedModel.service.name} ({selectedModel.service.provider})
                                                <br />
                                                <span className="text-sm text-gray-600">
                                                    Type: {selectedModel.type.charAt(0).toUpperCase() + selectedModel.type.slice(1)}
                                                </span>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Context Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="context_type">{t('Context Type')}</Label>
                                    <Select value={data.context_type} onValueChange={(value) => setData('context_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select context type (optional)')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t('No Context')}</SelectItem>
                                            {contextTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${getContextTypeColor(type)}`}>
                                                            {type.toUpperCase()}
                                                        </span>
                                                        <span className="capitalize">{type}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-gray-600">
                                        {t('Context helps the AI understand the domain of your conversation')}
                                    </p>
                                </div>

                                {/* Context ID */}
                                {data.context_type && data.context_type !== 'none' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="context_id">{t('Context ID')}</Label>
                                        <Input
                                            id="context_id"
                                            type="number"
                                            value={data.context_id}
                                            onChange={(e) => setData('context_id', e.target.value)}
                                            placeholder={t('Enter related record ID (optional)')}
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Link this conversation to a specific record in the selected context')}
                                        </p>
                                    </div>
                                )}

                                {/* Initial Message */}
                                <div className="space-y-2">
                                    <Label htmlFor="initial_message">{t('Initial Message')}</Label>
                                    <Textarea
                                        id="initial_message"
                                        value={data.initial_message}
                                        onChange={(e) => setData('initial_message', e.target.value)}
                                        placeholder={t('Start the conversation with an initial message (optional)')}
                                        rows={4}
                                        className="resize-none"
                                    />
                                    <p className="text-sm text-gray-600">
                                        {t('This message will be sent immediately after creating the conversation')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                {t('Cancel')}
                            </Button>
                            
                            <div className="flex items-center space-x-3">
                                {processing && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('Creating conversation...')}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing || !data.title || !data.ai_model_id}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    {t('Create Conversation')}
                                </Button>
                            </div>
                        </div>

                        {/* Validation Errors */}
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('Please fix the following errors:')}
                                    <ul className="mt-2 list-disc list-inside">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field} className="text-sm">{message}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
