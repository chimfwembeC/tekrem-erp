<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class CMSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user
        $admin = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$admin) {
            $this->command->info('Please run the RoleSeeder and UserSeeder first.');
            return;
        }

        // Create default CMS templates
        $templates = [
            [
                'name' => 'Default Page',
                'slug' => 'default-page',
                'description' => 'Standard page template with header, content, and footer',
                'content' => '<div class="container mx-auto px-4 py-8">
    <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">{{ $page->title }}</h1>
        @if($page->excerpt)
            <p class="text-xl text-gray-600 mt-4">{{ $page->excerpt }}</p>
        @endif
    </header>
    
    <main class="prose prose-lg max-w-none">
        {!! $page->content !!}
    </main>
</div>',
                'fields' => json_encode([
                    'show_breadcrumbs' => ['type' => 'boolean', 'default' => true],
                    'show_sidebar' => ['type' => 'boolean', 'default' => false],
                    'container_width' => ['type' => 'select', 'options' => ['container', 'container-fluid'], 'default' => 'container']
                ]),
                'settings' => json_encode([
                    'layout' => 'app',
                    'cache_enabled' => true,
                    'cache_duration' => 3600
                ]),
                'category' => 'general',
                'is_active' => true,
                'is_default' => true,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Landing Page',
                'slug' => 'landing-page',
                'description' => 'Hero section with call-to-action and features',
                'content' => '<div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-5xl font-bold mb-6">{{ $page->title }}</h1>
            @if($page->excerpt)
                <p class="text-xl mb-8">{{ $page->excerpt }}</p>
            @endif
            <a href="#content" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Learn More
            </a>
        </div>
    </section>
    
    <!-- Content Section -->
    <section id="content" class="py-16">
        <div class="container mx-auto px-4">
            <div class="prose prose-lg max-w-none">
                {!! $page->content !!}
            </div>
        </div>
    </section>
</div>',
                'fields' => json_encode([
                    'hero_background' => ['type' => 'image', 'default' => ''],
                    'cta_text' => ['type' => 'text', 'default' => 'Learn More'],
                    'cta_link' => ['type' => 'text', 'default' => '#content']
                ]),
                'settings' => json_encode([
                    'layout' => 'guest',
                    'full_width' => true,
                    'cache_enabled' => true,
                    'cache_duration' => 7200
                ]),
                'category' => 'marketing',
                'is_active' => true,
                'is_default' => false,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Blog Post',
                'slug' => 'blog-post',
                'description' => 'Article template with author info and related posts',
                'content' => '<article class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $page->title }}</h1>
        <div class="flex items-center text-gray-600 mb-4">
            <span>By {{ $page->author->name }}</span>
            <span class="mx-2">•</span>
            <time>{{ $page->published_at->format("F j, Y") }}</time>
        </div>
        @if($page->excerpt)
            <p class="text-xl text-gray-600 leading-relaxed">{{ $page->excerpt }}</p>
        @endif
    </header>
    
    <div class="prose prose-lg max-w-none">
        {!! $page->content !!}
    </div>
    
    <footer class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <img class="h-12 w-12 rounded-full" src="{{ $page->author->avatar ?? "/images/default-avatar.png" }}" alt="{{ $page->author->name }}">
            </div>
            <div class="ml-4">
                <p class="text-lg font-medium text-gray-900">{{ $page->author->name }}</p>
                <p class="text-gray-600">{{ $page->author->bio ?? "Content Author" }}</p>
            </div>
        </div>
    </footer>
</article>',
                'fields' => json_encode([
                    'show_author' => ['type' => 'boolean', 'default' => true],
                    'show_related' => ['type' => 'boolean', 'default' => true],
                    'show_comments' => ['type' => 'boolean', 'default' => false]
                ]),
                'settings' => json_encode([
                    'layout' => 'app',
                    'sidebar' => false,
                    'cache_enabled' => true,
                    'cache_duration' => 1800
                ]),
                'category' => 'blog',
                'is_active' => true,
                'is_default' => false,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($templates as $template) {
            DB::table('cms_templates')->insert($template);
        }

        // Create sample pages
        $pages = [
            [
                'title' => 'Welcome to TekRem ERP',
                'slug' => 'welcome',
                'excerpt' => 'Discover the power of our comprehensive Enterprise Resource Planning solution.',
                'content' => '<h2>About TekRem ERP</h2>
<p>TekRem ERP is a comprehensive business management solution designed to streamline your operations and boost productivity. Our platform integrates all aspects of your business into one unified system.</p>

<h3>Key Features</h3>
<ul>
    <li><strong>Customer Relationship Management (CRM)</strong> - Manage leads, clients, and communications</li>
    <li><strong>Financial Management</strong> - Track expenses, invoices, and budgets</li>
    <li><strong>Project Management</strong> - Plan, execute, and monitor projects</li>
    <li><strong>Support System</strong> - Handle customer support tickets efficiently</li>
    <li><strong>Content Management</strong> - Create and manage your website content</li>
</ul>

<h3>Why Choose TekRem?</h3>
<p>Our ERP solution is built with modern technologies and designed for scalability. Whether you\'re a small business or a large enterprise, TekRem adapts to your needs.</p>

<div class="bg-blue-50 p-6 rounded-lg mt-8">
    <h4 class="text-lg font-semibold text-blue-900 mb-2">Get Started Today</h4>
    <p class="text-blue-800">Ready to transform your business? Contact our team to schedule a demo and see how TekRem can help you achieve your goals.</p>
</div>',
                'template' => 'default-page',
                'layout' => 'default',
                'meta_title' => 'Welcome to TekRem ERP - Complete Business Management Solution',
                'meta_description' => 'Discover TekRem ERP, a comprehensive business management platform with CRM, finance, projects, support, and content management features.',
                'meta_keywords' => json_encode(['ERP', 'business management', 'CRM', 'finance', 'project management']),
                'status' => 'published',
                'published_at' => now(),
                'author_id' => $admin->id,
                'language' => 'en',
                'is_homepage' => true,
                'show_in_menu' => true,
                'require_auth' => false,
                'view_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'About Us',
                'slug' => 'about',
                'excerpt' => 'Learn more about our company and mission.',
                'content' => '<h2>Our Story</h2>
<p>TekRem was founded with a simple mission: to provide businesses with the tools they need to succeed in today\'s competitive marketplace. Our team of experienced developers and business analysts work together to create solutions that are both powerful and easy to use.</p>

<h3>Our Mission</h3>
<p>To empower businesses of all sizes with comprehensive, user-friendly software solutions that drive growth and efficiency.</p>

<h3>Our Values</h3>
<ul>
    <li><strong>Innovation</strong> - We continuously evolve our platform with the latest technologies</li>
    <li><strong>Reliability</strong> - Our systems are built for stability and performance</li>
    <li><strong>Support</strong> - We provide exceptional customer service and support</li>
    <li><strong>Transparency</strong> - We believe in honest communication and clear pricing</li>
</ul>

<h3>Our Team</h3>
<p>Our diverse team brings together expertise in software development, business process optimization, and customer success. We\'re passionate about helping businesses achieve their goals through technology.</p>',
                'template' => 'default-page',
                'layout' => 'default',
                'meta_title' => 'About TekRem - Our Story and Mission',
                'meta_description' => 'Learn about TekRem\'s mission to empower businesses with comprehensive ERP solutions. Discover our story, values, and team.',
                'meta_keywords' => json_encode(['about us', 'company', 'mission', 'team', 'values']),
                'status' => 'published',
                'published_at' => now(),
                'author_id' => $admin->id,
                'language' => 'en',
                'is_homepage' => false,
                'show_in_menu' => true,
                'require_auth' => false,
                'view_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact',
                'excerpt' => 'Get in touch with our team for support or inquiries.',
                'content' => '<h2>Get in Touch</h2>
<p>We\'d love to hear from you! Whether you have questions about our platform, need technical support, or want to discuss your business needs, our team is here to help.</p>

<div class="grid md:grid-cols-2 gap-8 mt-8">
    <div>
        <h3>Contact Information</h3>
        <div class="space-y-4">
            <div>
                <strong>Email:</strong><br>
                <a href="mailto:info@tekrem.com" class="text-blue-600 hover:underline">info@tekrem.com</a>
            </div>
            <div>
                <strong>Phone:</strong><br>
                <a href="tel:+1234567890" class="text-blue-600 hover:underline">+1 (234) 567-8900</a>
            </div>
            <div>
                <strong>Address:</strong><br>
                123 Business Street<br>
                Suite 100<br>
                City, State 12345
            </div>
        </div>
    </div>
    
    <div>
        <h3>Business Hours</h3>
        <div class="space-y-2">
            <div><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</div>
            <div><strong>Saturday:</strong> 10:00 AM - 4:00 PM</div>
            <div><strong>Sunday:</strong> Closed</div>
        </div>
        
        <div class="mt-6">
            <h4 class="font-semibold">Emergency Support</h4>
            <p class="text-sm text-gray-600">For critical issues, our emergency support line is available 24/7 for enterprise customers.</p>
        </div>
    </div>
</div>

<div class="bg-gray-50 p-6 rounded-lg mt-8">
    <h3>Request a Demo</h3>
    <p>Interested in seeing TekRem ERP in action? Schedule a personalized demo with our team to explore how our platform can benefit your business.</p>
    <a href="/demo" class="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Schedule Demo</a>
</div>',
                'template' => 'default-page',
                'layout' => 'default',
                'meta_title' => 'Contact TekRem - Get Support and Information',
                'meta_description' => 'Contact TekRem for support, inquiries, or to schedule a demo. Find our contact information and business hours.',
                'meta_keywords' => json_encode(['contact', 'support', 'demo', 'phone', 'email']),
                'status' => 'published',
                'published_at' => now(),
                'author_id' => $admin->id,
                'language' => 'en',
                'is_homepage' => false,
                'show_in_menu' => true,
                'require_auth' => false,
                'view_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($pages as $page) {
            DB::table('cms_pages')->insert($page);
        }

        // Create default menu
        $menuId = DB::table('cms_menus')->insertGetId([
            'name' => 'Main Navigation',
            'slug' => 'main-navigation',
            'description' => 'Primary website navigation menu',
            'location' => 'header',
            'is_active' => true,
            'created_by' => $admin->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create menu items
        $menuItems = [
            [
                'menu_id' => $menuId,
                'title' => 'Home',
                'url' => '/',
                'target' => '_self',
                'icon' => 'home',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => $menuId,
                'title' => 'About',
                'url' => '/about',
                'target' => '_self',
                'icon' => null,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_id' => $menuId,
                'title' => 'Contact',
                'url' => '/contact',
                'target' => '_self',
                'icon' => null,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($menuItems as $item) {
            DB::table('cms_menu_items')->insert($item);
        }

        // Create sample media folder
        $folderId = DB::table('cms_media_folders')->insertGetId([
            'name' => 'Sample Images',
            'slug' => 'sample-images',
            'description' => 'Sample images for demonstration',
            'parent_id' => null,
            'sort_order' => 1,
            'created_by' => $admin->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('CMS seeder completed successfully!');
        $this->command->info('Created:');
        $this->command->info('- 3 default templates');
        $this->command->info('- 3 sample pages');
        $this->command->info('- 1 main navigation menu with 3 items');
        $this->command->info('- 1 sample media folder');
    }
}
