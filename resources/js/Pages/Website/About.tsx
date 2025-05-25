import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import useTypedPage from '@/Hooks/useTypedPage';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  Zap,
  Eye,
  Shield,
  CheckCircle2
} from 'lucide-react';

export default function About() {
  const page = useTypedPage();
  const settings = page.props.settings || {};

  return (
    <GuestLayout title="About Us">
      <Head title="About Us" />

      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-900 py-16 sm:py-24">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:gap-24 lg:items-start">
          <div className="relative sm:py-16 lg:py-0">
            <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0 lg:max-w-none">
              <div className="relative rounded-2xl shadow-xl overflow-hidden">
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
                  alt="Team working together"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 mix-blend-multiply" />
                <div className="relative px-8 py-72">
                  <blockquote className="mt-8">
                    <div className="relative text-lg font-medium text-white md:flex-grow">
                      <svg
                        className="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                      </svg>
                      <p className="relative">
                        Our mission is to empower businesses in Zambia and beyond with innovative technology solutions that drive growth and success.
                      </p>
                    </div>
                    <footer className="mt-4">
                      <p className="text-base font-semibold text-blue-200">CEO, {settings.company_name || 'Technology Remedies Innovations'}</p>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0">
            {/* Content */}
            <div className="pt-12 sm:pt-16 lg:pt-20">
              <h2 className="text-3xl text-gray-900 dark:text-white font-extrabold tracking-tight sm:text-4xl">
                About {settings.company_name || 'Technology Remedies Innovations'}
              </h2>
              <div className="mt-6 text-gray-500 dark:text-gray-400 space-y-6">
                <p className="text-lg">
                  Founded in 2020, {settings.company_name || 'Technology Remedies Innovations'} has quickly established itself as a leading technology solutions provider in Zambia. We specialize in web development, mobile applications, desktop software, and AI solutions.
                </p>
                <p className="text-lg">
                  Our team of experienced developers, designers, and consultants work closely with clients to understand their unique challenges and deliver tailored solutions that drive business growth and operational efficiency.
                </p>
                <p className="text-lg">
                  We believe in the power of technology to transform businesses and communities. Our commitment to innovation, quality, and customer satisfaction has earned us the trust of clients across various industries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values Section */}
      <div className="bg-muted py-16 sm:py-24">
        <div className="container">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 text-primary">Our Foundation</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Mission, Vision & Values
            </h2>
            <Separator className="mx-auto w-24 my-6" />
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Mission */}
              <Card className="overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To empower businesses with innovative technology solutions that drive growth, efficiency, and competitive advantage in the digital age.
                  </p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To be the leading technology partner for businesses in Africa, known for our innovation, quality, and commitment to client success.
                  </p>
                </CardContent>
              </Card>

              {/* Values */}
              <Card className="overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                <CardContent className="p-6">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 text-center">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-center">Our Values</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>Innovation: We embrace new technologies and creative solutions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>Excellence: We strive for the highest quality in everything we do</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>Integrity: We operate with honesty and transparency</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>Client Focus: We prioritize our clients' success</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-background py-16 sm:py-24">
        <div className="container">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 text-primary">Our Team</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Meet the Experts Behind Our Success
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto">
              Our diverse team of professionals brings together expertise in software development, design, business analysis, and project management.
            </p>
            <Separator className="mx-auto w-24 my-6" />
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Team Member 1 */}
              <Card className="overflow-hidden border-none shadow-lg">
                <CardContent className="p-0">
                  <div className="p-6 text-center">
                    <Avatar className="h-40 w-40 mx-auto mb-6">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                        alt="Jane Doe"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-medium">Jane Doe</h3>
                    <Badge variant="secondary" className="mt-1">CEO & Founder</Badge>
                    <p className="mt-4 text-muted-foreground">
                      15+ years of experience in technology leadership and business development.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Team Member 2 */}
              <Card className="overflow-hidden border-none shadow-lg">
                <CardContent className="p-0">
                  <div className="p-6 text-center">
                    <Avatar className="h-40 w-40 mx-auto mb-6">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                        alt="John Smith"
                      />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-medium">John Smith</h3>
                    <Badge variant="secondary" className="mt-1">CTO</Badge>
                    <p className="mt-4 text-muted-foreground">
                      Expert in software architecture with a focus on scalable enterprise solutions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Team Member 3 */}
              <Card className="overflow-hidden border-none shadow-lg">
                <CardContent className="p-0">
                  <div className="p-6 text-center">
                    <Avatar className="h-40 w-40 mx-auto mb-6">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                        alt="Sarah Johnson"
                      />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-medium">Sarah Johnson</h3>
                    <Badge variant="secondary" className="mt-1">Lead Designer</Badge>
                    <p className="mt-4 text-muted-foreground">
                      Award-winning designer specializing in user experience and interface design.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
