import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    Bot,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Settings,
    Zap,
    DollarSign
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';

interface Service {
    id: number;
    name: string;
    provider: string;
    is_enabled: boolean;
}

interface Props {
    services: Service[];
}

interface FormData {
    ai_service_id: string;
    name: string;
    model_identifier: string;
    type: string;
    description: string;
    is_enabled: boolean;
    is_default: boolean;
    capabilities: string[];
    max_tokens: string;
    temperature: string;
    top_p: string;
    frequency_penalty: string;
    presence_penalty: string;
    cost_per_input_token: string;
    cost_per_output_token: string;
    configuration: Record<string, any>;
}

export default function Create({ services }: Props) {
    const { t } = useTranslate();
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [capabilities, setCapabilities] = useState<string[]>([]);
    const [newCapability, setNewCapability] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        ai_service_id: '',
        name: '',
        model_identifier: '',
        type: '',
        description: '',
        is_enabled: true,
        is_default: false,
        capabilities: [],
        max_tokens: '',
        temperature: '0.7',
        top_p: '1.0',
        frequency_penalty: '0',
        presence_penalty: '0',
        cost_per_input_token: '',
        cost_per_output_token: '',
        configuration: {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ai.models.store'));
    };

    const handleServiceChange = (serviceId: string) => {
        setData('ai_service_id', serviceId);
        const service = services.find(s => s.id.toString() === serviceId);
        setSelectedService(service || null);
    };

    const addCapability = () => {
        if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
            const updatedCapabilities = [...capabilities, newCapability.trim()];
            setCapabilities(updatedCapabilities);
            setData('capabilities', updatedCapabilities);
            setNewCapability('');
        }
    };

    const removeCapability = (capability: string) => {
        const updatedCapabilities = capabilities.filter(c => c !== capability);
        setCapabilities(updatedCapabilities);
        setData('capabilities', updatedCapabilities);
    };

    const getTypeColor = (type: string) => {
        const colors = {
            chat: 'bg-blue-100 text-blue-800',
            completion: 'bg-green-100 text-green-800',
            embedding: 'bg-purple-100 text-purple-800',
            image: 'bg-orange-100 text-orange-800',
            audio: 'bg-pink-100 text-pink-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout
            title={t('Create AI Model')}
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
                                {t('Create AI Model')}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('Add a new AI model to your system')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        >
            <Head title={t('Create AI Model')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bot className="h-5 w-5 mr-2" />
                                    {t('Basic Information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Configure the basic details of your AI model')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Service Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="ai_service_id">{t('AI Service')} *</Label>
                                    <Select value={data.ai_service_id} onValueChange={handleServiceChange}>
                                        <SelectTrigger className={errors.ai_service_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t('Select an AI service')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.filter(service => service.is_enabled).map((service) => (
                                                <SelectItem key={service.id} value={service.id.toString()}>
                                                    <div className="flex items-center space-x-2">
                                                        <Settings className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{service.name}</div>
                                                            <div className="text-xs text-gray-500">{service.provider}</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ai_service_id && (
                                        <p className="text-sm text-red-600">{errors.ai_service_id}</p>
                                    )}
                                </div>

                                {/* Model Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Model Name')} *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('Enter a descriptive name for the model')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Model Identifier */}
                                <div className="space-y-2">
                                    <Label htmlFor="model_identifier">{t('Model Identifier')} *</Label>
                                    <Input
                                        id="model_identifier"
                                        type="text"
                                        value={data.model_identifier}
                                        onChange={(e) => setData('model_identifier', e.target.value)}
                                        placeholder={t('e.g., mistral-large-latest, gpt-4, claude-3')}
                                        className={errors.model_identifier ? 'border-red-500' : ''}
                                    />
                                    {errors.model_identifier && (
                                        <p className="text-sm text-red-600">{errors.model_identifier}</p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                        {t('The exact model identifier used by the AI service')}
                                    </p>
                                </div>

                                {/* Model Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">{t('Model Type')} *</Label>
                                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                        <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t('Select model type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="chat">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor('chat')}`}>
                                                        CHAT
                                                    </span>
                                                    <span>{t('Chat Completion')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completion">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor('completion')}`}>
                                                        COMPLETION
                                                    </span>
                                                    <span>{t('Text Completion')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="embedding">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor('embedding')}`}>
                                                        EMBEDDING
                                                    </span>
                                                    <span>{t('Text Embedding')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="image">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor('image')}`}>
                                                        IMAGE
                                                    </span>
                                                    <span>{t('Image Generation')}</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="audio">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor('audio')}`}>
                                                        AUDIO
                                                    </span>
                                                    <span>{t('Audio Processing')}</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('Description')}</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('Describe the model capabilities and use cases')}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                {/* Status Switches */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('Enable Model')}</Label>
                                            <p className="text-sm text-gray-600">
                                                {t('Make this model available for use')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_enabled}
                                            onCheckedChange={(checked) => setData('is_enabled', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('Set as Default')}</Label>
                                            <p className="text-sm text-gray-600">
                                                {t('Use as default for this model type')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_default}
                                            onCheckedChange={(checked) => setData('is_default', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Advanced Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    {t('Advanced Configuration')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Configure model parameters and capabilities')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Model Parameters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="max_tokens">{t('Max Tokens')}</Label>
                                        <Input
                                            id="max_tokens"
                                            type="number"
                                            value={data.max_tokens}
                                            onChange={(e) => setData('max_tokens', e.target.value)}
                                            placeholder="4096"
                                            min="1"
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Maximum number of tokens the model can process')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="temperature">{t('Temperature')}</Label>
                                        <Input
                                            id="temperature"
                                            type="number"
                                            value={data.temperature}
                                            onChange={(e) => setData('temperature', e.target.value)}
                                            placeholder="0.7"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Controls randomness (0.0 = deterministic, 2.0 = very random)')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="top_p">{t('Top P')}</Label>
                                        <Input
                                            id="top_p"
                                            type="number"
                                            value={data.top_p}
                                            onChange={(e) => setData('top_p', e.target.value)}
                                            placeholder="1.0"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Nucleus sampling parameter')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="frequency_penalty">{t('Frequency Penalty')}</Label>
                                        <Input
                                            id="frequency_penalty"
                                            type="number"
                                            value={data.frequency_penalty}
                                            onChange={(e) => setData('frequency_penalty', e.target.value)}
                                            placeholder="0"
                                            min="-2"
                                            max="2"
                                            step="0.1"
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Reduces repetition of frequent tokens')}
                                        </p>
                                    </div>
                                </div>

                                {/* Cost Configuration */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-4 w-4 text-gray-600" />
                                        <Label className="text-base font-medium">{t('Cost Configuration')}</Label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="cost_per_input_token">{t('Cost per Input Token')}</Label>
                                            <Input
                                                id="cost_per_input_token"
                                                type="number"
                                                value={data.cost_per_input_token}
                                                onChange={(e) => setData('cost_per_input_token', e.target.value)}
                                                placeholder="0.000001"
                                                min="0"
                                                step="0.000001"
                                            />
                                            <p className="text-sm text-gray-600">
                                                {t('Cost in USD per input token')}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cost_per_output_token">{t('Cost per Output Token')}</Label>
                                            <Input
                                                id="cost_per_output_token"
                                                type="number"
                                                value={data.cost_per_output_token}
                                                onChange={(e) => setData('cost_per_output_token', e.target.value)}
                                                placeholder="0.000003"
                                                min="0"
                                                step="0.000001"
                                            />
                                            <p className="text-sm text-gray-600">
                                                {t('Cost in USD per output token')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Capabilities */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Zap className="h-4 w-4 text-gray-600" />
                                        <Label className="text-base font-medium">{t('Capabilities')}</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <Input
                                                value={newCapability}
                                                onChange={(e) => setNewCapability(e.target.value)}
                                                placeholder={t('Add a capability (e.g., function_calling, vision)')}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                                            />
                                            <Button type="button" onClick={addCapability} variant="outline">
                                                {t('Add')}
                                            </Button>
                                        </div>

                                        {capabilities.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {capabilities.map((capability, index) => (
                                                    <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                        <span>{capability}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCapability(capability)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600">
                                            {t('Add capabilities that this model supports')}
                                        </p>
                                    </div>
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
                                        {t('Creating model...')}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing || !data.name || !data.ai_service_id || !data.model_identifier || !data.type}
                                >
                                    <Bot className="h-4 w-4 mr-2" />
                                    {t('Create Model')}
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
