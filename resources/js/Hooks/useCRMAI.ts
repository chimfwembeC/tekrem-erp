import { useState } from 'react';
import { toast } from 'sonner';

interface LeadInsights {
  scoring?: {
    score: number;
    grade: string;
    qualification: string;
    conversion_probability: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    next_steps: string[];
    priority: string;
    reasoning: string;
  };
  company_enrichment?: {
    industry: string;
    sub_industry: string;
    company_size: string;
    employee_range: string;
    business_model: string;
    key_services: string[];
    technologies: string[];
    pain_points: string[];
    opportunities: string[];
    decision_makers: string[];
    sales_approach: string;
    confidence: number;
  };
}

interface EmailTemplate {
  subject: string;
  body: string;
  tone: string;
  call_to_action: string;
  placeholders: string[];
  follow_up_suggestions: string[];
  best_send_time: string;
}

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

interface FollowUpRecommendations {
  next_action: string;
  timing: string;
  channel: string;
  message_suggestions: string[];
  priority: string;
  reasoning: string;
  success_probability: number;
  alternative_actions: string[];
}

interface ConversionPrediction {
  conversion_probability: number;
  confidence: number;
  timeline: string;
  key_factors: string[];
  risk_factors: string[];
  recommendations: string[];
  stage: string;
  next_milestone: string;
}

interface ClientHealthAnalysis {
  health_score: number;
  satisfaction: string;
  churn_risk: string;
  engagement_level: string;
  positive_indicators: string[];
  warning_signs: string[];
  recommendations: string[];
  upsell_opportunities: string[];
  retention_actions: string[];
}

export default function useCRMAI() {
  const [loading, setLoading] = useState(false);

  const getLeadInsights = async (leadData: any): Promise<LeadInsights | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.leads.ai-insights'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();

      if (result.success) {
        return result.insights;
      } else {
        toast.error('Failed to get AI insights');
        return null;
      }
    } catch (error) {
      console.error('Error getting lead insights:', error);
      toast.error('Error getting AI insights');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateEmailTemplate = async (purpose: string, leadData: any = {}, context: any = {}): Promise<EmailTemplate | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.leads.generate-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          purpose,
          lead_data: leadData,
          context,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email template generated successfully!');
        return result.template;
      } else {
        toast.error(result.message || 'Failed to generate email template');
        return null;
      }
    } catch (error) {
      console.error('Error generating email template:', error);
      toast.error('Error generating email template');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeSentiment = async (content: string, type: string = 'general'): Promise<SentimentAnalysis | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.communications.analyze-sentiment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ content, type }),
      });

      const result = await response.json();

      if (result.success) {
        return result.analysis;
      } else {
        toast.error(result.message || 'Failed to analyze sentiment');
        return null;
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast.error('Error analyzing sentiment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFollowUpRecommendations = async (leadId: number): Promise<FollowUpRecommendations | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.leads.follow-up-recommendations', leadId));

      const result = await response.json();

      if (result.success) {
        return result.recommendations;
      } else {
        toast.error(result.message || 'Failed to get follow-up recommendations');
        return null;
      }
    } catch (error) {
      console.error('Error getting follow-up recommendations:', error);
      toast.error('Error getting follow-up recommendations');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getConversionPrediction = async (leadId: number): Promise<ConversionPrediction | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.leads.conversion-prediction', leadId));

      const result = await response.json();

      if (result.success) {
        return result.prediction;
      } else {
        toast.error(result.message || 'Failed to get conversion prediction');
        return null;
      }
    } catch (error) {
      console.error('Error getting conversion prediction:', error);
      toast.error('Error getting conversion prediction');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeClientHealth = async (clientId: number): Promise<ClientHealthAnalysis | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.clients.health-analysis', clientId));

      const result = await response.json();

      if (result.success) {
        return result.analysis;
      } else {
        toast.error(result.message || 'Failed to analyze client health');
        return null;
      }
    } catch (error) {
      console.error('Error analyzing client health:', error);
      toast.error('Error analyzing client health');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateCommunicationEmailTemplate = async (purpose: string, context: any = {}): Promise<EmailTemplate | null> => {
    setLoading(true);
    
    try {
      const response = await fetch(route('crm.communications.generate-email-template'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ purpose, context }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email template generated successfully!');
        return result.template;
      } else {
        toast.error(result.message || 'Failed to generate email template');
        return null;
      }
    } catch (error) {
      console.error('Error generating email template:', error);
      toast.error('Error generating email template');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getLeadInsights,
    generateEmailTemplate,
    analyzeSentiment,
    getFollowUpRecommendations,
    getConversionPrediction,
    analyzeClientHealth,
    generateCommunicationEmailTemplate,
  };
}
