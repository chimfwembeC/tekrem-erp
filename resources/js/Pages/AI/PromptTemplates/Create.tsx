import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    FileText,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Hash,
    Tag,
    Eye,
    Globe,
    Lock
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';

interface Props {
    categories: string[];
}

interface FormData {
    name: string;
    description: string;
    category: string;
    template: string;
    variables: string[];
    tags: string[];
    is_public: boolean;
    is_system: boolean;
    metadata: Record<string, any>;
}

export default function Create({ categories }: Props) {
    const { t } = useTranslate();
    const [variables, setVariables] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [newVariable, setNewVariable] = useState('');
    const [newTag, setNewTag] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        description: '',
        category: '',
        template: '',
        variables: [],
        tags: [],
        is_public: false,
        is_system: false,
        metadata: {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ai.prompt-templates.store'));
    };

    const addVariable = () => {
        if (newVariable.trim() && !variables.includes(newVariable.trim())) {
            const updatedVariables = [...variables, newVariable.trim()];
            setVariables(updatedVariables);
            setData('variables', updatedVariables);
            setNewVariable('');
        }
    };

    const removeVariable = (variable: string) => {
        const updatedVariables = variables.filter(v => v !== variable);
        setVariables(updatedVariables);
        setData('variables', updatedVariables);
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];
            setTags(updatedTags);
            setData('tags', updatedTags);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        const updatedTags = tags.filter(t => t !== tag);
        setTags(updatedTags);
        setData('tags', updatedTags);
    };

    const extractVariablesFromTemplate = () => {
        const regex = /\{\{(\w+)\}\}/g;
        const matches = data.template.match(regex);
        if (matches) {
            const extractedVars = matches.map(match => match.replace(/[{}]/g, ''));
            const uniqueVars = [...new Set(extractedVars)];
            const newVars = uniqueVars.filter(v => !variables.includes(v));
            if (newVars.length > 0) {
                const updatedVariables = [...variables, ...newVars];
                setVariables(updatedVariables);
                setData('variables', updatedVariables);
            }
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            crm: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            marketing: 'bg-purple-100 text-purple-800',
            general: 'bg-gray-100 text-gray-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const renderPreview = () => {
        let preview = data.template;
        variables.forEach(variable => {
            preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), `[${variable.toUpperCase()}]`);
        });
        return preview;
    };

    return (
        <AppLayout
            title={t('Create Prompt Template')}
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
                                {t('Create Prompt Template')}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('Create a reusable prompt template for AI interactions')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        >
            <Head title={t('Create Prompt Template')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    {t('Basic Information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Configure the basic details of your prompt template')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Template Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Template Name')} *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('Enter a descriptive name for the template')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('Description')}</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('Describe what this template is used for')}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">{t('Category')} *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t('Select a category')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(category)}`}>
                                                            {category.toUpperCase()}
                                                        </span>
                                                        <span className="capitalize">{category}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>

                                {/* Visibility Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center">
                                                <Globe className="h-4 w-4 mr-2" />
                                                {t('Public Template')}
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                {t('Make this template available to all users')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_public}
                                            onCheckedChange={(checked) => setData('is_public', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center">
                                                <Lock className="h-4 w-4 mr-2" />
                                                {t('System Template')}
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                {t('Mark as system template (admin only)')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_system}
                                            onCheckedChange={(checked) => setData('is_system', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Template Content */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center">
                                            <FileText className="h-5 w-5 mr-2" />
                                            {t('Template Content')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('Write your prompt template with variables')}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={extractVariablesFromTemplate}
                                        >
                                            <Hash className="h-4 w-4 mr-2" />
                                            {t('Extract Variables')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPreviewMode(!previewMode)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {previewMode ? t('Edit') : t('Preview')}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!previewMode ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="template">{t('Template')} *</Label>
                                        <Textarea
                                            id="template"
                                            value={data.template}
                                            onChange={(e) => setData('template', e.target.value)}
                                            placeholder={t('Write your prompt template here. Use {{variable}} for dynamic content.')}
                                            rows={8}
                                            className={`resize-none font-mono ${errors.template ? 'border-red-500' : ''}`}
                                        />
                                        {errors.template && (
                                            <p className="text-sm text-red-600">{errors.template}</p>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            {t('Use {{variable_name}} syntax for variables that will be replaced at runtime')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>{t('Template Preview')}</Label>
                                        <div className="bg-gray-50 p-4 rounded-md border min-h-[200px]">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700">
                                                {renderPreview() || t('No template content to preview')}
                                            </pre>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {t('Variables are shown in [BRACKETS] in the preview')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Variables and Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Hash className="h-5 w-5 mr-2" />
                                    {t('Variables and Tags')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Manage template variables and tags for organization')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Variables Management */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Hash className="h-4 w-4 text-gray-600" />
                                        <Label className="text-base font-medium">{t('Variables')}</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <Input
                                                value={newVariable}
                                                onChange={(e) => setNewVariable(e.target.value)}
                                                placeholder={t('Add a variable name (e.g., customer_name, product)')}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                                            />
                                            <Button type="button" onClick={addVariable} variant="outline">
                                                {t('Add')}
                                            </Button>
                                        </div>

                                        {variables.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {variables.map((variable, index) => (
                                                    <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                        <Hash className="h-3 w-3" />
                                                        <span>{variable}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariable(variable)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600">
                                            {t('Variables will be replaced with actual values when the template is used')}
                                        </p>
                                    </div>
                                </div>

                                {/* Tags Management */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Tag className="h-4 w-4 text-gray-600" />
                                        <Label className="text-base font-medium">{t('Tags')}</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <Input
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                placeholder={t('Add a tag (e.g., email, sales, support)')}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            />
                                            <Button type="button" onClick={addTag} variant="outline">
                                                {t('Add')}
                                            </Button>
                                        </div>

                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {tags.map((tag, index) => (
                                                    <div key={index} className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                        <Tag className="h-3 w-3" />
                                                        <span>{tag}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600">
                                            {t('Tags help organize and search for templates')}
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
                                        {t('Creating template...')}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing || !data.name || !data.category || !data.template}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    {t('Create Template')}
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
