import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  TrendingUp,
  Eye,
  Clock,
  FileText,
  Link,
  Image
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface SEOIssue {
  type: 'error' | 'warning' | 'success';
  message: string;
  recommendation?: string;
}

interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
  metrics: {
    titleLength: number;
    descriptionLength: number;
    contentLength: number;
    slugLength: number;
    imageCount: number;
    linkCount: number;
    readabilityScore: number;
  };
}

interface Props {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  slug: string;
  onScoreChange?: (score: number) => void;
  className?: string;
}

export default function SEOAnalyzer({
  title,
  metaTitle,
  metaDescription,
  content,
  slug,
  onScoreChange,
  className = ''
}: Props) {
  const { t } = useTranslate();
  const [analysis, setAnalysis] = useState<SEOAnalysis>({
    score: 0,
    issues: [],
    recommendations: [],
    metrics: {
      titleLength: 0,
      descriptionLength: 0,
      contentLength: 0,
      slugLength: 0,
      imageCount: 0,
      linkCount: 0,
      readabilityScore: 0,
    }
  });

  useEffect(() => {
    const newAnalysis = analyzeContent();
    setAnalysis(newAnalysis);
    if (onScoreChange) {
      onScoreChange(newAnalysis.score);
    }
  }, [title, metaTitle, metaDescription, content, slug]);

  const analyzeContent = (): SEOAnalysis => {
    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Clean content for analysis
    const cleanContent = content.replace(/<[^>]*>/g, '');
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;

    // Title analysis
    const effectiveTitle = metaTitle || title;
    const titleLength = effectiveTitle.length;

    if (!effectiveTitle) {
      issues.push({
        type: 'error',
        message: t('seo.missing_title', 'Missing title'),
        recommendation: t('seo.add_title_recommendation', 'Add a descriptive title for your page')
      });
    } else if (titleLength < 30) {
      issues.push({
        type: 'warning',
        message: t('seo.title_too_short', 'Title is too short'),
        recommendation: t('seo.title_length_recommendation', 'Aim for 50-60 characters for optimal display in search results')
      });
      score += 10;
    } else if (titleLength > 60) {
      issues.push({
        type: 'warning',
        message: t('seo.title_too_long', 'Title is too long'),
        recommendation: t('seo.title_length_recommendation', 'Aim for 50-60 characters for optimal display in search results')
      });
      score += 10;
    } else {
      issues.push({
        type: 'success',
        message: t('seo.title_length_good', 'Title length is optimal')
      });
      score += 20;
    }

    // Meta description analysis
    const descriptionLength = metaDescription?.length || 0;

    if (!metaDescription) {
      issues.push({
        type: 'error',
        message: t('seo.missing_meta_description', 'Missing meta description'),
        recommendation: t('seo.add_meta_description_recommendation', 'Add a compelling meta description to improve click-through rates')
      });
    } else if (descriptionLength < 120) {
      issues.push({
        type: 'warning',
        message: t('seo.description_too_short', 'Meta description is too short'),
        recommendation: t('seo.description_length_recommendation', 'Aim for 150-160 characters for optimal display')
      });
      score += 10;
    } else if (descriptionLength > 160) {
      issues.push({
        type: 'warning',
        message: t('seo.description_too_long', 'Meta description is too long'),
        recommendation: t('seo.description_length_recommendation', 'Aim for 150-160 characters for optimal display')
      });
      score += 10;
    } else {
      issues.push({
        type: 'success',
        message: t('seo.description_length_good', 'Meta description length is optimal')
      });
      score += 20;
    }

    // Content analysis
    if (wordCount < 300) {
      issues.push({
        type: 'warning',
        message: t('seo.content_too_short', 'Content is too short'),
        recommendation: t('seo.content_length_recommendation', 'Add more content (aim for at least 300 words)')
      });
      score += 5;
    } else if (wordCount >= 300 && wordCount < 1000) {
      issues.push({
        type: 'success',
        message: t('seo.content_length_good', 'Content length is good')
      });
      score += 15;
    } else {
      issues.push({
        type: 'success',
        message: t('seo.content_length_excellent', 'Content length is excellent')
      });
      score += 20;
    }

    // Slug analysis
    const slugLength = slug.length;
    if (slugLength > 75) {
      issues.push({
        type: 'warning',
        message: t('seo.slug_too_long', 'URL slug is too long'),
        recommendation: t('seo.slug_length_recommendation', 'Keep URL slugs under 75 characters')
      });
      score += 5;
    } else if (slug.includes('_')) {
      issues.push({
        type: 'warning',
        message: t('seo.slug_underscores', 'URL slug contains underscores'),
        recommendation: t('seo.slug_hyphens_recommendation', 'Use hyphens instead of underscores in URLs')
      });
      score += 8;
    } else {
      issues.push({
        type: 'success',
        message: t('seo.slug_good', 'URL slug is well-formatted')
      });
      score += 10;
    }

    // Image analysis
    const imageCount = (content.match(/<img/g) || []).length;
    if (imageCount === 0) {
      recommendations.push(t('seo.add_images_recommendation', 'Consider adding images to improve engagement'));
    } else {
      issues.push({
        type: 'success',
        message: t('seo.images_present', `Found ${imageCount} image(s)`)
      });
      score += 10;
    }

    // Link analysis
    const linkCount = (content.match(/<a/g) || []).length;
    if (linkCount === 0) {
      recommendations.push(t('seo.add_links_recommendation', 'Consider adding internal or external links'));
    } else {
      issues.push({
        type: 'success',
        message: t('seo.links_present', `Found ${linkCount} link(s)`)
      });
      score += 10;
    }

    // Heading analysis
    const headingCount = (content.match(/<h[1-6]/g) || []).length;
    if (headingCount === 0) {
      issues.push({
        type: 'warning',
        message: t('seo.no_headings', 'No headings found'),
        recommendation: t('seo.add_headings_recommendation', 'Use headings (H1, H2, etc.) to structure your content')
      });
    } else {
      issues.push({
        type: 'success',
        message: t('seo.headings_present', `Found ${headingCount} heading(s)`)
      });
      score += 10;
    }

    // Readability analysis (simplified)
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    let readabilityScore = 100;

    if (avgWordsPerSentence > 20) {
      readabilityScore -= 20;
      issues.push({
        type: 'warning',
        message: t('seo.sentences_too_long', 'Sentences are too long'),
        recommendation: t('seo.shorter_sentences_recommendation', 'Use shorter sentences for better readability')
      });
    } else {
      score += 5;
    }

    // Additional recommendations
    if (score < 50) {
      recommendations.push(t('seo.improve_basic_seo', 'Focus on basic SEO elements: title, description, and content length'));
    } else if (score < 80) {
      recommendations.push(t('seo.enhance_content', 'Enhance your content with more images, links, and better structure'));
    }

    return {
      score: Math.min(score, 100),
      issues,
      recommendations,
      metrics: {
        titleLength,
        descriptionLength,
        contentLength: wordCount,
        slugLength,
        imageCount,
        linkCount,
        readabilityScore: Math.max(readabilityScore, 0),
      }
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('seo.excellent', 'Excellent');
    if (score >= 60) return t('seo.good', 'Good');
    if (score >= 40) return t('seo.needs_improvement', 'Needs Improvement');
    return t('seo.poor', 'Poor');
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {t('seo.analysis', 'SEO Analysis')}
        </CardTitle>
        <CardDescription>
          {t('seo.analysis_description', 'Real-time SEO analysis and recommendations')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </div>
          <div className="text-lg font-medium mb-2">
            {getScoreLabel(analysis.score)}
          </div>
          <Progress value={analysis.score} className="w-full" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{analysis.metrics.titleLength}</div>
            <div className="text-sm text-muted-foreground">{t('seo.title_chars', 'Title chars')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{analysis.metrics.descriptionLength}</div>
            <div className="text-sm text-muted-foreground">{t('seo.desc_chars', 'Desc chars')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{analysis.metrics.contentLength}</div>
            <div className="text-sm text-muted-foreground">{t('seo.words', 'Words')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{analysis.metrics.readabilityScore}</div>
            <div className="text-sm text-muted-foreground">{t('seo.readability', 'Readability')}</div>
          </div>
        </div>

        {/* Issues */}
        <div>
          <h4 className="font-medium mb-3">{t('seo.issues_recommendations', 'Issues & Recommendations')}</h4>
          <div className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getIssueIcon(issue.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{issue.message}</p>
                  {issue.recommendation && (
                    <p className="text-xs text-muted-foreground mt-1">{issue.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">{t('seo.additional_recommendations', 'Additional Recommendations')}</h4>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{analysis.metrics.imageCount} images</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{analysis.metrics.linkCount} links</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{analysis.metrics.slugLength} char URL</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
