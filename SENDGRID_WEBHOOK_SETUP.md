# SendGrid Webhook Setup Guide

This guide explains how to configure SendGrid webhooks to track email events and display real-time statistics in your dashboard.

## 🎯 **Webhook Endpoint**

Your webhook endpoint is ready at:
```
https://yourdomain.com/api/sendgrid/webhook
```

For local development:
```
http://localhost:3000/api/sendgrid/webhook
```

## 📋 **SendGrid Configuration Steps**

### 1. **Access SendGrid Dashboard**
1. Log in to your SendGrid account
2. Navigate to **Settings** → **Mail Settings** → **Event Webhook**

### 2. **Configure Webhook Settings**
1. **HTTP POST URL**: `https://yourdomain.com/api/sendgrid/webhook`
2. **HTTP POST URL Test**: `https://yourdomain.com/api/sendgrid/webhook` (for testing)

### 3. **Enable Event Types**
Select the following events to track:
- ✅ **Processed** - Email received and ready to be delivered
- ✅ **Delivered** - Email was successfully delivered  
- ✅ **Open** - Recipient opened the email
- ✅ **Click** - Recipient clicked on a link within the email
- ✅ **Bounce** - Email bounced
- ✅ **Dropped** - Email was dropped
- ✅ **Spam Report** - Recipient marked email as spam
- ✅ **Unsubscribe** - Recipient unsubscribed

### 4. **Custom Arguments**
The webhook expects these custom arguments in your email sends:
```javascript
custom_args: {
  userId: "recipient@example.com",
  campaignId: "weather_campaign_001", 
  weatherEventId: "bd_weather_001", // For weather campaigns
  earthquakeId: "eq_001", // For earthquake campaigns
  riskLevel: "high",
  emailType: "weather-insurance-campaign" // or "earthquake-insurance-campaign"
}
```

### 5. **Test Configuration**
1. Click **Test Your Integration**
2. SendGrid will send a test POST request to your webhook
3. Check your application logs for the test event

## 🔧 **Testing Locally**

### **Option 1: Use the Test Script**
```bash
npx tsx scripts/test-webhook.ts
```

This script sends sample events to test your webhook locally.

### **Option 2: Manual Testing**
```bash
curl -X POST http://localhost:3000/api/sendgrid/webhook \
  -H "Content-Type: application/json" \
  -d '[
    {
      "email": "test@example.com",
      "timestamp": 1695123456,
      "event": "processed",
      "sg_message_id": "test_001",
      "unique_args": {
        "userId": "test@example.com",
        "campaignId": "test_campaign",
        "riskLevel": "high",
        "emailType": "weather-insurance-campaign"
      }
    }
  ]'
```

## 📊 **Email Statistics API**

### **Get All Stats**
```bash
GET /api/email/stats
```

### **Get Stats for Specific Campaign**
```bash
GET /api/email/stats?campaignId=weather_campaign_001
```

### **Get Stats for Last N Days**
```bash
GET /api/email/stats?days=7
```

### **Response Format**
```json
{
  "summary": {
    "totalEvents": 150,
    "uniqueEmails": 45,
    "dateRange": {
      "from": "2025-08-21T00:00:00.000Z",
      "to": "2025-09-20T00:00:00.000Z"
    }
  },
  "eventTypes": {
    "processed": 50,
    "delivered": 48,
    "open": 25,
    "click": 8,
    "bounce": 2,
    "dropped": 0,
    "spam_report": 0,
    "unsubscribe": 1
  },
  "campaigns": [
    {
      "campaignId": "weather_campaign_001",
      "emailType": "weather-insurance-campaign",
      "totalSent": 30,
      "delivered": 29,
      "opened": 15,
      "clicked": 5,
      "bounced": 1,
      "dropped": 0,
      "openRate": 51.7,
      "clickRate": 17.2,
      "deliveryRate": 96.7
    }
  ],
  "dailyStats": [
    {
      "date": "2025-09-20",
      "processed": 5,
      "delivered": 5,
      "opened": 3,
      "clicked": 1,
      "bounced": 0,
      "dropped": 0
    }
  ]
}
```

## 🚀 **Production Deployment**

### **1. Update Webhook URL**
Change the webhook URL in SendGrid to your production domain:
```
https://yourdomain.com/api/sendgrid/webhook
```

### **2. Environment Variables**
Ensure these are set in production:
```bash
DATABASE_URL=your_production_database_url
SENDGRID_API_KEY=your_sendgrid_api_key
```

### **3. SSL Certificate**
SendGrid requires HTTPS for production webhooks. Ensure your domain has a valid SSL certificate.

## 🔍 **Monitoring & Debugging**

### **Check Webhook Status**
```bash
GET /api/sendgrid/webhook
```

Returns webhook status and configuration info.

### **View Recent Events**
Check your database for recent email events:
```sql
SELECT * FROM email_event 
ORDER BY timestamp DESC 
LIMIT 10;
```

### **Common Issues**

**❌ Webhook not receiving events:**
- Check SendGrid webhook configuration
- Verify URL is accessible from internet
- Check application logs for errors

**❌ Events not showing in dashboard:**
- Verify database connection
- Check if events are being stored in `email_event` table
- Ensure custom_args are being sent correctly

**❌ Statistics not updating:**
- Check if webhook is processing events successfully
- Verify API endpoint is returning data
- Check browser console for JavaScript errors

## 📈 **Dashboard Integration**

The email statistics are automatically displayed in:
- **Dashboard** → **Email Analytics** tab
- Real-time charts showing opens, clicks, bounces
- Campaign-specific metrics
- Daily engagement trends

## 🎯 **Campaign Tracking**

### **Weather Insurance Campaigns**
```javascript
custom_args: {
  userId: recipient.email,
  campaignId: `weather_campaign_${Date.now()}`,
  weatherEventId: weatherEvent.id,
  riskLevel: target.risk_level,
  emailType: "weather-insurance-campaign"
}
```

### **Earthquake Insurance Campaigns**
```javascript
custom_args: {
  userId: recipient.email,
  campaignId: `earthquake_campaign_${Date.now()}`,
  earthquakeId: earthquake.id,
  riskLevel: target.risk_level,
  emailType: "earthquake-insurance-campaign"
}
```

## ✅ **Verification Checklist**

- [ ] SendGrid webhook URL configured
- [ ] All required events enabled
- [ ] Custom arguments included in email sends
- [ ] Webhook endpoint accessible
- [ ] Database storing events correctly
- [ ] Dashboard displaying statistics
- [ ] Test events processed successfully

## 🆘 **Support**

If you encounter issues:
1. Check application logs for error messages
2. Verify SendGrid webhook configuration
3. Test webhook endpoint manually
4. Check database connectivity
5. Review custom arguments format

The webhook system is now ready to track all your email campaigns and provide real-time analytics! 📊
