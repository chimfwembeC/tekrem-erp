# AI Conversation Export Documentation

## Overview

The AI Conversation Export feature allows administrators to export AI-powered guest chat conversations for analysis, machine learning training, and backup purposes. This feature is designed to help improve AI model training and enhance the quality of automated responses in the TekRem LiveChat system.

## Features

### 1. **Verified AI Conversation Storage**
- AI conversations are automatically stored with proper metadata
- Each AI response includes service provider, model, and generation timestamp
- Guest session information is preserved with conversation context
- Conversation threading and reply relationships are maintained

### 2. **Export Formats**
- **JSON**: Structured data format for programmatic analysis
- **CSV**: Spreadsheet-compatible format for data analysis
- **Excel**: XLSX format for business reporting
- **ML Training**: Optimized format for machine learning model training

### 3. **Privacy & Security**
- **Anonymization**: Personal data (names, emails) can be hashed for privacy
- **Admin-only Access**: Export functionality requires administrator privileges
- **IP Address Control**: Option to include/exclude IP addresses
- **Metadata Control**: Configurable inclusion of AI service metadata

### 4. **Filtering Options**
- **Date Range**: Export conversations from specific time periods
- **AI Service**: Filter by specific AI providers (Mistral, OpenAI, Anthropic)
- **Message Count**: Minimum message threshold for conversation inclusion
- **Conversation Status**: Filter by active, archived, or resolved conversations

## Access Requirements

- **Role**: Administrator access required
- **Permissions**: Admin role with proper authentication
- **Location**: Settings → Advanced Settings → AI Export button

## How to Use

### 1. **Access the Export Interface**
1. Navigate to Settings → Advanced Settings
2. Click the "AI Export" button in the System Maintenance section
3. You'll be redirected to the AI Conversation Export page

### 2. **Configure Export Settings**
1. **Select Format**: Choose from JSON, CSV, Excel, or ML Training format
2. **Set Date Range**: Specify start and end dates (optional)
3. **Choose AI Service**: Filter by specific AI provider (optional)
4. **Set Minimum Messages**: Specify minimum conversation length
5. **Configure Privacy Options**:
   - Enable/disable data anonymization
   - Include/exclude IP addresses
   - Include/exclude AI metadata

### 3. **Preview Data**
1. Click "Preview Data" to see a sample of the export
2. Review the data structure and content
3. Check estimated file size
4. Verify filtering is working correctly

### 4. **Export Data**
1. Click the "Export" button with your chosen format
2. The file will be automatically downloaded
3. File naming convention: `ai_conversations_export_YYYY-MM-DD.{format}`

## Export Data Structure

### JSON Format
```json
{
  "conversation_id": 123,
  "conversation_title": "Guest Chat - John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "status": "active",
  "guest_info": {
    "guest_id": "guest_abc123",
    "guest_name": "Guest_def456",
    "guest_email": "guest_789@example.com",
    "anonymized": true
  },
  "messages": [
    {
      "message_id": 456,
      "timestamp": "2024-01-15T10:30:00Z",
      "sender_type": "guest",
      "message": "Hello, I need help with web development.",
      "sequence_number": 1
    },
    {
      "message_id": 457,
      "timestamp": "2024-01-15T10:31:00Z",
      "sender_type": "ai",
      "message": "I'd be happy to help with web development!",
      "ai_metadata": {
        "service": "mistral",
        "model": "mistral-large-latest",
        "reply_to_message_id": 456
      },
      "sequence_number": 2
    }
  ],
  "ai_services_used": ["mistral"],
  "conversation_metrics": {
    "total_messages": 4,
    "ai_message_count": 2,
    "guest_message_count": 2,
    "conversation_duration_minutes": 15
  }
}
```

### ML Training Format
```json
{
  "training_data": [
    {
      "input": "Hello, I need help with web development.",
      "output": "I'd be happy to help with web development!",
      "context": [
        {
          "role": "user",
          "content": "Hello, I need help with web development.",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      ],
      "metadata": {
        "conversation_id": 123,
        "ai_service": "mistral",
        "ai_model": "mistral-large-latest",
        "timestamp": "2024-01-15T10:31:00Z",
        "conversation_status": "active"
      }
    }
  ],
  "metadata": {
    "export_timestamp": "2024-01-15T12:00:00Z",
    "total_conversations": 50,
    "total_training_pairs": 200,
    "format_version": "1.0"
  }
}
```

## Statistics Dashboard

The export interface includes a statistics dashboard showing:

- **Total AI Conversations**: Count of conversations with AI responses
- **AI Services Breakdown**: Distribution by service provider
- **Conversation Outcomes**: Status distribution (active, archived, resolved)
- **Average Conversation Length**: Mean number of messages per conversation
- **Most Active Periods**: Days with highest AI conversation activity
- **AI Response Effectiveness**: Performance metrics

## API Endpoints

### Export Data
```
POST /crm/ai-conversations/export
```

### Get Statistics
```
GET /crm/ai-conversations/statistics
```

### Preview Data
```
POST /crm/ai-conversations/preview
```

## Use Cases

### 1. **Machine Learning Training**
- Export conversations in ML training format
- Use input-output pairs to train custom models
- Improve AI response quality and relevance
- Analyze conversation patterns and outcomes

### 2. **Business Analysis**
- Export to CSV/Excel for business intelligence
- Analyze customer inquiry patterns
- Measure AI effectiveness and response quality
- Generate reports for stakeholders

### 3. **Data Backup**
- Regular exports for data preservation
- Compliance with data retention policies
- Historical conversation analysis
- System migration support

### 4. **Quality Assurance**
- Review AI responses for accuracy
- Identify areas for improvement
- Monitor conversation outcomes
- Ensure customer satisfaction

## Privacy Considerations

- **Anonymization**: Always enabled by default to protect user privacy
- **Data Minimization**: Only export necessary data for intended purpose
- **Access Control**: Restricted to administrators only
- **Audit Trail**: Export activities are logged for compliance
- **GDPR Compliance**: Anonymization helps meet privacy regulations

## Technical Notes

- **Performance**: Large exports may take time to process
- **File Size**: Monitor estimated file sizes before export
- **Storage**: Exported files are not stored on the server
- **Formats**: All formats preserve conversation threading and context
- **Metadata**: AI service information helps track model performance

## Troubleshooting

### Common Issues

1. **No Data in Export**
   - Check date range filters
   - Verify AI conversations exist in the system
   - Ensure proper AI service configuration

2. **Export Fails**
   - Check server logs for errors
   - Verify sufficient memory for large exports
   - Try smaller date ranges

3. **Missing AI Metadata**
   - Ensure "Include Metadata" is enabled
   - Check AI service configuration
   - Verify AI responses are properly tagged

### Support

For technical support or questions about the AI Conversation Export feature, contact the system administrator or refer to the main TekRem documentation.
