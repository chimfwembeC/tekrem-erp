import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

export default function Services() {
  const route = useRoute();
  const page = useTypedPage();
  const settings = page.props.settings || {};

  return (
    <GuestLayout title="Services">
      <Head title="Services" />

      {/* Hero Section */}
      <div className="relative bg-blue-600">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="People working on laptops"
          />
          <div className="absolute inset-0 bg-blue-600 mix-blend-multiply" aria-hidden="true"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Our Services</h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl">
            We provide comprehensive technology solutions to help businesses thrive in the digital age. From web and mobile development to AI and cloud solutions, we have the expertise to meet your needs.
          </p>
        </div>
      </div>

      {/* Main Services Section */}
      <div className="bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">What We Offer</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Comprehensive Technology Solutions
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              Our services are designed to help businesses of all sizes leverage technology to achieve their goals.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-16">
              {/* Service 1: Web Development */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                <div className="lg:col-span-5">
                  <img
                    className="h-56 w-full object-cover lg:h-full rounded-lg shadow-lg"
                    src="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                    alt="Web Development"
                  />
                </div>
                <div className="mt-8 lg:mt-0 lg:col-span-7">
                  <div className="text-base text-blue-600 font-semibold tracking-wide uppercase">01</div>
                  <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Web Development
                  </h3>
                  <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    We create custom websites and web applications that are responsive, user-friendly, and optimized for performance. Our web development services include:
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Corporate Websites</span> - Professional websites that showcase your brand and services
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">E-commerce Solutions</span> - Online stores with secure payment processing
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Web Applications</span> - Custom applications for specific business needs
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Content Management Systems</span> - Easy-to-update websites with WordPress, Drupal, or custom CMS
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service 2: Mobile App Development */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="text-base text-blue-600 font-semibold tracking-wide uppercase">02</div>
                  <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Mobile App Development
                  </h3>
                  <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    We develop native and cross-platform mobile applications for iOS and Android that help businesses engage with their customers and streamline operations.
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Native Apps</span> - iOS (Swift) and Android (Kotlin/Java) applications
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Cross-Platform Apps</span> - React Native and Flutter applications
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Progressive Web Apps</span> - Web applications with mobile app-like experience
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">App Maintenance</span> - Ongoing support and updates for existing applications
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 lg:mt-0 lg:col-span-5 order-1 lg:order-2">
                  <img
                    className="h-56 w-full object-cover lg:h-full rounded-lg shadow-lg"
                    src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                    alt="Mobile App Development"
                  />
                </div>
              </div>

              {/* Service 3: Desktop Software */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                <div className="lg:col-span-5">
                  <img
                    className="h-56 w-full object-cover lg:h-full rounded-lg shadow-lg"
                    src="https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80"
                    alt="Desktop Software"
                  />
                </div>
                <div className="mt-8 lg:mt-0 lg:col-span-7">
                  <div className="text-base text-blue-600 font-semibold tracking-wide uppercase">03</div>
                  <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Desktop Software
                  </h3>
                  <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    We develop custom desktop applications for Windows, macOS, and Linux that help businesses automate processes and improve productivity.
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Business Applications</span> - Custom software for specific business needs
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Point of Sale Systems</span> - Retail and restaurant management software
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Inventory Management</span> - Track and manage inventory with ease
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Cross-Platform Applications</span> - Electron and Qt applications
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Service 4: AI & Cloud Solutions */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="text-base text-blue-600 font-semibold tracking-wide uppercase">04</div>
                  <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    AI & Cloud Solutions
                  </h3>
                  <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    We help businesses leverage artificial intelligence and cloud technologies to gain insights, automate processes, and scale operations.
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Machine Learning</span> - Custom ML models for prediction and classification
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Natural Language Processing</span> - Chatbots and text analysis
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">Cloud Migration</span> - Move your applications to AWS, Azure, or Google Cloud
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">DevOps</span> - CI/CD pipelines and infrastructure as code
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 lg:mt-0 lg:col-span-5 order-1 lg:order-2">
                  <img
                    className="h-56 w-full object-cover lg:h-full rounded-lg shadow-lg"
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                    alt="AI & Cloud Solutions"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start your project?</span>
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
    </GuestLayout>
  );
}
