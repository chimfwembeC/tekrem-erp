import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import {
  Brain,
  Lightbulb,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  FileText
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Suggestion {
  suggestions: string;
  confidence: number;
  similar_tickets: Array<{
    id: number;
    ticket_number: string;
    title: string;
    status: string;
  }>;
  recommended_articles: Array<{
    id: number;
    title: string;
    excerpt?: string;
  }>;
}

interface Props {
  ticketId: number;
  onApplySuggestion?: (suggestion: string) => void;
  className?: string;
}

export default function AISuggestions({ ticketId, onApplySuggestion, className = '' }: Props) {
  const { t } = useTranslate();
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/support/ai/tickets/${ticketId}/suggestions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    try {
      await fetch(`/support/ai/tickets/${ticketId}/suggestions/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          helpful: isHelpful,
          suggestion_id: suggestions ? 'ai_suggestion' : null,
        }),
      });

      setFeedback(isHelpful ? 'helpful' : 'not_helpful');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return CheckCircle;
    if (confidence >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  React.useEffect(() => {
    fetchSuggestions();
  }, [ticketId]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>{t('support.ai_suggestions', 'AI Suggestions')}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          {t('support.ai_suggestions_description', 'AI-powered resolution suggestions and recommendations')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && !suggestions && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>{t('support.analyzing_ticket', 'Analyzing ticket...')}</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && (
          <div className="space-y-6">
            {/* Confidence Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('support.confidence_score', 'Confidence Score')}</span>
              <Badge className={getConfidenceColor(suggestions.confidence)} variant="secondary">
                {React.createElement(getConfidenceIcon(suggestions.confidence), { className: "h-3 w-3 mr-1" })}
                {suggestions.confidence}%
              </Badge>
            </div>

            {/* AI Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">{t('support.resolution_suggestions', 'Resolution Suggestions')}</h4>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-sm">{suggestions.suggestions}</div>
                
                {onApplySuggestion && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onApplySuggestion(suggestions.suggestions)}
                    >
                      {t('support.apply_suggestion', 'Apply Suggestion')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Tickets */}
            {suggestions.similar_tickets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">{t('support.similar_tickets', 'Similar Tickets')}</h4>
                </div>
                <div className="space-y-2">
                  {suggestions.similar_tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">#{ticket.ticket_number}</div>
                        <div className="text-sm text-muted-foreground">{ticket.title}</div>
                      </div>
                      <Badge variant="outline">
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Articles */}
            {suggestions.recommended_articles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">{t('support.recommended_articles', 'Recommended Articles')}</h4>
                </div>
                <div className="space-y-2">
                  {suggestions.recommended_articles.map((article) => (
                    <div key={article.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{article.title}</div>
                          {article.excerpt && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Feedback */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t('support.was_this_helpful', 'Was this helpful?')}
                </span>
                {feedback === null ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback(true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {t('common.yes', 'Yes')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback(false)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {t('common.no', 'No')}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">
                    {feedback === 'helpful' ? (
                      <>
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {t('support.marked_helpful', 'Marked as helpful')}
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {t('support.marked_not_helpful', 'Marked as not helpful')}
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
