import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import {
  Bot,
  Mail,
  Copy,
  X,
  Clock,
  Target,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useCRMAI from '@/Hooks/useCRMAI';

interface EmailTemplate {
  subject: string;
  body: string;
  tone: string;
  call_to_action: string;
  placeholders: string[];
  follow_up_suggestions: string[];
  best_send_time: string;
}

interface Props {
  onTemplateGenerated: (template: EmailTemplate) => void;
  onClose: () => void;
  leadData?: any;
  context?: any;
}

export default function EmailTemplateGenerator({ onTemplateGenerated, onClose, leadData = {}, context = {} }: Props) {
  const { t } = useTranslate();
  const { generateEmailTemplate, loading } = useCRMAI();
  const [purpose, setPurpose] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<EmailTemplate | null>(null);

  const emailPurposes = [
    { value: 'initial_outreach', label: 'Initial Outreach' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'meeting_request', label: 'Meeting Request' },
    { value: 'proposal_follow_up', label: 'Proposal Follow-up' },
    { value: 'thank_you', label: 'Thank You' },
    { value: 'check_in', label: 'Check-in' },
    { value: 'product_demo', label: 'Product Demo Invitation' },
    { value: 'case_study_share', label: 'Case Study Sharing' },
    { value: 'event_invitation', label: 'Event Invitation' },
    { value: 'nurture_sequence', label: 'Nurture Sequence' },
  ];

  const handleGenerateTemplate = async () => {
    if (!purpose) {
      return;
    }

    const contextData = {
      ...context,
      custom_context: customContext,
    };

    const result = await generateEmailTemplate(purpose, leadData, contextData);
    if (result) {
      setGeneratedTemplate(result);
    }
  };

  const handleApplyTemplate = () => {
    if (generatedTemplate) {
      onTemplateGenerated(generatedTemplate);
      onClose();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getToneBadgeColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'friendly': return 'bg-green-100 text-green-800';
      case 'formal': return 'bg-purple-100 text-purple-800';
      case 'casual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-700">AI Email Template Generator</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Generate personalized email templates using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedTemplate ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Email Purpose *</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailPurposes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-context">Additional Context (Optional)</Label>
                <Textarea
                  id="custom-context"
                  placeholder="Add any specific context, recent interactions, or special requirements..."
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  rows={3}
                />
              </div>

              {leadData.name && (
                <div className="bg-white rounded-lg p-3 border">
                  <h4 className="text-sm font-medium mb-2">Lead Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Name:</span> {leadData.name}
                    </div>
                    {leadData.company && (
                      <div>
                        <span className="text-muted-foreground">Company:</span> {leadData.company}
                      </div>
                    )}
                    {leadData.position && (
                      <div>
                        <span className="text-muted-foreground">Position:</span> {leadData.position}
                      </div>
                    )}
                    {leadData.source && (
                      <div>
                        <span className="text-muted-foreground">Source:</span> {leadData.source}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerateTemplate}
              disabled={!purpose || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Template...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Generate Email Template
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Email Template Generated</span>
                <Badge className={getToneBadgeColor(generatedTemplate.tone)} variant="secondary">
                  {generatedTemplate.tone}
                </Badge>
              </div>

              <div className="bg-white rounded-lg p-4 border space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Subject Line</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedTemplate.subject)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm font-medium">{generatedTemplate.subject}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Email Body</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedTemplate.body)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{generatedTemplate.body}</pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Call to Action</Label>
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-sm font-medium text-blue-800">{generatedTemplate.call_to_action}</p>
                  </div>
                </div>

                {generatedTemplate.placeholders.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Placeholders to Customize</Label>
                    <div className="flex flex-wrap gap-1">
                      {generatedTemplate.placeholders.map((placeholder, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-medium">Best Send Time</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">{generatedTemplate.best_send_time}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-medium">Tone</Label>
                    </div>
                    <Badge className={getToneBadgeColor(generatedTemplate.tone)} variant="secondary">
                      {generatedTemplate.tone}
                    </Badge>
                  </div>
                </div>

                {generatedTemplate.follow_up_suggestions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Follow-up Suggestions</Label>
                    <ul className="text-sm space-y-1">
                      {generatedTemplate.follow_up_suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleApplyTemplate} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedTemplate(null)}
                >
                  Generate New
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Powered by Mistral AI
        </div>
      </CardContent>
    </Card>
  );
}
