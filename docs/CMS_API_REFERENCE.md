# TekRem CMS API Reference

## Overview

The TekRem CMS provides a comprehensive REST API for managing content, media, templates, and other CMS features. All API endpoints require authentication and follow RESTful conventions.

## Authentication

All API requests require authentication using Laravel Sanctum tokens:

```http
Authorization: Bearer {your-api-token}
Content-Type: application/json
Accept: application/json
```

## Base URL

```
https://your-domain.com/api/cms
```

## Pages API

### List Pages

```http
GET /pages
```

**Parameters:**
- `page` (integer): Page number for pagination
- `per_page` (integer): Items per page (max 100)
- `search` (string): Search in title and content
- `status` (string): Filter by status (draft, published, scheduled, archived)
- `language` (string): Filter by language code
- `template` (string): Filter by template slug
- `author_id` (integer): Filter by author ID

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Welcome to Our Site",
      "slug": "welcome",
      "excerpt": "Welcome to our amazing website...",
      "content": "<p>Full content here...</p>",
      "status": "published",
      "published_at": "2024-01-15T10:00:00Z",
      "template": "default",
      "language": "en",
      "meta_title": "Welcome - Our Site",
      "meta_description": "Welcome to our amazing website...",
      "author": {
        "id": 1,
        "name": "John Doe"
      },
      "seo_score": 85,
      "view_count": 1250,
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 25,
    "per_page": 15,
    "last_page": 2
  }
}
```

### Get Single Page

```http
GET /pages/{id}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Welcome to Our Site",
    "slug": "welcome",
    "content": "<p>Full content here...</p>",
    "content_blocks": [
      {
        "type": "hero",
        "data": {
          "title": "Hero Title",
          "image": "/storage/hero.jpg"
        }
      }
    ],
    "revisions": [
      {
        "id": 1,
        "revision_number": 1,
        "created_by": {
          "id": 1,
          "name": "John Doe"
        },
        "created_at": "2024-01-15T09:00:00Z",
        "revision_notes": "Initial version"
      }
    ],
    "seo_analysis": {
      "score": 85,
      "issues": [
        {
          "type": "success",
          "message": "Title length is optimal"
        }
      ]
    }
  }
}
```

### Create Page

```http
POST /pages
```

**Request Body:**
```json
{
  "title": "New Page Title",
  "slug": "new-page",
  "excerpt": "Page excerpt...",
  "content": "<p>Page content...</p>",
  "content_blocks": [],
  "template": "default",
  "layout": "default",
  "meta_title": "New Page - Site",
  "meta_description": "Description...",
  "meta_keywords": ["keyword1", "keyword2"],
  "status": "draft",
  "language": "en",
  "parent_id": null,
  "is_homepage": false,
  "show_in_menu": true,
  "require_auth": false
}
```

### Update Page

```http
PUT /pages/{id}
```

**Request Body:** Same as create page

### Delete Page

```http
DELETE /pages/{id}
```

### Publish Page

```http
POST /pages/{id}/publish
```

### Schedule Page

```http
POST /pages/{id}/schedule
```

**Request Body:**
```json
{
  "scheduled_at": "2024-02-01T10:00:00Z"
}
```

### Duplicate Page

```http
POST /pages/{id}/duplicate
```

**Request Body:**
```json
{
  "title": "Duplicated Page Title"
}
```

### SEO Analysis

```http
GET /pages/{id}/seo-analysis
```

**Response:**
```json
{
  "score": 85,
  "issues": [
    {
      "type": "success",
      "message": "Title length is optimal"
    },
    {
      "type": "warning",
      "message": "Meta description is too short",
      "recommendation": "Aim for 150-160 characters"
    }
  ],
  "metrics": {
    "title_length": 45,
    "description_length": 120,
    "content_length": 850,
    "image_count": 3,
    "link_count": 5
  }
}
```

## Media API

### List Media

```http
GET /media
```

**Parameters:**
- `folder_id` (integer): Filter by folder
- `type` (string): Filter by type (image, video, document)
- `search` (string): Search in filename and alt text
- `tags` (array): Filter by tags

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "hero-image",
      "original_name": "hero-image.jpg",
      "url": "/storage/cms/uploads/hero-image.jpg",
      "mime_type": "image/jpeg",
      "file_size": 245760,
      "human_file_size": "240 KB",
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "alt_text": "Hero image for homepage",
      "tags": ["hero", "homepage"],
      "type": "image",
      "variants": {
        "thumb_150x150": "/storage/cms/uploads/hero-image_thumb.jpg",
        "medium_600x600": "/storage/cms/uploads/hero-image_medium.jpg"
      },
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### Upload Media

```http
POST /media/upload
```

**Request:** Multipart form data
- `files[]` (file): One or more files to upload
- `folder_id` (integer, optional): Target folder ID
- `alt_text` (string, optional): Alt text for images
- `tags` (array, optional): Tags for the media

**Response:**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "media": [
    {
      "id": 1,
      "name": "uploaded-image",
      "url": "/storage/cms/uploads/uploaded-image.jpg",
      "type": "image"
    }
  ]
}
```

### Update Media

```http
PUT /media/{id}
```

**Request Body:**
```json
{
  "name": "Updated name",
  "alt_text": "Updated alt text",
  "description": "Updated description",
  "tags": ["tag1", "tag2"],
  "folder_id": 2
}
```

### Delete Media

```http
DELETE /media/{id}
```

### Generate Image Variants

```http
POST /media/{id}/variants
```

**Request Body:**
```json
{
  "sizes": [
    {
      "name": "custom",
      "width": 800,
      "height": 600
    }
  ]
}
```

## Templates API

### List Templates

```http
GET /templates
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Default Template",
      "slug": "default",
      "description": "Standard page template",
      "category": "general",
      "is_active": true,
      "is_default": true,
      "fields": [
        {
          "name": "hero_image",
          "type": "image",
          "label": "Hero Image",
          "required": false
        }
      ],
      "usage_stats": {
        "total_pages": 15,
        "published_pages": 12
      }
    }
  ]
}
```

### Create Template

```http
POST /templates
```

**Request Body:**
```json
{
  "name": "Custom Template",
  "slug": "custom",
  "description": "A custom template",
  "content": "<div>{{content}}</div>",
  "category": "custom",
  "fields": [
    {
      "name": "custom_field",
      "type": "text",
      "label": "Custom Field",
      "required": true
    }
  ]
}
```

## Menus API

### List Menus

```http
GET /menus
```

### Get Menu Structure

```http
GET /menus/{id}/structure
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Home",
      "url": "/",
      "target": "_self",
      "children": []
    },
    {
      "id": 2,
      "title": "About",
      "url": "/about",
      "target": "_self",
      "children": [
        {
          "id": 3,
          "title": "Our Team",
          "url": "/about/team",
          "target": "_self",
          "children": []
        }
      ]
    }
  ]
}
```

### Create Menu Item

```http
POST /menus/{menu}/items
```

**Request Body:**
```json
{
  "title": "New Menu Item",
  "url": "/new-page",
  "page_id": null,
  "parent_id": null,
  "sort_order": 1,
  "target": "_self",
  "icon": "home",
  "require_auth": false
}
```

## Redirects API

### List Redirects

```http
GET /redirects
```

### Create Redirect

```http
POST /redirects
```

**Request Body:**
```json
{
  "from_url": "/old-page",
  "to_url": "/new-page",
  "status_code": 301,
  "description": "Redirect old page to new page"
}
```

## Analytics API

### Page Analytics

```http
GET /analytics/pages
```

**Parameters:**
- `start_date` (date): Start date for analytics
- `end_date` (date): End date for analytics
- `page_id` (integer, optional): Specific page ID

**Response:**
```json
{
  "data": {
    "total_views": 15420,
    "unique_visitors": 8750,
    "bounce_rate": 0.35,
    "avg_time_on_page": 180,
    "top_pages": [
      {
        "page_id": 1,
        "title": "Homepage",
        "views": 5420,
        "unique_visitors": 3200
      }
    ]
  }
}
```

### SEO Analytics

```http
GET /analytics/seo
```

**Response:**
```json
{
  "data": {
    "avg_seo_score": 78,
    "pages_with_issues": 12,
    "total_pages": 45,
    "common_issues": [
      {
        "issue": "Missing meta description",
        "count": 8
      }
    ]
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": [
      "The title field is required."
    ],
    "slug": [
      "The slug has already been taken."
    ]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Rate Limiting

API requests are rate limited:
- **Authenticated users**: 1000 requests per hour
- **Media uploads**: 100 uploads per hour
- **Bulk operations**: 50 requests per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

Configure webhooks to receive real-time notifications:

### Available Events
- `page.created`
- `page.updated`
- `page.published`
- `page.deleted`
- `media.uploaded`
- `media.deleted`

### Webhook Payload Example
```json
{
  "event": "page.published",
  "data": {
    "id": 1,
    "title": "New Page",
    "slug": "new-page",
    "published_at": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```
