import React from 'react';

interface MarketingEmailTemplateProps {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  earthquakePlace: string;
  earthquakeMagnitude: number;
  earthquakeDate: string;
  riskLevel: string;
  subject: string;
  body: string;
  companyName?: string;
  companyWebsite?: string;
  unsubscribeUrl?: string;
}

export const MarketingEmailTemplate: React.FC<MarketingEmailTemplateProps> = ({
  firstName,
  lastName,
  city,
  state,
  earthquakePlace,
  earthquakeMagnitude,
  earthquakeDate,
  riskLevel,
  subject,
  body,
  companyName = "Nextgenfi Insurance",
  companyWebsite = "https://nextgenfi.ai",
  unsubscribeUrl = "#"
}) => {
  const riskColors = {
    high: '#dc2626',
    medium: '#ea580c',
    low: '#16a34a'
  };

  const riskColor = riskColors[riskLevel as keyof typeof riskColors] || riskColors.medium;

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #f3f4f6',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          color: '#000000',
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 10px 0'
        }}>
          {companyName}
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0'
        }}>
          Earthquake Insurance Solutions
        </p>
      </div>

      {/* Alert Banner */}
      <div style={{
        backgroundColor: '#fef2f2',
        border: `2px solid ${riskColor}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          color: riskColor,
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px'
        }}>
          {riskLevel.toUpperCase()} RISK ALERT
        </div>
        <div style={{
          color: '#374151',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Recent M{earthquakeMagnitude} earthquake near {earthquakePlace}
        </div>
        <div style={{
          color: '#6b7280',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          {earthquakeDate}
        </div>
      </div>

      {/* Personalized Greeting */}
      <div style={{
        marginBottom: '24px'
      }}>
        <h2 style={{
          color: '#111827',
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 16px 0'
        }}>
          Hello {firstName} {lastName},
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0'
        }}>
          Homeowner in {city}, {state}
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        marginBottom: '32px'
      }}>
        <div style={{
          color: '#374151',
          fontSize: '16px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}>
          {body}
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <a
          href={`${companyWebsite}/quote?ref=earthquake-alert`}
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '14px 28px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            transition: 'background-color 0.2s'
          }}
        >
          Get Your Free Quote Today
        </a>
      </div>

      {/* Features */}
      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          color: '#111827',
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          Why Choose Our Earthquake Insurance?
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {[
            '✓ Comprehensive Coverage',
            '✓ 24/7 Claims Support',
            '✓ Fast Claim Processing',
            '✓ Competitive Rates',
            '✓ No Hidden Fees',
            '✓ A+ Rated Insurer'
          ].map((feature, index) => (
            <div key={index} style={{
              color: '#16a34a',
              fontSize: '14px',
              fontWeight: '500',
              flex: '1 1 calc(50% - 6px)',
              minWidth: '140px'
            }}>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Message */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#92400e',
          fontSize: '14px',
          fontWeight: '500',
          margin: '0'
        }}>
          ⚡ Limited Time: Get 15% off your first year premium
        </p>
        <p style={{
          color: '#78350f',
          fontSize: '12px',
          margin: '4px 0 0 0'
        }}>
          Quote expires in 7 days
        </p>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0 0 8px 0'
        }}>
          {companyName} - Protecting Your Future
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0 0 16px 0'
        }}>
          This email was sent because you live in an area affected by recent seismic activity.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <a
            href={companyWebsite}
            style={{
              color: '#6b7280',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            Visit Website
          </a>
          <a
            href={`${companyWebsite}/contact`}
            style={{
              color: '#6b7280',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            Contact Us
          </a>
          <a
            href={unsubscribeUrl}
            style={{
              color: '#6b7280',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            Unsubscribe
          </a>
        </div>
      </div>
    </div>
  );
};


