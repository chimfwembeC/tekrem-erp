export interface ServiceFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServicePackage {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface ServiceData {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  heroImage?: string;
  features: ServiceFeature[];
  benefits: ServiceBenefit[];
  packages: ServicePackage[];
  technologies: string[];
  processSteps: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const servicesData: Record<string, ServiceData> = {
  'web-development': {
    id: 'web-development',
    title: 'Web Development',
    shortDescription: 'Custom websites and web applications',
    fullDescription: 'We create modern, responsive, and scalable web solutions tailored to your business needs. From simple websites to complex web applications, our team delivers high-quality solutions using the latest technologies.',
    features: [
      {
        title: 'Responsive Design',
        description: 'Mobile-first approach ensuring your website looks great on all devices',
      },
      {
        title: 'Modern Technologies',
        description: 'Built with React, Laravel, and other cutting-edge frameworks',
      },
      {
        title: 'SEO Optimized',
        description: 'Search engine friendly code and structure for better visibility',
      },
      {
        title: 'Fast Performance',
        description: 'Optimized for speed and performance with modern best practices',
      },
    ],
    benefits: [
      {
        title: 'Increased Online Presence',
        description: 'Professional website that represents your brand effectively',
      },
      {
        title: 'Better User Experience',
        description: 'Intuitive navigation and design that converts visitors to customers',
      },
      {
        title: 'Scalable Solutions',
        description: 'Built to grow with your business needs',
      },
    ],
    packages: [
      {
        name: 'Starter',
        price: '$2,999',
        description: 'Perfect for small businesses and startups',
        features: [
          'Up to 5 pages',
          'Responsive design',
          'Contact form',
          'Basic SEO',
          '3 months support',
        ],
      },
      {
        name: 'Professional',
        price: '$5,999',
        description: 'Ideal for growing businesses',
        features: [
          'Up to 15 pages',
          'Custom design',
          'CMS integration',
          'Advanced SEO',
          'E-commerce ready',
          '6 months support',
        ],
        popular: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations with complex needs',
        features: [
          'Unlimited pages',
          'Custom functionality',
          'API integrations',
          'Advanced security',
          'Performance optimization',
          '12 months support',
        ],
      },
    ],
    technologies: ['React', 'Laravel', 'TypeScript', 'Tailwind CSS', 'MySQL', 'Redis'],
    processSteps: [
      'Discovery & Planning',
      'Design & Wireframing',
      'Development & Testing',
      'Launch & Deployment',
      'Maintenance & Support',
    ],
    faq: [
      {
        question: 'How long does it take to build a website?',
        answer: 'Typically 4-12 weeks depending on complexity and requirements.',
      },
      {
        question: 'Do you provide ongoing maintenance?',
        answer: 'Yes, we offer maintenance packages to keep your website updated and secure.',
      },
      {
        question: 'Can you redesign my existing website?',
        answer: 'Absolutely! We can redesign and modernize your existing website.',
      },
    ],
  },
  'mobile-apps': {
    id: 'mobile-apps',
    title: 'Mobile Apps',
    shortDescription: 'Native and cross-platform mobile solutions',
    fullDescription: 'We develop high-performance mobile applications for iOS and Android platforms. Whether you need a native app or cross-platform solution, we deliver user-friendly mobile experiences that engage your audience.',
    features: [
      {
        title: 'Cross-Platform Development',
        description: 'Single codebase for both iOS and Android using React Native',
      },
      {
        title: 'Native Performance',
        description: 'Optimized for speed and smooth user experience',
      },
      {
        title: 'Offline Functionality',
        description: 'Apps that work even without internet connection',
      },
      {
        title: 'Push Notifications',
        description: 'Keep users engaged with targeted notifications',
      },
    ],
    benefits: [
      {
        title: 'Reach More Customers',
        description: 'Access to millions of mobile users on app stores',
      },
      {
        title: 'Enhanced User Engagement',
        description: 'Direct communication channel with your customers',
      },
      {
        title: 'Competitive Advantage',
        description: 'Stand out from competitors with a professional mobile presence',
      },
    ],
    packages: [
      {
        name: 'Basic App',
        price: '$8,999',
        description: 'Simple app with core functionality',
        features: [
          'Cross-platform development',
          'Basic UI/UX design',
          'User authentication',
          'Push notifications',
          'App store submission',
        ],
      },
      {
        name: 'Advanced App',
        price: '$15,999',
        description: 'Feature-rich app with custom functionality',
        features: [
          'Custom design & animations',
          'API integrations',
          'Offline functionality',
          'In-app purchases',
          'Analytics integration',
          'Admin dashboard',
        ],
        popular: true,
      },
      {
        name: 'Enterprise App',
        price: 'Custom',
        description: 'Complex app with enterprise features',
        features: [
          'Advanced security',
          'Multi-language support',
          'Custom backend',
          'Third-party integrations',
          'Performance optimization',
          'Ongoing maintenance',
        ],
      },
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Node.js'],
    processSteps: [
      'Concept & Strategy',
      'UI/UX Design',
      'Development & Testing',
      'App Store Submission',
      'Launch & Marketing',
    ],
    faq: [
      {
        question: 'Should I choose native or cross-platform development?',
        answer: 'Cross-platform is cost-effective for most businesses, while native offers maximum performance.',
      },
      {
        question: 'How much does app store submission cost?',
        answer: 'Apple App Store: $99/year, Google Play Store: $25 one-time fee.',
      },
      {
        question: 'Do you help with app store optimization?',
        answer: 'Yes, we assist with app store listings, keywords, and screenshots.',
      },
    ],
  },
  'ai-solutions': {
    id: 'ai-solutions',
    title: 'AI Solutions',
    shortDescription: 'Intelligent automation and data analysis',
    fullDescription: 'Harness the power of artificial intelligence to automate processes, gain insights from data, and enhance customer experiences. Our AI solutions are designed to solve real business problems and drive growth.',
    features: [
      {
        title: 'Machine Learning Models',
        description: 'Custom ML models trained on your specific data and use cases',
      },
      {
        title: 'Natural Language Processing',
        description: 'Chatbots, sentiment analysis, and text processing capabilities',
      },
      {
        title: 'Computer Vision',
        description: 'Image recognition, object detection, and visual analysis',
      },
      {
        title: 'Predictive Analytics',
        description: 'Forecast trends and make data-driven decisions',
      },
    ],
    benefits: [
      {
        title: 'Increased Efficiency',
        description: 'Automate repetitive tasks and reduce manual work',
      },
      {
        title: 'Better Decision Making',
        description: 'Data-driven insights for strategic business decisions',
      },
      {
        title: 'Enhanced Customer Experience',
        description: 'Personalized interactions and 24/7 AI assistance',
      },
    ],
    packages: [
      {
        name: 'AI Starter',
        price: '$12,999',
        description: 'Basic AI implementation for small businesses',
        features: [
          'Chatbot development',
          'Basic data analysis',
          'Simple automation',
          'Integration support',
          '3 months training',
        ],
      },
      {
        name: 'AI Professional',
        price: '$25,999',
        description: 'Advanced AI solutions for growing businesses',
        features: [
          'Custom ML models',
          'Advanced analytics',
          'Process automation',
          'API integrations',
          'Performance monitoring',
          '6 months support',
        ],
        popular: true,
      },
      {
        name: 'AI Enterprise',
        price: 'Custom',
        description: 'Comprehensive AI transformation',
        features: [
          'Full AI strategy',
          'Multiple AI models',
          'Enterprise integrations',
          'Custom training',
          'Ongoing optimization',
          'Dedicated support',
        ],
      },
    ],
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'Mistral AI', 'AWS AI'],
    processSteps: [
      'AI Strategy & Assessment',
      'Data Preparation',
      'Model Development',
      'Testing & Validation',
      'Deployment & Monitoring',
    ],
    faq: [
      {
        question: 'What data do I need for AI implementation?',
        answer: 'The amount and type of data depends on your specific use case. We can assess your data readiness.',
      },
      {
        question: 'How long does AI development take?',
        answer: 'Typically 3-6 months depending on complexity and data availability.',
      },
      {
        question: 'Can AI integrate with my existing systems?',
        answer: 'Yes, we design AI solutions to work seamlessly with your current infrastructure.',
      },
    ],
  },
  'cloud-services': {
    id: 'cloud-services',
    title: 'Cloud Services',
    shortDescription: 'Scalable and secure cloud infrastructure',
    fullDescription: 'Migrate to the cloud and leverage scalable, secure, and cost-effective infrastructure solutions. We help businesses modernize their IT infrastructure and take advantage of cloud computing benefits.',
    features: [
      {
        title: 'Cloud Migration',
        description: 'Seamless migration of your existing systems to the cloud',
      },
      {
        title: 'Auto Scaling',
        description: 'Automatically scale resources based on demand',
      },
      {
        title: 'Security & Compliance',
        description: 'Enterprise-grade security and compliance standards',
      },
      {
        title: '24/7 Monitoring',
        description: 'Continuous monitoring and proactive maintenance',
      },
    ],
    benefits: [
      {
        title: 'Cost Reduction',
        description: 'Pay only for what you use and reduce infrastructure costs',
      },
      {
        title: 'Improved Reliability',
        description: 'High availability and disaster recovery capabilities',
      },
      {
        title: 'Enhanced Security',
        description: 'Advanced security features and regular updates',
      },
    ],
    packages: [
      {
        name: 'Cloud Starter',
        price: '$999/month',
        description: 'Basic cloud setup for small businesses',
        features: [
          'Cloud migration assessment',
          'Basic infrastructure setup',
          'Security configuration',
          'Monthly monitoring',
          'Email support',
        ],
      },
      {
        name: 'Cloud Professional',
        price: '$2,999/month',
        description: 'Comprehensive cloud solution',
        features: [
          'Full cloud migration',
          'Auto-scaling setup',
          'Advanced monitoring',
          'Backup & disaster recovery',
          'Priority support',
          'Performance optimization',
        ],
        popular: true,
      },
      {
        name: 'Cloud Enterprise',
        price: 'Custom',
        description: 'Enterprise-grade cloud infrastructure',
        features: [
          'Multi-cloud strategy',
          'Custom architecture',
          'Advanced security',
          'Compliance management',
          'Dedicated support team',
          'SLA guarantees',
        ],
      },
    ],
    technologies: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
    processSteps: [
      'Cloud Assessment',
      'Migration Planning',
      'Infrastructure Setup',
      'Data Migration',
      'Testing & Optimization',
    ],
    faq: [
      {
        question: 'Which cloud provider should I choose?',
        answer: 'We help you choose the best provider based on your specific needs and budget.',
      },
      {
        question: 'How long does cloud migration take?',
        answer: 'Typically 2-8 weeks depending on the complexity of your current infrastructure.',
      },
      {
        question: 'What about data security during migration?',
        answer: 'We use encrypted channels and follow best practices to ensure data security throughout the process.',
      },
    ],
  },
};

export const getAllServices = () => Object.values(servicesData);

export const getServiceBySlug = (slug: string) => servicesData[slug] || null;
