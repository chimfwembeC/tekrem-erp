import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Bot,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  X,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface TransactionSuggestions {
  category?: {
    category: string;
    confidence: number;
    reasoning: string;
  };
  enhanced_description?: string;
  duplicate_check?: {
    is_duplicate: boolean;
    confidence: number;
    similar_transactions: number[];
    reasoning: string;
  };
}

interface Props {
  suggestions: TransactionSuggestions;
  onApplySuggestion: (type: string, value: any) => void;
  onDismiss: () => void;
  loading?: boolean;
}

export default function AISuggestions({ suggestions, onApplySuggestion, onDismiss, loading = false }: Props) {
  const { t } = useTranslate();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bot className="h-5 w-5 animate-pulse" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Analyzing your transaction...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600">Getting AI suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-700">AI Suggestions</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AI-powered suggestions to improve your transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Suggestion */}
        {suggestions.category && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Category Suggestion</span>
              <Badge className={getConfidenceColor(suggestions.category.confidence)} variant="secondary">
                {getConfidenceText(suggestions.category.confidence)} ({Math.round(suggestions.category.confidence * 100)}%)
              </Badge>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{suggestions.category.category}</span>
                <Button
                  size="sm"
                  onClick={() => onApplySuggestion('category', suggestions.category?.category)}
                  className="h-7"
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{suggestions.category.reasoning}</p>
            </div>
          </div>
        )}

        {/* Enhanced Description */}
        {suggestions.enhanced_description && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Enhanced Description</span>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{suggestions.enhanced_description}</span>
                <Button
                  size="sm"
                  onClick={() => onApplySuggestion('description', suggestions.enhanced_description)}
                  className="h-7"
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Check */}
        {suggestions.duplicate_check && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {suggestions.duplicate_check.is_duplicate ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className="font-medium text-sm">Duplicate Check</span>
              <Badge 
                className={getConfidenceColor(suggestions.duplicate_check.confidence)} 
                variant="secondary"
              >
                {getConfidenceText(suggestions.duplicate_check.confidence)} ({Math.round(suggestions.duplicate_check.confidence * 100)}%)
              </Badge>
            </div>
            <Alert className={suggestions.duplicate_check.is_duplicate ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className="text-sm">
                {suggestions.duplicate_check.is_duplicate ? (
                  <>
                    <strong>Potential duplicate detected!</strong> This transaction appears similar to {suggestions.duplicate_check.similar_transactions.length} recent transaction(s).
                  </>
                ) : (
                  <strong>No duplicates found.</strong> This transaction appears to be unique.
                )}
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  {suggestions.duplicate_check.reasoning}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="flex-1"
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
          <span className="text-xs text-muted-foreground">
            Powered by Mistral AI
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
