import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar, 
  Building, 
  Code, 
  Eye,
  ArrowRight
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

interface Project {
  id: number;
  name: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  client_name: string;
  tags: string[];
  images: string[];
  features: string[];
  technologies: string[];
  live_url?: string;
  case_study_url?: string;
  testimonial?: {
    content: string;
    author_name: string;
  };
}

interface PaginatedProjects {
  data: Project[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Props {
  projects: PaginatedProjects;
  categories: string[];
  filters: {
    type?: string;
    search?: string;
  };
}

export default function Index({ projects, categories, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.type || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/guest/portfolio', {
      search: searchTerm,
      type: selectedCategory,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    router.get('/guest/portfolio', {
      search: searchTerm,
      type: category,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <GuestLayout title="Our Portfolio">
      <Head title="Our Portfolio" />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Portfolio</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our successful projects and see how we've helped businesses achieve their goals.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </form>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter('')}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          {projects.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {projects.data.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Project Image */}
                    {project.images.length > 0 && (
                      <div className="aspect-video bg-gray-200 relative overflow-hidden">
                        <img
                          src={project.images[0]}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <Link href={`/guest/portfolio/${project.id}`}>
                            <Button variant="secondary" size="sm" className="opacity-0 hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {project.description}
                          </CardDescription>
                        </div>
                        {project.live_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Client and Date */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{project.client_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(project.end_date)}</span>
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <Badge variant="secondary">
                          {project.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>

                      {/* Technologies */}
                      {project.technologies.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Code className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Technologies:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.technologies.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Testimonial Preview */}
                      {project.testimonial && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 italic line-clamp-2">
                            "{project.testimonial.content}"
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            - {project.testimonial.author_name}
                          </p>
                        </div>
                      )}

                      {/* View Details Button */}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/guest/portfolio/${project.id}`}>
                          View Case Study
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {projects.last_page > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    {projects.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        asChild={!!link.url}
                      >
                        {link.url ? (
                          <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ) : (
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                  <p>Try adjusting your search criteria or browse all categories.</p>
                </div>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  router.get('/guest/portfolio');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Let's discuss how we can help bring your vision to life. Get in touch for a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" asChild>
                  <Link href="/guest/project">
                    Start a Project
                  </Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600" asChild>
                  <Link href="/guest/quote">
                    Get a Quote
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
