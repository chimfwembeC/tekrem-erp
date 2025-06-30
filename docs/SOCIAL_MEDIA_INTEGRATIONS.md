# TekRem ERP - Social Media Integrations Documentation

## Overview

The TekRem ERP social media integration system provides comprehensive connectivity with Facebook, Instagram, and LinkedIn platforms. This system enables lead capture, content management, social media posting, analytics, and real-time webhook handling.

## Supported Platforms

### 1. Facebook Integration
- **Lead Capture**: Automatic lead import from Facebook ads
- **Page Management**: Manage Facebook business pages
- **Post Publishing**: Create and schedule posts
- **Webhook Handling**: Real-time event notifications
- **Analytics**: Performance metrics and insights

### 2. Instagram Integration
- **Media Synchronization**: Import Instagram posts and media
- **Hashtag Monitoring**: Track hashtag performance
- **Business Profile Management**: Manage Instagram business accounts
- **Content Scheduling**: Schedule Instagram posts
- **Analytics**: Engagement metrics and insights

### 3. LinkedIn Integration
- **Professional Networking**: Connect with LinkedIn professionals
- **Company Page Management**: Manage LinkedIn company pages
- **Lead Generation**: Import LinkedIn leads
- **Content Publishing**: Share content on LinkedIn
- **Analytics**: Professional network insights

## System Architecture

### Core Components

1. **Service Layer**: Platform-specific API integration services
2. **Models**: Database models for social media data
3. **Controllers**: API endpoints and webhook handlers
4. **Webhooks**: Real-time event processing
5. **Dashboard**: Unified management interface

### Database Schema

#### Facebook Tables
- `facebook_pages`: Facebook business pages
- `facebook_leads`: Leads captured from Facebook
- `facebook_posts`: Facebook posts and content

#### Instagram Tables
- `instagram_accounts`: Instagram business accounts
- `instagram_media`: Instagram posts and media

#### LinkedIn Tables
- `linked_in_companies`: LinkedIn company pages
- `linked_in_leads`: LinkedIn professional leads

#### Shared Tables
- `social_posts`: Cross-platform post management
- `social_webhooks`: Webhook event logging

## Setup Guide

### Prerequisites

1. **Facebook Developer Account**
   - Create a Facebook App
   - Configure Facebook Login
   - Set up Webhooks

2. **Instagram Business Account**
   - Convert to Instagram Business Account
   - Connect to Facebook Page

3. **LinkedIn Developer Account**
   - Create LinkedIn App
   - Configure OAuth 2.0

### Environment Configuration

Add the following to your `.env` file:

```env
# Facebook Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Instagram Configuration
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token

# LinkedIn Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### Database Migration

Run the migrations to create the required tables:

```bash
php artisan migrate
```

### Webhook Configuration

#### Facebook Webhooks
1. **Webhook URL**: `https://yourdomain.com/webhooks/facebook`
2. **Verify Token**: Use the token from your `.env` file
3. **Subscribed Fields**: `leadgen`, `feed`, `messages`

#### Instagram Webhooks
1. **Webhook URL**: `https://yourdomain.com/webhooks/instagram`
2. **Verify Token**: Use the token from your `.env` file
3. **Subscribed Fields**: `comments`, `mentions`

#### LinkedIn Webhooks
1. **Webhook URL**: `https://yourdomain.com/webhooks/linkedin`
2. **Verify Token**: Use the token from your `.env` file
3. **Event Types**: `SHARE_STATISTICS_UPDATE`, `FOLLOWER_STATISTICS_UPDATE`

## API Documentation

### Facebook Service

#### Test Connection
```php
$facebookService = app(FacebookService::class);
$result = $facebookService->testConnection();
```

#### Get Pages
```php
$pages = $facebookService->getPages();
```

#### Create Post
```php
$post = $facebookService->createPost($pageId, $message, $mediaUrls);
```

#### Get Leads
```php
$leads = $facebookService->getLeads($pageId, $startDate, $endDate);
```

### Instagram Service

#### Test Connection
```php
$instagramService = app(InstagramService::class);
$result = $instagramService->testConnection();
```

#### Get Business Accounts
```php
$accounts = $instagramService->getBusinessAccounts();
```

#### Sync Media
```php
$media = $instagramService->syncMedia($accountId);
```

#### Monitor Hashtags
```php
$hashtags = $instagramService->monitorHashtags(['#yourhashtag']);
```

### LinkedIn Service

#### Test Connection
```php
$linkedInService = app(LinkedInService::class);
$result = $linkedInService->testConnection();
```

#### Get Company Pages
```php
$companies = $linkedInService->getCompanyPages();
```

#### Search People
```php
$people = $linkedInService->searchPeople([
    'keywords' => 'software developer',
    'location' => 'San Francisco'
]);
```

#### Create Post
```php
$post = $linkedInService->createTextPost($authorUrn, $text, 'PUBLIC');
```

## Unified Dashboard

### Features

1. **Connection Status**: Real-time status of all platform connections
2. **Cross-Platform Posting**: Create posts for multiple platforms simultaneously
3. **Analytics Summary**: Aggregated metrics across all platforms
4. **Recent Activity**: Latest posts, comments, and interactions
5. **Scheduled Content**: Manage scheduled posts across platforms

### Dashboard Routes

- **Main Dashboard**: `/social-media`
- **Cross-Platform Post**: `POST /social-media/cross-platform-post`
- **Analytics Summary**: `GET /social-media/analytics-summary`
- **Sync All Platforms**: `POST /social-media/sync-all`

## Webhook System

### Event Processing

The webhook system processes real-time events from social media platforms:

#### Facebook Events
- **Lead Generation**: New leads from Facebook ads
- **Post Interactions**: Comments, likes, shares
- **Page Messages**: Direct messages to Facebook pages

#### Instagram Events
- **Comments**: New comments on Instagram posts
- **Mentions**: When your account is mentioned

#### LinkedIn Events
- **Share Statistics**: Post performance updates
- **Follower Statistics**: Follower count changes

### Webhook Security

1. **Verification Tokens**: Each platform uses a unique verification token
2. **Signature Validation**: Webhook payloads are validated
3. **Rate Limiting**: Webhooks are rate-limited to prevent abuse
4. **Error Handling**: Failed webhooks are logged and retried

## Lead Integration

### Automatic Lead Creation

When leads are captured from social media platforms, they are automatically:

1. **Stored** in the respective platform table (e.g., `facebook_leads`)
2. **Converted** to CRM leads in the `leads` table
3. **Assigned** to appropriate sales representatives
4. **Notified** to relevant team members

### Lead Mapping

#### Facebook Lead Mapping
```php
$lead = Lead::create([
    'source' => 'facebook',
    'status' => 'new',
    'facebook_lead_id' => $facebookLead->id,
    'facebook_ad_id' => $adId,
    'facebook_form_id' => $formId,
    // Additional mapping...
]);
```

#### LinkedIn Lead Mapping
```php
$lead = Lead::create([
    'source' => 'linkedin',
    'status' => 'new',
    'linkedin_lead_id' => $linkedInLead->id,
    'company' => $linkedInLead->company,
    'position' => $linkedInLead->position,
    // Additional mapping...
]);
```

## Content Management

### Cross-Platform Posting

Create posts for multiple platforms simultaneously:

```javascript
const postData = {
    content: "Your post content",
    platforms: ["facebook", "instagram", "linkedin"],
    media_urls: ["https://example.com/image.jpg"],
    scheduled_at: "2024-01-01 12:00:00",
    facebook_page_id: "123456789",
    instagram_account_id: "987654321",
    linkedin_company_id: "456789123"
};

fetch('/social-media/cross-platform-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
});
```

### Content Scheduling

Posts can be scheduled for future publication:

1. **Immediate Publishing**: Posts are published immediately
2. **Scheduled Publishing**: Posts are stored and published at specified time
3. **Draft Mode**: Posts are saved as drafts for later editing

## Analytics and Reporting

### Platform-Specific Analytics

#### Facebook Analytics
- Page insights and performance metrics
- Post engagement rates
- Audience demographics
- Lead conversion tracking

#### Instagram Analytics
- Media performance metrics
- Hashtag effectiveness
- Follower growth
- Engagement rates

#### LinkedIn Analytics
- Company page performance
- Post reach and engagement
- Follower demographics
- Lead generation metrics

### Unified Analytics

The dashboard provides aggregated analytics across all platforms:

```javascript
// Get analytics summary
fetch('/social-media/analytics-summary?period=month&platforms[]=facebook&platforms[]=instagram&platforms[]=linkedin')
    .then(response => response.json())
    .then(data => {
        console.log('Analytics:', data.analytics);
    });
```

## Error Handling

### Common Error Scenarios

1. **API Rate Limits**: Automatic retry with exponential backoff
2. **Token Expiration**: Automatic token refresh where possible
3. **Network Timeouts**: Configurable timeout settings
4. **Invalid Permissions**: Clear error messages and resolution steps

### Error Logging

All errors are logged with detailed information:

```php
Log::error('Facebook API error', [
    'endpoint' => $endpoint,
    'response' => $response,
    'user_id' => auth()->id(),
    'timestamp' => now()
]);
```

## Security Considerations

### Data Protection

1. **Access Tokens**: Stored securely and encrypted
2. **User Data**: Minimal data collection and secure storage
3. **API Permissions**: Least privilege principle
4. **Webhook Validation**: All webhooks are validated

### Compliance

1. **GDPR Compliance**: User data handling follows GDPR guidelines
2. **Platform Policies**: Adherence to each platform's terms of service
3. **Data Retention**: Configurable data retention policies

## Troubleshooting

### Common Issues

#### Connection Problems
```bash
# Test Facebook connection
php artisan tinker
>>> app(App\Services\SocialMedia\FacebookService::class)->testConnection()

# Test Instagram connection
>>> app(App\Services\SocialMedia\InstagramService::class)->testConnection()

# Test LinkedIn connection
>>> app(App\Services\SocialMedia\LinkedInService::class)->testConnection()
```

#### Webhook Issues
1. **Check webhook URL accessibility**
2. **Verify webhook tokens match**
3. **Review webhook logs in database**
4. **Test webhook endpoints manually**

#### Permission Errors
1. **Verify API permissions in platform developer console**
2. **Check access token validity**
3. **Review user permissions for social media module**

### Useful Commands

```bash
# Sync all social media platforms
php artisan social-media:sync-all

# Test webhook endpoints
php artisan social-media:test-webhooks

# Clear social media cache
php artisan cache:forget social-media:*

# View webhook logs
php artisan social-media:webhook-logs
```

## Best Practices

1. **Regular Token Refresh**: Implement automatic token refresh
2. **Error Monitoring**: Monitor API errors and response times
3. **Rate Limit Handling**: Respect platform rate limits
4. **Data Validation**: Validate all incoming webhook data
5. **Security Updates**: Keep API versions and tokens updated
6. **Performance Optimization**: Cache frequently accessed data
7. **User Privacy**: Respect user privacy and data protection laws

## Support and Maintenance

### Monitoring

1. **API Health Checks**: Regular connection testing
2. **Webhook Monitoring**: Track webhook success rates
3. **Performance Metrics**: Monitor response times and error rates
4. **User Activity**: Track social media feature usage

### Updates

1. **API Version Updates**: Stay current with platform API changes
2. **Security Patches**: Apply security updates promptly
3. **Feature Enhancements**: Regular feature updates and improvements
4. **Documentation Updates**: Keep documentation current

## Integration Verification

Use the built-in integration verification system to test all connections:

1. **Navigate to**: `/admin/integration-verification`
2. **Test All Integrations**: Click "Test All" to verify all connections
3. **Individual Testing**: Test specific platforms individually
4. **Health Monitoring**: Monitor overall system health score

The verification system tests:
- Social media API connections
- Database connectivity
- Email configuration
- File storage
- Queue system
- Cache system
