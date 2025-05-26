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
  Clock,
  Star,
  Share2
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  is_featured: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  reading_time: number;
  helpfulness_ratio: number;
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

interface RelatedArticle {
  id: number;
  title: string;
  excerpt?: string;
  view_count: number;
}

interface Props {
  article: Article;
  relatedArticles: RelatedArticle[];
}

export default function Show({ article, relatedArticles }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpfulVote = (helpful: boolean) => {
    if (hasVoted) return;

    const endpoint = helpful ? 'helpful' : 'not-helpful';
    
    fetch(`/support/knowledge-base/${article.id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    }).then(() => {
      setHasVoted(true);
      router.reload({ only: ['article'] });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <Head title={article.title} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.knowledge-base.index')}>
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
              <Link href={route('support.knowledge-base.edit', article.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', 'Edit')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Article Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(article.status)} variant="secondary">
                        {article.status}
                      </Badge>
                      {article.is_featured && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {article.category && (
                        <Badge variant="outline">
                          <div
                            className="w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: article.category.color }}
                          />
                          {article.category.name}
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold tracking-tight mb-4">
                      {article.title}
                    </h1>

                    {article.excerpt && (
                      <p className="text-lg text-muted-foreground mb-4">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.reading_time} min read
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.view_count} views
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.was_this_helpful', 'Was this article helpful?')}</CardTitle>
                <CardDescription>
                  {t('support.feedback_description', 'Let us know if this article helped you')}
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
                    {t('common.yes', 'Yes')} ({article.helpful_count})
                  </Button>
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    onClick={() => handleHelpfulVote(false)}
                    disabled={hasVoted}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {t('common.no', 'No')} ({article.not_helpful_count})
                  </Button>
                  
                  {article.helpful_count + article.not_helpful_count > 0 && (
                    <div className="ml-4 text-sm text-muted-foreground">
                      {article.helpfulness_ratio}% found this helpful
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
            {/* Article Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.article_stats', 'Article Statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.views', 'Views')}</span>
                    <span className="font-medium">{article.view_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.helpful_votes', 'Helpful Votes')}</span>
                    <span className="font-medium">{article.helpful_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.reading_time', 'Reading Time')}</span>
                    <span className="font-medium">{article.reading_time} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.last_updated', 'Last Updated')}</span>
                    <span className="font-medium">{new Date(article.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.related_articles', 'Related Articles')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <Link
                        href={route('support.knowledge-base.show', relatedArticle.id)}
                        className="block hover:text-primary"
                      >
                        <h4 className="font-medium text-sm leading-tight mb-1">
                          {relatedArticle.title}
                        </h4>
                        {relatedArticle.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {relatedArticle.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {relatedArticle.view_count} views
                        </div>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.tags', 'Tags')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
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
                  <Link href={route('support.tickets.create', { 
                    requester_type: 'App\\Models\\User',
                    requester_id: 1 // Current user ID would go here
                  })}>
                    {t('support.create_ticket', 'Create Support Ticket')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.knowledge-base.index')}>
                    {t('support.browse_articles', 'Browse All Articles')}
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
