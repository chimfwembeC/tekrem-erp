# TekRem ERP - Complete Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the TekRem ERP system with all integrations, permissions, and social media features.

## Prerequisites

### System Requirements

- **PHP**: 8.1 or higher
- **Node.js**: 18.x or higher
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Composer**: Latest version
- **NPM/Yarn**: Latest version

### Required Accounts

1. **Facebook Developer Account** (for Facebook/Instagram integration)
2. **LinkedIn Developer Account** (for LinkedIn integration)
3. **Email Service** (SMTP or service like SendGrid, Mailgun)
4. **File Storage** (Local, S3, or other cloud storage)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-repo/tekrem-erp.git
cd tekrem-erp

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 2. Database Configuration

Edit your `.env` file with database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tekrem_erp
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Run database migrations and seeders:

```bash
# Run migrations
php artisan migrate

# Seed roles and permissions
php artisan db:seed --class=RolesAndPermissionsSeeder

# Seed sample data (optional)
php artisan db:seed
```

### 3. Social Media Integration Setup

#### Facebook Integration

1. **Create Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Facebook Login product
   - Configure OAuth redirect URIs

2. **Configure Environment**:
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_unique_webhook_token
```

3. **Set up Webhooks**:
   - Webhook URL: `https://yourdomain.com/webhooks/facebook`
   - Verify Token: Use the token from your `.env`
   - Subscribe to: `leadgen`, `feed`, `messages`

#### Instagram Integration

1. **Instagram Business Account**:
   - Convert your Instagram account to a Business account
   - Connect it to a Facebook Page

2. **Configure Environment**:
```env
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_unique_webhook_token
```

3. **Set up Webhooks**:
   - Webhook URL: `https://yourdomain.com/webhooks/instagram`
   - Subscribe to: `comments`, `mentions`

#### LinkedIn Integration

1. **Create LinkedIn App**:
   - Go to [LinkedIn Developers](https://developer.linkedin.com/)
   - Create a new app
   - Configure OAuth 2.0 settings

2. **Configure Environment**:
```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_WEBHOOK_VERIFY_TOKEN=your_unique_webhook_token
```

3. **Set up Webhooks**:
   - Webhook URL: `https://yourdomain.com/webhooks/linkedin`
   - Event Types: `SHARE_STATISTICS_UPDATE`, `FOLLOWER_STATISTICS_UPDATE`

### 4. Email Configuration

Configure your email settings in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email_username
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="TekRem ERP"
```

### 5. File Storage Configuration

For local storage (default):
```env
FILESYSTEM_DISK=local
```

For AWS S3:
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket_name
```

### 6. Queue Configuration

For database queues (recommended for development):
```env
QUEUE_CONNECTION=database
```

For Redis (recommended for production):
```env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 7. Cache Configuration

For file cache (default):
```env
CACHE_DRIVER=file
```

For Redis (recommended for production):
```env
CACHE_DRIVER=redis
```

### 8. Build Frontend Assets

```bash
# Development build
npm run dev

# Production build
npm run build

# Watch for changes (development)
npm run dev -- --watch
```

### 9. Set Up Web Server

#### Apache Configuration

Create a virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/tekrem-erp/public
    
    <Directory /path/to/tekrem-erp/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/tekrem-erp_error.log
    CustomLog ${APACHE_LOG_DIR}/tekrem-erp_access.log combined
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/tekrem-erp/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
```

### 10. Set Up Scheduled Tasks

Add to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line
* * * * * cd /path/to/tekrem-erp && php artisan schedule:run >> /dev/null 2>&1
```

### 11. Start Queue Workers

For production, use a process manager like Supervisor:

```bash
# Install Supervisor
sudo apt-get install supervisor

# Create configuration file
sudo nano /etc/supervisor/conf.d/tekrem-erp-worker.conf
```

Supervisor configuration:
```ini
[program:tekrem-erp-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/tekrem-erp/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/path/to/tekrem-erp/storage/logs/worker.log
stopwaitsecs=3600
```

Start Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start tekrem-erp-worker:*
```

## Initial Configuration

### 1. Create Admin User

```bash
php artisan tinker
```

```php
$user = \App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@yourdomain.com',
    'password' => bcrypt('secure_password'),
    'email_verified_at' => now(),
]);

$user->assignRole('admin');
```

### 2. Configure System Settings

1. **Login to Admin Panel**: Navigate to `/admin`
2. **Configure Settings**: Go to `/admin/settings`
3. **Set up Integrations**: Configure social media tokens
4. **Test Connections**: Use `/admin/integration-verification`

### 3. Set Up Permissions

1. **Review Permissions**: Go to `/admin/permissions`
2. **Configure Roles**: Go to `/admin/roles`
3. **Assign User Roles**: Go to `/admin/users`

## Verification Steps

### 1. Test Database Connection

```bash
php artisan tinker
```

```php
\DB::connection()->getPdo();
// Should return PDO instance without errors
```

### 2. Test Email Configuration

```bash
php artisan tinker
```

```php
\Mail::raw('Test email', function ($message) {
    $message->to('test@example.com')->subject('Test Email');
});
```

### 3. Test Social Media Integrations

Navigate to `/admin/integration-verification` and run tests for all platforms.

### 4. Test Queue System

```bash
# Dispatch a test job
php artisan tinker
```

```php
\App\Jobs\TestJob::dispatch();
```

### 5. Test File Storage

```bash
php artisan tinker
```

```php
\Storage::put('test.txt', 'Test content');
\Storage::get('test.txt'); // Should return 'Test content'
\Storage::delete('test.txt');
```

## Security Configuration

### 1. Environment Security

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
```

### 2. HTTPS Configuration

Ensure your web server is configured for HTTPS and update:

```env
FORCE_HTTPS=true
SESSION_SECURE_COOKIE=true
```

### 3. File Permissions

```bash
# Set proper permissions
sudo chown -R www-data:www-data /path/to/tekrem-erp
sudo chmod -R 755 /path/to/tekrem-erp
sudo chmod -R 775 /path/to/tekrem-erp/storage
sudo chmod -R 775 /path/to/tekrem-erp/bootstrap/cache
```

## Performance Optimization

### 1. Enable Caching

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Cache events
php artisan event:cache
```

### 2. Optimize Autoloader

```bash
composer install --optimize-autoloader --no-dev
```

### 3. Enable OPcache

Add to your PHP configuration:

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check file permissions
   - Ensure web server user owns files
   - Verify storage directories are writable

2. **Database Connection Errors**
   - Verify database credentials
   - Check database server is running
   - Ensure database exists

3. **Social Media Integration Errors**
   - Verify API credentials
   - Check webhook URLs are accessible
   - Review platform-specific documentation

4. **Queue Not Processing**
   - Check queue worker is running
   - Verify queue configuration
   - Review worker logs

### Useful Commands

```bash
# Clear all caches
php artisan optimize:clear

# View logs
tail -f storage/logs/laravel.log

# Check queue status
php artisan queue:work --once

# Test email configuration
php artisan mail:test

# Run health checks
php artisan health:check
```

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   composer update
   npm update
   ```

2. **Clear Logs**
   ```bash
   php artisan log:clear
   ```

3. **Backup Database**
   ```bash
   php artisan backup:run
   ```

4. **Monitor Performance**
   - Check application logs
   - Monitor database performance
   - Review queue processing times

### Updates

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Update Dependencies**
   ```bash
   composer install --no-dev
   npm ci
   ```

3. **Run Migrations**
   ```bash
   php artisan migrate
   ```

4. **Clear Caches**
   ```bash
   php artisan optimize:clear
   php artisan optimize
   ```

5. **Restart Services**
   ```bash
   sudo supervisorctl restart tekrem-erp-worker:*
   sudo systemctl reload nginx
   ```

This setup guide provides a comprehensive foundation for deploying and maintaining the TekRem ERP system with all its features and integrations.
