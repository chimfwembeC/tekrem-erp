import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

interface Props {
  canLogin: boolean;
  canRegister: boolean;
}

export default function Home({ canLogin, canRegister }: Props) {
  const route = useRoute();
  const page = useTypedPage();
  const settings = page.props.settings || {};

  return (
    <GuestLayout title="Home">
      <Head title="Home" />

      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white dark:text-gray-900 transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <div className="relative pt-6 px-4 sm:px-6 lg:px-8"></div>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Technology Solutions for</span>{' '}
                  <span className="block text-blue-600 xl:inline">Modern Businesses</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {settings.company_name || 'Technology Remedies Innovations'} provides cutting-edge technology solutions to help businesses in Zambia and beyond thrive in the digital age.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href={route('services')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Our Services
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href={route('contact')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="Team working on software development"
          />
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-blue-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Impact</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Delivering Results That Matter
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">100+</div>
              <div className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Clients Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">250+</div>
              <div className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">10+</div>
              <div className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-blue-600">98%</div>
              <div className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to build your business
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              Our comprehensive suite of technology solutions helps you streamline operations, enhance customer experiences, and drive growth.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Web Development</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Custom websites and web applications tailored to your business needs, from simple brochure sites to complex enterprise platforms.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Mobile App Development</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Native and cross-platform mobile applications for iOS and Android that help you reach customers wherever they are.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Data Analytics</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Turn your data into actionable insights with our analytics solutions, helping you make informed business decisions.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">AI Solutions</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Leverage the power of artificial intelligence to automate processes, enhance customer experiences, and gain competitive advantages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Why Choose Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Your Trusted Technology Partner
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              We combine technical expertise with business acumen to deliver solutions that drive real results.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Proven Expertise</h3>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                  Our team brings years of experience across various industries and technologies, ensuring high-quality solutions.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Innovative Solutions</h3>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                  We stay at the forefront of technology trends to deliver cutting-edge solutions that give you a competitive edge.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Client-Focused Approach</h3>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                  We prioritize understanding your business needs and goals to deliver tailored solutions that drive real value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              What Our Clients Say
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">ZB</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Zambia Bank</h4>
                    <p className="text-gray-600 dark:text-gray-400">Financial Services</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  "TekRem helped us modernize our digital banking platform, resulting in a 40% increase in online transactions and significantly improved customer satisfaction."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">LR</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lusaka Retail</h4>
                    <p className="text-gray-600 dark:text-gray-400">Retail Chain</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  "The inventory management system developed by TekRem has streamlined our operations and reduced stockouts by 60%. Their team was professional and delivered on time."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">ZH</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Zambia Healthcare</h4>
                    <p className="text-gray-600 dark:text-gray-400">Healthcare Provider</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  "TekRem's patient management system has revolutionized how we deliver care. The mobile app for patients has been particularly well-received."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Partners</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Trusted by Leading Organizations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
            {/* Partner logos - using placeholder colored boxes with text for now */}
            <div className="flex items-center justify-center h-20 bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2">
              <span className="text-gray-500 dark:text-gray-300 font-semibold">Partner 1</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2">
              <span className="text-gray-500 dark:text-gray-300 font-semibold">Partner 2</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2">
              <span className="text-gray-500 dark:text-gray-300 font-semibold">Partner 3</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2">
              <span className="text-gray-500 dark:text-gray-300 font-semibold">Partner 4</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2">
              <span className="text-gray-500 dark:text-gray-300 font-semibold">Partner 5</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-white dark:bg-gray-700 rounded-lg shadow px-4 py-2">
              <span className="text-gray-500 dark:text-gray-300 font-semibold">Partner 6</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Contact us today for a free consultation.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href={route('contact')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Latest News</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Stay Updated with Our Blog
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              Insights, tips, and updates from our technology experts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Blog Post 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-300 dark:bg-gray-700">
                {/* Placeholder for blog image */}
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400">Blog Image</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-blue-600 mb-2">June 15, 2023</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  The Future of AI in Business Applications
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Explore how artificial intelligence is transforming business operations and customer experiences.
                </p>
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More →
                </Link>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-300 dark:bg-gray-700">
                {/* Placeholder for blog image */}
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400">Blog Image</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-blue-600 mb-2">May 28, 2023</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Cybersecurity Best Practices for SMEs
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Essential security measures that small and medium enterprises should implement to protect their data.
                </p>
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More →
                </Link>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-300 dark:bg-gray-700">
                {/* Placeholder for blog image */}
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400">Blog Image</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-blue-600 mb-2">April 10, 2023</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Digital Transformation in Zambia's Financial Sector
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  How local financial institutions are leveraging technology to improve services and reach more customers.
                </p>
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="#" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              View All Posts
            </Link>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
