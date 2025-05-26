import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  Bot,
  Heart,
  Frown,
  Meh,
  Smile,
  AlertTriangle,
  TrendingUp,
  Clock,
  X,
  MessageSquare,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface SentimentAnalysis {
  sentiment: string;
  sentiment_score: number;
  tone: string;
  urgency: string;
  satisfaction: string;
  key_emotions: string[];
  concerns: string[];
  interests: string[];
  buying_signals: string[];
  risk_indicators: string[];
  recommended_response: string;
  priority: string;
  confidence: number;
}

interface Props {
  analysis: SentimentAnalysis;
  onDismiss: () => void;
  loading?: boolean;
}

export default function SentimentAnalysis({ analysis, onDismiss, loading = false }: Props) {
  const { t } = useTranslate();

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-5 w-5 text-green-600" />;
      case 'negative': return <Frown className="h-5 w-5 text-red-600" />;
      case 'neutral': return <Meh className="h-5 w-5 text-gray-600" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSatisfactionColor = (satisfaction: string) => {
    switch (satisfaction) {
      case 'satisfied': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      case 'dissatisfied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Bot className="h-5 w-5 animate-pulse" />
            AI Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Analyzing communication sentiment...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 animate-pulse text-purple-600" />
            <span className="text-sm text-purple-600">Analyzing sentiment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-700">AI Sentiment Analysis</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AI-powered communication sentiment and tone analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Sentiment */}
        <div className="bg-white rounded-lg p-4 border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getSentimentIcon(analysis.sentiment)}
              <div>
                <Badge className={getSentimentColor(analysis.sentiment)} variant="secondary">
                  {analysis.sentiment}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(analysis.confidence * 100)}% confidence
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(analysis.sentiment_score * 100)}
              </div>
              <div className="text-xs text-muted-foreground">Sentiment Score</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sentiment Strength</span>
              <span className="font-medium">{Math.round(Math.abs(analysis.sentiment_score) * 100)}%</span>
            </div>
            <Progress value={Math.abs(analysis.sentiment_score) * 100} className="h-2" />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Tone</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {analysis.tone}
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Urgency</span>
            </div>
            <Badge className={getUrgencyColor(analysis.urgency)} variant="secondary">
              {analysis.urgency}
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Satisfaction</span>
            </div>
            <Badge className={getSatisfactionColor(analysis.satisfaction)} variant="secondary">
              {analysis.satisfaction}
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Priority</span>
            </div>
            <Badge className={getPriorityColor(analysis.priority)} variant="secondary">
              {analysis.priority}
            </Badge>
          </div>
        </div>

        {/* Key Emotions */}
        {analysis.key_emotions.length > 0 && (
          <div className="bg-white rounded-lg p-4 border space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Key Emotions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.key_emotions.map((emotion, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Buying Signals */}
        {analysis.buying_signals.length > 0 && (
          <div className="bg-white rounded-lg p-4 border space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Buying Signals</span>
            </div>
            <ul className="text-xs space-y-1">
              {analysis.buying_signals.map((signal, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {analysis.concerns.length > 0 && (
          <div className="bg-white rounded-lg p-4 border space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Concerns</span>
            </div>
            <ul className="text-xs space-y-1">
              {analysis.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Indicators */}
        {analysis.risk_indicators.length > 0 && (
          <div className="bg-white rounded-lg p-4 border space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Risk Indicators</span>
            </div>
            <ul className="text-xs space-y-1">
              {analysis.risk_indicators.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Response */}
        <div className="bg-white rounded-lg p-4 border space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Recommended Response Approach</span>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.recommended_response}</p>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Powered by Mistral AI
        </div>
      </CardContent>
    </Card>
  );
}
