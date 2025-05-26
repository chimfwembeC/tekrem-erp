import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  ChevronDown,
  ChevronRight,
  Star,
  ThumbsUp,
  User,
  Calendar
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

interface Category {
  id: number;
  name: string;
}

interface PaginatedFAQs {
  data: FAQ[];
  links: any;
  meta?: any;
}

interface Props {
  faqs: PaginatedFAQs;
  categories: Category[];
  filters: {
    search?: string;
    category_id?: string;
    published?: string;
    featured?: string;
  };
}

export default function Index({ faqs, categories, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('support.faq.index'), {
      ...filters,
      search: searchTerm,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('support.faq.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const toggleFAQ = (faqId: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFAQs(newExpanded);
  };

  return (
    <AppLayout>
      <Head title={t('support.faq', 'Frequently Asked Questions')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.faq', 'Frequently Asked Questions')}</h1>
            <p className="text-muted-foreground">
              {t('support.faq_description', 'Manage frequently asked questions and answers')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('support.faq.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.create_faq', 'Create FAQ')}
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
                  placeholder={t('common.search', 'Search FAQs...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

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

              <Select value={filters.published || 'all'} onValueChange={(value) => handleFilterChange('published', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="true">{t('support.published', 'Published')}</SelectItem>
                  <SelectItem value="false">{t('support.draft', 'Draft')}</SelectItem>
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

        {/* FAQs List */}
        <div className="space-y-4">
          {faqs.data.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <Collapsible>
                <CollapsibleTrigger
                  className="w-full"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <CardHeader className="text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
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
                        
                        <div className="flex items-center gap-2">
                          {expandedFAQs.has(faq.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <CardTitle className="text-lg leading-tight">
                            {faq.question}
                          </CardTitle>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {faq.author.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(faq.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {faq.view_count} views
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {faq.helpful_count} helpful ({faq.helpfulness_ratio}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={route('support.faq.show', faq.id)}>
                            <Eye className="h-3 w-3 mr-1" />
                            {t('common.view', 'View')}
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={route('support.faq.edit', faq.id)}>
                            <Edit className="h-3 w-3 mr-1" />
                            {t('common.edit', 'Edit')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-muted-foreground">
                        {faq.answer}
                      </div>
                    </div>
                    
                    {faq.tags && faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {faq.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {faqs.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('support.no_faqs', 'No FAQs found')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('support.no_faqs_description', 'Get started by creating your first FAQ.')}
              </p>
              <Button asChild>
                <Link href={route('support.faq.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('support.create_faq', 'Create FAQ')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {faqs.data.length > 0 && faqs.meta && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {faqs.data.length} of {faqs.meta.total || faqs.data.length} FAQs
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
