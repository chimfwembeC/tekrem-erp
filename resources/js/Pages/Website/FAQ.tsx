import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  ArrowRight,
  Clock,
  DollarSign,
  Code,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import useRoute from '@/Hooks/useRoute';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

export default function FAQ() {
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: 1,
      question: "What services does TekRem offer?",
      answer: "TekRem offers comprehensive technology solutions including web development, mobile app development, AI solutions, cloud services, and custom software development. We specialize in creating scalable, modern applications for businesses of all sizes.",
      category: "general",
      popular: true
    },
    {
      id: 2,
      question: "How do I get started with a project?",
      answer: "Getting started is easy! Simply request a quote through our website, and our team will contact you within 24 hours to discuss your project requirements, timeline, and budget. We'll provide a detailed proposal tailored to your needs.",
      category: "general",
      popular: true
    },
    {
      id: 3,
      question: "Do you work with small businesses or only large enterprises?",
      answer: "We work with businesses of all sizes, from startups and small businesses to large enterprises. Our solutions are scalable and can be tailored to fit any budget and requirement.",
      category: "general",
      popular: false
    },

    // Pricing Questions
    {
      id: 4,
      question: "How much does a typical web development project cost?",
      answer: "Project costs vary based on complexity, features, and timeline. Basic websites start from $5,000, while complex web applications can range from $15,000 to $50,000+. We provide detailed quotes after understanding your specific requirements.",
      category: "pricing",
      popular: true
    },
    {
      id: 5,
      question: "Do you offer payment plans or financing options?",
      answer: "Yes, we offer flexible payment plans for projects over $10,000. Typically, we structure payments in milestones: 30% upfront, 40% at midpoint, and 30% upon completion. Custom payment arrangements can be discussed for larger projects.",
      category: "pricing",
      popular: false
    },
    {
      id: 6,
      question: "Are there any hidden fees or additional costs?",
      answer: "No, we believe in transparent pricing. All costs are outlined in our initial proposal. Any additional work outside the original scope will be discussed and approved before implementation.",
      category: "pricing",
      popular: false
    },

    // Technical Questions
    {
      id: 7,
      question: "What technologies do you use for development?",
      answer: "We use modern, industry-standard technologies including React, Laravel, Node.js, Python, React Native, Flutter, AWS, and more. We choose the best technology stack based on your project requirements and long-term goals.",
      category: "technical",
      popular: true
    },
    {
      id: 8,
      question: "Do you provide ongoing maintenance and support?",
      answer: "Yes, we offer comprehensive maintenance packages including security updates, bug fixes, performance optimization, and feature enhancements. Our support plans start from $500/month depending on the complexity of your application.",
      category: "technical",
      popular: true
    },
    {
      id: 9,
      question: "Can you integrate with our existing systems?",
      answer: "Absolutely! We have extensive experience integrating with various third-party systems, APIs, databases, and legacy applications. We'll assess your current infrastructure and provide seamless integration solutions.",
      category: "technical",
      popular: false
    },

    // Process Questions
    {
      id: 10,
      question: "What is your typical project timeline?",
      answer: "Timelines vary by project complexity. Simple websites take 4-6 weeks, while complex applications can take 3-6 months. We provide detailed project timelines with milestones during the planning phase.",
      category: "process",
      popular: true
    },
    {
      id: 11,
      question: "How do you handle project communication?",
      answer: "We use modern project management tools and provide regular updates through weekly reports, milestone reviews, and dedicated project managers. You'll have access to our project portal to track progress in real-time.",
      category: "process",
      popular: false
    },
    {
      id: 12,
      question: "What happens if I need changes during development?",
      answer: "Minor changes within the original scope are included. For significant changes, we'll provide a change request with time and cost implications. We're flexible and work with you to accommodate necessary modifications.",
      category: "process",
      popular: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'general', name: 'General', icon: <Users className="h-4 w-4" /> },
    { id: 'pricing', name: 'Pricing', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'technical', name: 'Technical', icon: <Code className="h-4 w-4" /> },
    { id: 'process', name: 'Process', icon: <Zap className="h-4 w-4" /> }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = faqData.filter(faq => faq.popular);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <GuestLayout title="Frequently Asked Questions">
      <Head title="FAQ" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-white mb-4" />
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-purple-100">
              Find quick answers to common questions about our services and processes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Questions */}
        {selectedCategory === 'all' && !searchTerm && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularFAQs.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {faq.question}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {searchTerm ? `Search Results (${filteredFAQs.length})` : 
             selectedCategory === 'all' ? 'All Questions' : 
             categories.find(c => c.id === selectedCategory)?.name + ' Questions'}
          </h2>

          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No questions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or browse different categories.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleExpanded(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {faq.question}
                        {faq.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {faq.category}
                      </CardDescription>
                    </div>
                    {expandedItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedItems.includes(faq.id) && (
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href={route('contact')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={route('help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Visit Help Center
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
