# TekRem ERP - API Documentation

## Overview

The TekRem ERP API provides comprehensive access to all system features including CRM, Finance, Projects, HR, Support, CMS, Social Media, and AI modules. All API endpoints require authentication and proper permissions.

## Authentication

### Bearer Token Authentication

All API requests must include a valid Bearer token in the Authorization header:

```http
Authorization: Bearer your_api_token
```

### Getting an API Token

```bash
# Create a personal access token
php artisan tinker
```

```php
$user = \App\Models\User::find(1);
$token = $user->createToken('API Token')->plainTextToken;
echo $token;
```

## Base URL

```
https://yourdomain.com/api
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
    "success": true,
    "data": {
        // Response data
    },
    "message": "Operation completed successfully"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field": ["Validation error message"]
    }
}
```

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)
- `search`: Search query
- `sort`: Sort field
- `order`: Sort order (asc/desc)

### Pagination Response
```json
{
    "data": [...],
    "links": {
        "first": "...",
        "last": "...",
        "prev": null,
        "next": "..."
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 5,
        "per_page": 15,
        "to": 15,
        "total": 75
    }
}
```

## Social Media API

### Facebook Integration

#### Test Connection
```http
GET /api/social-media/facebook/test-connection
```

**Response:**
```json
{
    "success": true,
    "status": "success",
    "message": "Facebook connection successful",
    "data": {
        "app_id": "123456789",
        "permissions": ["pages_read_engagement", "leads_retrieval"]
    }
}
```

#### Get Facebook Pages
```http
GET /api/social-media/facebook/pages
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "123456789",
            "name": "Your Business Page",
            "category": "Business",
            "followers_count": 1500,
            "access_token": "encrypted_token"
        }
    ]
}
```

#### Create Facebook Post
```http
POST /api/social-media/facebook/posts
```

**Request Body:**
```json
{
    "page_id": "123456789",
    "message": "Your post content",
    "media_urls": ["https://example.com/image.jpg"],
    "scheduled_at": "2024-01-01 12:00:00"
}
```

#### Get Facebook Leads
```http
GET /api/social-media/facebook/leads?page_id=123456789&start_date=2024-01-01&end_date=2024-01-31
```

### Instagram Integration

#### Get Instagram Accounts
```http
GET /api/social-media/instagram/accounts
```

#### Sync Instagram Media
```http
POST /api/social-media/instagram/sync-media
```

**Request Body:**
```json
{
    "account_id": "987654321"
}
```

#### Monitor Hashtags
```http
POST /api/social-media/instagram/monitor-hashtags
```

**Request Body:**
```json
{
    "hashtags": ["#yourhashtag", "#business"],
    "account_id": "987654321"
}
```

### LinkedIn Integration

#### Get LinkedIn Companies
```http
GET /api/social-media/linkedin/companies
```

#### Search LinkedIn People
```http
POST /api/social-media/linkedin/search-people
```

**Request Body:**
```json
{
    "keywords": "software developer",
    "location": "San Francisco",
    "industry": "Technology",
    "company_size": "51-200"
}
```

#### Create LinkedIn Post
```http
POST /api/social-media/linkedin/posts
```

**Request Body:**
```json
{
    "company_id": "456789123",
    "text": "Your LinkedIn post content",
    "visibility": "PUBLIC"
}
```

### Unified Social Media Dashboard

#### Get Dashboard Data
```http
GET /api/social-media/dashboard
```

**Response:**
```json
{
    "success": true,
    "data": {
        "connection_status": {
            "facebook": true,
            "instagram": true,
            "linkedin": false
        },
        "account_counts": {
            "facebook_pages": 3,
            "instagram_accounts": 2,
            "linkedin_companies": 1
        },
        "recent_posts": [...],
        "scheduled_posts": [...],
        "platform_stats": {...},
        "engagement_metrics": {...}
    }
}
```

#### Create Cross-Platform Post
```http
POST /api/social-media/cross-platform-post
```

**Request Body:**
```json
{
    "content": "Your post content",
    "platforms": ["facebook", "instagram", "linkedin"],
    "media_urls": ["https://example.com/image.jpg"],
    "scheduled_at": "2024-01-01 12:00:00",
    "facebook_page_id": "123456789",
    "instagram_account_id": "987654321",
    "linkedin_company_id": "456789123"
}
```

#### Get Analytics Summary
```http
GET /api/social-media/analytics-summary?period=month&platforms[]=facebook&platforms[]=instagram
```

#### Sync All Platforms
```http
POST /api/social-media/sync-all
```

## Integration Verification API

### Test All Integrations
```http
POST /api/admin/integration-verification/test-all
```

**Response:**
```json
{
    "success": true,
    "results": {
        "social_media": {
            "facebook": {
                "status": "healthy",
                "message": "Connection successful",
                "response_time": 245.67
            },
            "instagram": {
                "status": "healthy",
                "message": "Connection successful",
                "response_time": 189.23
            },
            "linkedin": {
                "status": "error",
                "message": "Invalid access token",
                "response_time": null
            }
        },
        "database": {
            "status": "healthy",
            "message": "Database connection successful",
            "response_time": 12.45
        },
        "email": {
            "status": "healthy",
            "message": "Email configuration is valid",
            "response_time": null
        }
    },
    "health_score": 85,
    "tested_at": "2024-01-01T12:00:00Z"
}
```

### Test Specific Integration
```http
POST /api/admin/integration-verification/test-integration
```

**Request Body:**
```json
{
    "integration": "facebook"
}
```

### Get Configuration Status
```http
GET /api/admin/integration-verification/configuration-status
```

## Permissions API

### Check Permission
```http
GET /api/permissions/check?permission=view_crm_leads
```

**Response:**
```json
{
    "success": true,
    "hasPermission": true
}
```

### Get User Permissions
```http
GET /api/user/permissions
```

**Response:**
```json
{
    "success": true,
    "permissions": [
        "view_crm_leads",
        "create_crm_leads",
        "edit_crm_leads",
        "view_finance_invoices"
    ]
}
```

### Get Role Permissions
```http
GET /api/roles/admin/permissions
```

**Response:**
```json
{
    "success": true,
    "permissions": [
        {
            "id": 1,
            "name": "view_crm_leads",
            "module": "crm",
            "action": "view",
            "entity": "leads"
        }
    ]
}
```

## Webhook API

### Facebook Webhook Verification
```http
GET /webhooks/facebook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=challenge_string
```

### Facebook Webhook Handler
```http
POST /webhooks/facebook
```

**Request Body (Facebook Lead Event):**
```json
{
    "object": "page",
    "entry": [
        {
            "id": "page_id",
            "time": 1234567890,
            "changes": [
                {
                    "field": "leadgen",
                    "value": {
                        "leadgen_id": "lead_id",
                        "page_id": "page_id",
                        "form_id": "form_id",
                        "adgroup_id": "adgroup_id",
                        "ad_id": "ad_id",
                        "created_time": 1234567890
                    }
                }
            ]
        }
    ]
}
```

### Instagram Webhook Handler
```http
POST /webhooks/instagram
```

### LinkedIn Webhook Handler
```http
POST /webhooks/linkedin
```

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 422  | Validation Error |
| 429  | Rate Limit Exceeded |
| 500  | Internal Server Error |

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated Users**: 1000 requests per hour
- **Webhook Endpoints**: 10000 requests per hour
- **Social Media APIs**: Varies by platform

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
// Example API client
class TekRemAPI {
    constructor(token, baseURL = 'https://yourdomain.com/api') {
        this.token = token;
        this.baseURL = baseURL;
    }
    
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        return response.json();
    }
    
    // Social Media methods
    async testFacebookConnection() {
        return this.request('/social-media/facebook/test-connection');
    }
    
    async createCrossPlatformPost(data) {
        return this.request('/social-media/cross-platform-post', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Usage
const api = new TekRemAPI('your_api_token');
const result = await api.testFacebookConnection();
```

### PHP
```php
// Example API client
class TekRemAPI {
    private $token;
    private $baseURL;
    
    public function __construct($token, $baseURL = 'https://yourdomain.com/api') {
        $this->token = $token;
        $this->baseURL = $baseURL;
    }
    
    public function request($endpoint, $method = 'GET', $data = null) {
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->baseURL . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->token,
                'Content-Type: application/json'
            ]
        ]);
        
        if ($data) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($curl);
        curl_close($curl);
        
        return json_decode($response, true);
    }
    
    public function testFacebookConnection() {
        return $this->request('/social-media/facebook/test-connection');
    }
}

// Usage
$api = new TekRemAPI('your_api_token');
$result = $api->testFacebookConnection();
```

## Testing

### Using cURL

```bash
# Test Facebook connection
curl -X GET "https://yourdomain.com/api/social-media/facebook/test-connection" \
  -H "Authorization: Bearer your_api_token" \
  -H "Content-Type: application/json"

# Create cross-platform post
curl -X POST "https://yourdomain.com/api/social-media/cross-platform-post" \
  -H "Authorization: Bearer your_api_token" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post",
    "platforms": ["facebook", "linkedin"],
    "facebook_page_id": "123456789",
    "linkedin_company_id": "456789123"
  }'
```

### Using Postman

1. **Set Base URL**: `https://yourdomain.com/api`
2. **Add Authorization**: Bearer Token with your API token
3. **Set Headers**: `Content-Type: application/json`
4. **Import Collection**: Use the provided Postman collection file

## Support

For API support and questions:

- **Documentation**: Check this documentation first
- **Integration Testing**: Use `/admin/integration-verification`
- **Logs**: Check application logs for detailed error information
- **Rate Limits**: Monitor rate limit headers in responses

## Changelog

### Version 1.0.0
- Initial API release
- Social media integrations (Facebook, Instagram, LinkedIn)
- Permissions system API
- Integration verification API
- Webhook handling system
