# 📧 Email Marketing Features Guide

## Overview
This guide covers the new email marketing features integrated into the RAG (Geospatial Marketing Intelligence) system using **SendGrid** as the email service provider.

## 🚀 Features

### 1. **Test Email Functionality**
- **Purpose**: Send preview emails to test recipients before launching campaigns
- **Default Recipient**: `nitsancs@gmail.com`
- **API Endpoint**: `/api/rag/email/test`

### 2. **Bulk Email Campaign**
- **Purpose**: Send personalized emails to all target users automatically
- **Features**: Batch processing, rate limiting, detailed reporting
- **API Endpoint**: `/api/rag/email/send`

### 3. **Professional Email Templates**
- **React-based**: Type-safe, component-driven email templates
- **Personalization**: Dynamic content based on target data and earthquake information
- **Responsive**: Mobile-friendly design
- **Branding**: Consistent with Nextgenfi brand

## 🛠 Technical Implementation

### Email Template Component
```typescript
// components/rag/marketing-email-template.tsx
<MarketingEmailTemplate
  firstName="John"
  lastName="Doe"
  city="Los Angeles"
  state="CA"
  earthquakePlace="Southern California"
  earthquakeMagnitude={4.2}
  earthquakeDate="December 15, 2024"
  riskLevel="high"
  subject="Earthquake Insurance Alert"
  body="Your personalized message..."
/>
```

### API Routes

#### Test Email API
```bash
POST /api/rag/email/test
Content-Type: application/json

{
  "subject": "Your email subject",
  "body": "Your email body content",
  "targetData": { /* target user data */ },
  "testEmail": "nitsancs@gmail.com" // optional
}
```

#### Bulk Email API
```bash
POST /api/rag/email/send
Content-Type: application/json

{
  "subject": "Your email subject",
  "body": "Your email body content",
  "targets": [ /* array of target users */ ],
  "campaignId": "campaign-123", // optional
  "batchSize": 10, // optional, default: 10
  "delayBetweenBatches": 2000 // optional, default: 2000ms
}
```

## 🎯 How to Use

### Step 1: Generate Email Content
1. Navigate to **Dashboard** → **RAG System** → **Generate Emails** tab
2. Configure Gemini API (if not already done)
3. Find targets using the **Find Targets** tab
4. Select a target and generate email content

### Step 2: Send Test Email
1. After generating email content, click **"Send Test Email"** button
2. Email will be sent to `nitsancs@gmail.com` with `[TEST]` prefix
3. Check the results in the **Email Campaign Results** section

### Step 3: Launch Campaign
1. Review the generated email content
2. Click **"Send to All Targets"** button
3. Monitor progress and results in real-time
4. View detailed campaign statistics

## 📊 Campaign Results

### Test Email Results
- ✅ Success confirmation
- 📧 Recipient email address
- 📋 Subject line preview
- 👤 Target information preview

### Bulk Campaign Results
- 📈 **Total Targets**: Number of users targeted
- ✅ **Emails Sent**: Successfully delivered emails
- ❌ **Failed**: Failed delivery attempts
- 📊 **Success Rate**: Percentage of successful deliveries
- ⏱️ **Performance Metrics**: Total time and average per email

## ⚙️ Configuration

### Environment Variables
```bash
# Required for email functionality
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Better Auth configuration
BETTER_AUTH_URL=https://your-app-domain.com
```

### Rate Limiting
- **Default Batch Size**: 10 emails per batch
- **Default Delay**: 2 seconds between batches
- **Conservative Settings**: 5 emails per batch, 3 seconds delay for bulk campaigns
- **SendGrid Limits**: 10,000 emails/month on free plan, unlimited on paid plans

## 🎨 Email Template Features

### Professional Design
- **Header**: Company branding and earthquake insurance focus
- **Alert Banner**: Color-coded risk level (High/Medium/Low)
- **Personalization**: Name, location, and earthquake-specific details
- **Call-to-Action**: Prominent "Get Your Free Quote" button
- **Features Section**: Key benefits and selling points
- **Urgency**: Limited-time offer messaging
- **Footer**: Professional footer with unsubscribe and contact links

### Dynamic Content
- **Risk-based Colors**: Red (high), Orange (medium), Green (low)
- **Earthquake Details**: Magnitude, location, and date
- **Personal Information**: Name, city, state
- **Distance**: Proximity to earthquake epicenter
- **Property Value**: Contextual messaging based on home value

## 🔧 Customization

### Email Template
Edit `components/rag/marketing-email-template.tsx` to:
- Modify design and layout
- Add new personalization fields
- Update branding and colors
- Change call-to-action buttons

### API Configuration
Modify API routes to:
- Change default batch sizes
- Adjust rate limiting
- Add new email providers
- Implement additional tracking

## 📈 Best Practices

### Email Deliverability
1. **Warm-up**: Start with smaller batches for new domains
2. **Authentication**: Ensure proper SPF, DKIM, and DMARC records
3. **Content Quality**: Avoid spam trigger words and excessive links
4. **List Hygiene**: Remove bounced and unsubscribed emails

### Campaign Management
1. **Testing**: Always send test emails before bulk campaigns
2. **Timing**: Consider optimal send times for your audience
3. **Segmentation**: Target specific risk levels or geographic areas
4. **Monitoring**: Watch delivery rates and adjust as needed

### Performance Optimization
1. **Batch Processing**: Use appropriate batch sizes for your volume
2. **Error Handling**: Implement retry logic for failed sends
3. **Logging**: Track campaign performance and deliverability
4. **Rate Limiting**: Respect provider limits to avoid throttling

## 🚨 Troubleshooting

### Common Issues

#### Test Email Not Received
- ✅ Check spam/junk folder
- ✅ Verify SENDGRID_API_KEY is set correctly
- ✅ Check SendGrid dashboard for delivery status
- ✅ Ensure `nitsancs@gmail.com` is correct

#### Bulk Campaign Failures
- ✅ Check rate limiting settings
- ✅ Verify target email addresses are valid
- ✅ Monitor SendGrid account limits and usage
- ✅ Review error messages in campaign results

#### Template Rendering Issues
- ✅ Check React component syntax
- ✅ Verify all required props are provided
- ✅ Test with different target data
- ✅ Review browser console for errors

### Error Codes
- **400**: Missing required fields or invalid data
- **500**: Server error or SendGrid API issues
- **Rate Limited**: Too many requests, increase delays

## 📞 Support

For issues with:
- **Email Delivery**: Check SendGrid dashboard and logs
- **Template Design**: Review React component documentation
- **API Integration**: Check request/response formats
- **Performance**: Monitor batch sizes and timing

## 🔮 Future Enhancements

### Planned Features
- 📊 **Advanced Analytics**: Open rates, click tracking
- 🎯 **A/B Testing**: Subject line and content variations
- 📅 **Scheduled Campaigns**: Time-delayed email sending
- 🏷️ **Email Templates**: Multiple template options
- 🔄 **Automated Follow-ups**: Drip campaigns based on responses
- 📱 **SMS Integration**: Multi-channel marketing campaigns

### Integration Opportunities
- 📈 **CRM Integration**: Sync with customer management systems
- 🎯 **Lead Scoring**: Prioritize high-value prospects
- 📊 **Attribution Tracking**: Measure ROI and conversions
- 🤖 **AI Optimization**: Machine learning for send time and content

---

## Quick Start Checklist

- [ ] ✅ SendGrid API key configured
- [ ] 🔧 Environment variables set
- [ ] 🎯 Targets identified using earthquake data
- [ ] 📝 Email content generated with Gemini AI
- [ ] 📧 Test email sent and verified
- [ ] 🚀 Bulk campaign launched
- [ ] 📊 Results monitored and analyzed

**Ready to launch your earthquake insurance marketing campaigns! 🌟**


