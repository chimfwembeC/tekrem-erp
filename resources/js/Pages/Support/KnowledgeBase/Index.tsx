import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Calendar,
  User,
  ThumbsUp
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  is_featured: boolean;
  view_count: number;
  helpful_count: number;
  published_at?: string;
  created_at: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  author: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

interface PaginatedArticles {
  data: Article[];
  links: any;
  meta?: any;
}

interface Props {
  articles: PaginatedArticles;
  categories: Category[];
  filters: {
    search?: string;
    status?: string;
    category_id?: string;
    featured?: string;
  };
}

export default function Index({ articles, categories, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('support.knowledge-base.index'), {
      ...filters,
      search: searchTerm,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('support.knowledge-base.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
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
      <Head title={t('support.knowledge_base', 'Knowledge Base')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.knowledge_base', 'Knowledge Base')}</h1>
            <p className="text-muted-foreground">
              {t('support.knowledge_base_description', 'Manage articles and documentation')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('support.knowledge-base.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.create_article', 'Create Article')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder={t('common.search', 'Search articles...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="published">{t('support.published', 'Published')}</SelectItem>
                  <SelectItem value="draft">{t('support.draft', 'Draft')}</SelectItem>
                  <SelectItem value="archived">{t('support.archived', 'Archived')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category_id || 'all'} onValueChange={(value) => handleFilterChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.category', 'Category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={filters.featured === 'true'}
                  onCheckedChange={(checked) => handleFilterChange('featured', checked ? 'true' : '')}
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  {t('support.featured_only', 'Featured Only')}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.data.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(article.status)} variant="secondary">
                        {article.status}
                      </Badge>
                      {article.is_featured && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      <Link
                        href={route('support.knowledge-base.show', article.id)}
                        className="hover:text-primary"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {article.excerpt && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}

                <div className="space-y-3">
                  {article.category && (
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: article.category.color }}
                      />
                      <span className="text-muted-foreground">{article.category.name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_at || article.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.view_count} views
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {article.helpful_count} helpful
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={route('support.knowledge-base.show', article.id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={route('support.knowledge-base.edit', article.id)}>
                        <Edit className="h-3 w-3 mr-1" />
                        {t('common.edit', 'Edit')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {articles.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('support.no_articles', 'No articles found')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('support.no_articles_description', 'Get started by creating your first knowledge base article.')}
              </p>
              <Button asChild>
                <Link href={route('support.knowledge-base.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('support.create_article', 'Create Article')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination would go here */}
        {articles.data.length > 0 && articles.meta && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {articles.data.length} of {articles.meta.total || articles.data.length} articles
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
