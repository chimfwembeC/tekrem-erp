import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Star,
  Share2,
  HelpCircle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  helpfulness_ratio: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  author: {
    id: number;
    name: string;
  };
  tags?: string[];
}

interface RelatedFAQ {
  id: number;
  question: string;
  view_count: number;
  helpful_count: number;
}

interface Props {
  faq: FAQ;
  relatedFAQs: RelatedFAQ[];
}

export default function Show({ faq, relatedFAQs }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpfulVote = (helpful: boolean) => {
    if (hasVoted) return;

    const endpoint = helpful ? 'helpful' : 'not-helpful';
    
    fetch(`/support/faq/${faq.id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    }).then(() => {
      setHasVoted(true);
      router.reload({ only: ['faq'] });
    });
  };

  return (
    <AppLayout>
      <Head title={faq.question} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.faq.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              {t('common.share', 'Share')}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.faq.edit', faq.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', 'Edit')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* FAQ Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                        {faq.is_published ? t('support.published', 'Published') : t('support.draft', 'Draft')}
                      </Badge>
                      {faq.is_featured && (
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {faq.category && (
                        <Badge variant="outline">
                          <div
                            className="w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: faq.category.color }}
                          />
                          {faq.category.name}
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold tracking-tight mb-4 flex items-start gap-3">
                      <HelpCircle className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                      {faq.question}
                    </h1>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {faq.author.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(faq.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {faq.view_count} views
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {faq.helpful_count} helpful ({faq.helpfulness_ratio}%)
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* FAQ Answer */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.answer', 'Answer')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br>') }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.was_this_helpful', 'Was this FAQ helpful?')}</CardTitle>
                <CardDescription>
                  {t('support.faq_feedback_description', 'Let us know if this FAQ answered your question')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    onClick={() => handleHelpfulVote(true)}
                    disabled={hasVoted}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {t('common.yes', 'Yes')} ({faq.helpful_count})
                  </Button>
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    onClick={() => handleHelpfulVote(false)}
                    disabled={hasVoted}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {t('common.no', 'No')} ({faq.not_helpful_count})
                  </Button>
                  
                  {faq.helpful_count + faq.not_helpful_count > 0 && (
                    <div className="ml-4 text-sm text-muted-foreground">
                      {faq.helpfulness_ratio}% found this helpful
                    </div>
                  )}
                </div>
                
                {hasVoted && (
                  <p className="text-sm text-green-600 mt-2">
                    {t('support.feedback_thanks', 'Thank you for your feedback!')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* FAQ Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.faq_stats', 'FAQ Statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.views', 'Views')}</span>
                    <span className="font-medium">{faq.view_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.helpful_votes', 'Helpful Votes')}</span>
                    <span className="font-medium">{faq.helpful_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.not_helpful_votes', 'Not Helpful Votes')}</span>
                    <span className="font-medium">{faq.not_helpful_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.helpfulness_ratio', 'Helpfulness Ratio')}</span>
                    <span className="font-medium">{faq.helpfulness_ratio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.last_updated', 'Last Updated')}</span>
                    <span className="font-medium">{new Date(faq.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related FAQs */}
            {relatedFAQs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.related_faqs', 'Related FAQs')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedFAQs.map((relatedFAQ) => (
                    <div key={relatedFAQ.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <Link
                        href={route('support.faq.show', relatedFAQ.id)}
                        className="block hover:text-primary"
                      >
                        <h4 className="font-medium text-sm leading-tight mb-1">
                          {relatedFAQ.question}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {relatedFAQ.view_count} views
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {relatedFAQ.helpful_count} helpful
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {faq.tags && faq.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.tags', 'Tags')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {faq.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.tickets.create')}>
                    {t('support.create_ticket', 'Create Support Ticket')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.faq.index')}>
                    {t('support.browse_faqs', 'Browse All FAQs')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.knowledge-base.index')}>
                    {t('support.knowledge_base', 'Knowledge Base')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
