# TekRem CMS Setup Guide

## Overview

The TekRem Content Management System (CMS) is a comprehensive, enterprise-grade content management solution built with Laravel, React, and TypeScript. This guide will walk you through the complete setup and configuration process.

## Prerequisites

Before setting up the CMS, ensure you have:

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL 8.0+
- Laravel 11+
- Redis (optional, for caching)

## Installation Steps

### 1. Database Setup

Run the CMS migrations to create the necessary database tables:

```bash
# Run CMS migrations
php artisan migrate

# Seed default CMS data (optional)
php artisan db:seed --class=CMSSeeder
```

### 2. Storage Configuration

Configure storage for media files:

```bash
# Create storage link
php artisan storage:link

# Create CMS media directories
mkdir -p storage/app/public/cms
mkdir -p storage/app/public/cms/uploads
mkdir -p storage/app/public/cms/thumbnails
```

### 3. Environment Configuration

Add the following to your `.env` file:

```env
# CMS Configuration
CMS_DEFAULT_LANGUAGE=en
CMS_ENABLE_VERSIONING=true
CMS_ENABLE_SEO_ANALYSIS=true
CMS_ENABLE_AI_FEATURES=true
CMS_MAX_UPLOAD_SIZE=10240
CMS_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx
CMS_ENABLE_CDN=false
CMS_CDN_URL=

# AI Configuration (for content suggestions)
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large-latest

# Image Processing
IMAGE_DRIVER=gd
IMAGE_QUALITY=85
IMAGE_MAX_WIDTH=2048
IMAGE_MAX_HEIGHT=2048
```

### 4. Permissions Setup

Configure file permissions for media uploads:

```bash
# Set proper permissions
chmod -R 755 storage/app/public/cms
chown -R www-data:www-data storage/app/public/cms
```

### 5. Frontend Assets

Build the frontend assets:

```bash
# Install dependencies
npm install

# Build for development
npm run dev

# Or build for production
npm run build
```

## Configuration

### 1. User Roles and Permissions

The CMS uses the following roles by default:

- **Admin**: Full CMS access
- **Editor**: Can create, edit, and publish content
- **Author**: Can create and edit own content
- **Contributor**: Can create content but cannot publish

Set up permissions:

```bash
php artisan cms:setup-permissions
```

### 2. Default Templates

Create default templates:

```bash
php artisan cms:create-default-templates
```

### 3. Media Library Setup

Configure the media library:

```bash
php artisan cms:setup-media-library
```

## Usage Guide

### Creating Your First Page

1. Navigate to `/cms/pages`
2. Click "Create Page"
3. Fill in the page details:
   - **Title**: Your page title
   - **Slug**: URL-friendly version (auto-generated)
   - **Content**: Use the rich text editor
   - **Template**: Choose from available templates
   - **SEO Settings**: Meta title, description, keywords

### Managing Media

1. Go to `/cms/media`
2. Upload files by dragging and dropping
3. Organize files in folders
4. Add alt text and descriptions for SEO

### SEO Optimization

The CMS includes a built-in SEO analyzer that provides:

- Title length optimization
- Meta description suggestions
- Content readability analysis
- Image alt text recommendations
- Internal linking suggestions

### Publishing Workflow

1. **Draft**: Create and edit content
2. **Review**: Submit for review (if workflow enabled)
3. **Schedule**: Set publication date/time
4. **Publish**: Make content live

## API Documentation

### Pages API

```php
// Get all pages
GET /api/cms/pages

// Get specific page
GET /api/cms/pages/{id}

// Create page
POST /api/cms/pages

// Update page
PUT /api/cms/pages/{id}

// Delete page
DELETE /api/cms/pages/{id}
```

### Media API

```php
// Upload media
POST /api/cms/media/upload

// Get media library
GET /api/cms/media

// Delete media
DELETE /api/cms/media/{id}
```

## Advanced Configuration

### Custom Templates

Create custom templates in `resources/views/cms/templates/`:

```php
// resources/views/cms/templates/custom-template.blade.php
@extends('cms.layouts.base')

@section('content')
    <div class="custom-template">
        {!! $page->content !!}
    </div>
@endsection
```

Register the template:

```php
// In a service provider
CMS::registerTemplate('custom-template', [
    'name' => 'Custom Template',
    'description' => 'A custom template for special pages',
    'fields' => [
        'hero_image' => [
            'type' => 'image',
            'label' => 'Hero Image',
            'required' => false,
        ],
        'call_to_action' => [
            'type' => 'text',
            'label' => 'Call to Action Text',
            'required' => false,
        ],
    ],
]);
```

### Custom Content Blocks

Create reusable content blocks:

```typescript
// resources/js/Components/CMS/Blocks/CustomBlock.tsx
import React from 'react';

interface Props {
  data: {
    title: string;
    content: string;
    image?: string;
  };
  onChange: (data: any) => void;
}

export default function CustomBlock({ data, onChange }: Props) {
  return (
    <div className="custom-block">
      <input
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Block title"
      />
      <textarea
        value={data.content}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
        placeholder="Block content"
      />
    </div>
  );
}
```

### AI Integration

Configure AI-powered features:

```php
// config/cms.php
return [
    'ai' => [
        'enabled' => env('CMS_ENABLE_AI_FEATURES', true),
        'provider' => 'mistral',
        'features' => [
            'content_suggestions' => true,
            'seo_optimization' => true,
            'auto_tagging' => true,
            'translation_assistance' => true,
        ],
    ],
];
```

## Troubleshooting

### Common Issues

1. **Upload Errors**
   - Check file permissions on storage directory
   - Verify `upload_max_filesize` in php.ini
   - Ensure storage link exists

2. **SEO Analyzer Not Working**
   - Verify AI API keys are configured
   - Check network connectivity
   - Review error logs

3. **Template Not Loading**
   - Clear view cache: `php artisan view:clear`
   - Check template file exists
   - Verify template registration

### Performance Optimization

1. **Enable Caching**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

2. **Image Optimization**
   - Enable WebP conversion
   - Use CDN for media delivery
   - Implement lazy loading

3. **Database Optimization**
   - Add indexes for frequently queried fields
   - Use database query caching
   - Optimize large content tables

## Security Considerations

1. **File Upload Security**
   - Validate file types and sizes
   - Scan uploads for malware
   - Store uploads outside web root

2. **Content Security**
   - Sanitize user input
   - Implement CSRF protection
   - Use content security policies

3. **Access Control**
   - Implement proper role-based permissions
   - Use secure session management
   - Enable two-factor authentication

## Backup and Recovery

### Automated Backups

Set up automated backups:

```bash
# Add to crontab
0 2 * * * php /path/to/artisan cms:backup
```

### Manual Backup

```bash
# Backup database
php artisan cms:backup --database

# Backup media files
php artisan cms:backup --media

# Full backup
php artisan cms:backup --full
```

### Recovery

```bash
# Restore from backup
php artisan cms:restore backup-file.zip
```

## Support and Documentation

For additional support:

- **Documentation**: `/docs/cms/`
- **API Reference**: `/docs/api/cms/`
- **Community Forum**: [TekRem Community](https://community.tekrem.site)
- **Email Support**: support@tekrem.site

## Version History

- **v1.0.0**: Initial CMS release with core features
- **v1.1.0**: Added AI-powered content suggestions
- **v1.2.0**: Enhanced SEO analyzer and media management
- **v1.3.0**: Multi-language support and advanced templates
