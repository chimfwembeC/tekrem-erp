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
  Star,
  Phone,
  Mail,
  Globe,
  Headphones,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import useRoute from '@/Hooks/useRoute';

export default function Help() {
  const route = useRoute();

  const helpCategories = [
    {
      id: 1,
      title: 'Getting Started',
      description: 'Learn the basics of our services and how to get started',
      icon: <BookOpen className="h-6 w-6" />,
      articles: [
        'How to request a quote',
        'Understanding our services',
        'Project timeline expectations',
        'Communication process'
      ]
    },
    {
      id: 2,
      title: 'Services & Pricing',
      description: 'Information about our services and pricing structure',
      icon: <FileText className="h-6 w-6" />,
      articles: [
        'Web development pricing',
        'Mobile app development costs',
        'AI solutions overview',
        'Custom project pricing'
      ]
    },
    {
      id: 3,
      title: 'Project Management',
      description: 'How we manage projects and client communication',
      icon: <Users className="h-6 w-6" />,
      articles: [
        'Project phases explained',
        'Client collaboration tools',
        'Progress tracking',
        'Change request process'
      ]
    },
    {
      id: 4,
      title: 'Technical Support',
      description: 'Technical questions and troubleshooting',
      icon: <Headphones className="h-6 w-6" />,
      articles: [
        'Browser compatibility',
        'Mobile responsiveness',
        'Performance optimization',
        'Security best practices'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Request a Quote',
      description: 'Get a custom quote for your project',
      icon: <FileText className="h-5 w-5" />,
      href: route('guest.quote.create'),
      color: 'bg-blue-500'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: <MessageSquare className="h-5 w-5" />,
      href: route('guest.support.index'),
      color: 'bg-green-500'
    },
    {
      title: 'View FAQ',
      description: 'Find answers to common questions',
      icon: <HelpCircle className="h-5 w-5" />,
      href: route('faq'),
      color: 'bg-purple-500'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our team in real-time',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '#',
      color: 'bg-orange-500',
      onClick: () => {
        // This would trigger the guest chat widget
        const chatWidget = document.querySelector('[data-guest-chat-trigger]');
        if (chatWidget) {
          (chatWidget as HTMLElement).click();
        }
      }
    }
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'support@tekrem.com',
      icon: <Mail className="h-5 w-5" />,
      detail: 'Response within 24 hours'
    },
    {
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      icon: <Phone className="h-5 w-5" />,
      detail: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      title: 'Live Chat',
      description: 'Available on website',
      icon: <MessageSquare className="h-5 w-5" />,
      detail: 'Instant response'
    }
  ];

  return (
    <GuestLayout title="Help Center">
      <Head title="Help Center" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-white mb-4" />
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight">
              Help Center
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-blue-100">
              Find answers to your questions and get the support you need
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Get started with these common tasks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {action.description}
                </p>
                {action.onClick ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={action.onClick}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={action.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Browse Help Topics
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Find detailed information organized by category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{article}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    View All Articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Methods */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Still Need Help?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our support team is here to help you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                    {method.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                <p className="text-gray-900 dark:text-white font-medium mb-1">
                  {method.description}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild>
              <Link href={route('contact')}>
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
