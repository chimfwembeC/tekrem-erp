import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    HelpCircle, 
    Search, 
    ChevronDown, 
    ChevronUp,
    ArrowLeft,
    Filter,
    Eye,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

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
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Props {
    faqs: FAQ[];
    categories: Category[];
}

export default function FAQ({ faqs, categories }: Props) {
    const route = useRoute();
    const { t } = useTranslate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                               (faq.category && faq.category.id.toString() === selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (faqId: number) => {
        const newExpanded = new Set(expandedFAQs);
        if (newExpanded.has(faqId)) {
            newExpanded.delete(faqId);
        } else {
            newExpanded.add(faqId);
        }
        setExpandedFAQs(newExpanded);
    };

    const featuredFAQs = filteredFAQs.filter(faq => faq.is_featured);
    const regularFAQs = filteredFAQs.filter(faq => !faq.is_featured);

    return (
        <CustomerLayout>
            <Head title={t('support.faq', 'FAQ')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.support.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('common.back', 'Back')}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{t('support.faq', 'Frequently Asked Questions')}</h1>
                            <p className="text-muted-foreground">
                                {t('support.faq_description', 'Find answers to common questions')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('support.search_faqs', 'Search FAQs...')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-48">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder={t('support.select_category', 'Select Category')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all_categories', 'All Categories')}</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {t('support.showing_faqs', 'Showing {{count}} FAQ(s)', { count: filteredFAQs.length })}
                    </p>
                </div>

                {/* Featured FAQs */}
                {featuredFAQs.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            {t('support.featured_faqs', 'Featured FAQs')}
                        </h2>
                        <div className="space-y-3">
                            {featuredFAQs.map((faq) => (
                                <Card key={faq.id} className="border-l-4 border-l-primary">
                                    <CardContent className="pt-4">
                                        <button
                                            onClick={() => toggleFAQ(faq.id)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {faq.category && (
                                                            <Badge 
                                                                variant="secondary"
                                                                style={{ backgroundColor: faq.category.color + '20', color: faq.category.color }}
                                                            >
                                                                {faq.category.name}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            {faq.view_count}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {expandedFAQs.has(faq.id) ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </button>
                                        {expandedFAQs.has(faq.id) && (
                                            <div className="mt-4 pt-4 border-t">
                                                <div 
                                                    className="prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                                    <span className="text-sm text-muted-foreground">
                                                        {t('support.was_helpful', 'Was this helpful?')}
                                                    </span>
                                                    <Button variant="outline" size="sm">
                                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                                        {faq.helpful_count}
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <ThumbsDown className="h-3 w-3 mr-1" />
                                                        {faq.not_helpful_count}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular FAQs */}
                {regularFAQs.length > 0 && (
                    <div className="space-y-4">
                        {featuredFAQs.length > 0 && (
                            <h2 className="text-lg font-semibold">
                                {t('support.all_faqs', 'All FAQs')}
                            </h2>
                        )}
                        <div className="space-y-3">
                            {regularFAQs.map((faq) => (
                                <Card key={faq.id}>
                                    <CardContent className="pt-4">
                                        <button
                                            onClick={() => toggleFAQ(faq.id)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium mb-2">{faq.question}</h3>
                                                    <div className="flex items-center gap-2">
                                                        {faq.category && (
                                                            <Badge 
                                                                variant="secondary"
                                                                style={{ backgroundColor: faq.category.color + '20', color: faq.category.color }}
                                                            >
                                                                {faq.category.name}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            {faq.view_count}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {expandedFAQs.has(faq.id) ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </button>
                                        {expandedFAQs.has(faq.id) && (
                                            <div className="mt-4 pt-4 border-t">
                                                <div 
                                                    className="prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                                    <span className="text-sm text-muted-foreground">
                                                        {t('support.was_helpful', 'Was this helpful?')}
                                                    </span>
                                                    <Button variant="outline" size="sm">
                                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                                        {faq.helpful_count}
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <ThumbsDown className="h-3 w-3 mr-1" />
                                                        {faq.not_helpful_count}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {filteredFAQs.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('support.no_faqs_found', 'No FAQs found')}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm || selectedCategory !== 'all'
                                        ? t('support.no_faqs_match_filters', 'No FAQs match your current search or filters.')
                                        : t('support.no_faqs_available', 'No FAQs are currently available.')
                                    }
                                </p>
                                {(searchTerm || selectedCategory !== 'all') && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('all');
                                        }}
                                    >
                                        {t('common.clear_filters', 'Clear Filters')}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Support */}
                <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">
                                {t('support.still_need_help', 'Still need help?')}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {t('support.contact_support_description', 'Can\'t find what you\'re looking for? Create a support ticket and our team will help you.')}
                            </p>
                            <Link href={route('customer.support.create')}>
                                <Button>
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    {t('support.create_ticket', 'Create Support Ticket')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
