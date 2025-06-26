import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
  HelpCircle, 
  MessageSquare, 
  Search, 
  BookOpen, 
  FileText, 
  Users, 
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  view_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  articles_count: number;
}

interface Props {
  featuredArticles: Article[];
  categories: Category[];
}

export default function Index({ featuredArticles, categories }: Props) {
  return (
    <GuestLayout title="Support Center">
      <Head title="Support Center" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to your questions, browse our knowledge base, or get in touch with our support team.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/guest/support/knowledge-base">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Browse our comprehensive collection of articles and guides
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/guest/support/ticket">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Submit a Ticket</CardTitle>
                  <CardDescription>
                    Get personalized help from our support team
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/guest/support/ticket/status">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Check Ticket Status</CardTitle>
                  <CardDescription>
                    Track the progress of your support requests
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Popular Articles</h2>
                <Button variant="outline" asChild>
                  <Link href="/guest/support/knowledge-base">
                    View All Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <Link href={`/guest/support/article/${article.slug}`}>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {article.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{article.view_count} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>Featured</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <Link href={`/guest/support/knowledge-base?category=${category.slug}`}>
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {category.icon ? (
                              <span className="text-lg">{category.icon}</span>
                            ) : (
                              <HelpCircle className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <Badge variant="secondary">
                              {category.articles_count} articles
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still Need Help?</CardTitle>
              <CardDescription className="text-blue-100">
                Our support team is here to help you with any questions or issues you may have.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Live Chat</h3>
                  <p className="text-sm text-blue-100">Available 24/7</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Response Time</h3>
                  <p className="text-sm text-blue-100">Within 2 hours</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Expert Team</h3>
                  <p className="text-sm text-blue-100">Technical specialists</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" asChild>
                  <Link href="/guest/support/ticket">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit a Ticket
                  </Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/guest/inquiry">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    General Inquiry
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GuestLayout>
  );
}
