import fetch from 'node-fetch';

// Test webhook events to simulate SendGrid data
const testEvents = [
  {
    email: "ahmad.rahman@example.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "processed",
    sg_message_id: "test_msg_001",
    unique_args: {
      userId: "ahmad.rahman@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "high",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "ahmad.rahman@example.com",
    timestamp: Math.floor(Date.now() / 1000) + 10,
    event: "delivered",
    sg_message_id: "test_msg_001",
    unique_args: {
      userId: "ahmad.rahman@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "high",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "ahmad.rahman@example.com",
    timestamp: Math.floor(Date.now() / 1000) + 300,
    event: "open",
    sg_message_id: "test_msg_001",
    unique_args: {
      userId: "ahmad.rahman@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "high",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "fatima.begum@example.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "processed",
    sg_message_id: "test_msg_002",
    unique_args: {
      userId: "fatima.begum@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "medium",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "fatima.begum@example.com",
    timestamp: Math.floor(Date.now() / 1000) + 15,
    event: "delivered",
    sg_message_id: "test_msg_002",
    unique_args: {
      userId: "fatima.begum@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "medium",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "fatima.begum@example.com",
    timestamp: Math.floor(Date.now() / 1000) + 600,
    event: "open",
    sg_message_id: "test_msg_002",
    unique_args: {
      userId: "fatima.begum@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "medium",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "fatima.begum@example.com",
    timestamp: Math.floor(Date.now() / 1000) + 900,
    event: "click",
    sg_message_id: "test_msg_002",
    url: "https://example.com/insurance-quote",
    unique_args: {
      userId: "fatima.begum@example.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "medium",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "invalid.email@nonexistent.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "processed",
    sg_message_id: "test_msg_003",
    unique_args: {
      userId: "invalid.email@nonexistent.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "low",
      emailType: "weather-insurance-campaign"
    }
  },
  {
    email: "invalid.email@nonexistent.com",
    timestamp: Math.floor(Date.now() / 1000) + 30,
    event: "bounce",
    sg_message_id: "test_msg_003",
    reason: "550 5.1.1 User unknown",
    unique_args: {
      userId: "invalid.email@nonexistent.com",
      campaignId: "weather_campaign_001",
      weatherEventId: "bd_weather_001",
      riskLevel: "low",
      emailType: "weather-insurance-campaign"
    }
  }
];

async function testWebhook() {
  const webhookUrl = 'http://localhost:3000/api/sendgrid/webhook';
  
  console.log('🧪 Testing SendGrid webhook with sample events...');
  console.log(`📡 Sending to: ${webhookUrl}`);
  console.log(`📊 Events to send: ${testEvents.length}`);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvents)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Webhook test successful!');
    console.log('📈 Results:', JSON.stringify(result, null, 2));
    
    if (result.processed > 0) {
      console.log('\n🎉 Email events have been stored in the database!');
      console.log('📊 You can now check the Email Analytics section in your dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testWebhook();
