# Alepo Enterprise Multitenant Selfcare - Requirements Document

**Document Version:** 1.0  
**Date:** January 22, 2026  
**Author:** Product Engineering  
**Document Type:** Enterprise Requirements Specification

---

## Executive Summary

This document defines the comprehensive requirements for Alepo's Enterprise Multitenant Selfcare platform - a next-generation customer portal solution built on Next.js/React/MongoDB stack with complete tenant isolation, customization capabilities, and enterprise-grade security.

The platform enables service providers to operate independent, isolated selfcare instances for multiple tenants (brands, regions, or customers) while sharing underlying infrastructure, delivering cost-effective SaaS solutions with complete data segregation.

---

## 1. System Overview

### 1.1 Product Vision

Alepo Enterprise Multitenant Selfcare (branded as "SelfcareNOW") is a modern, cloud-native customer self-service portal that allows telecommunications and ISP customers to manage their services, view usage, make payments, and access support through web and mobile interfaces.

### 1.2 Technology Stack

- **Frontend:** Next.js 14+, React 18+, TypeScript
- **Backend:** Node.js ≥12.13.0, Sails.js ≥1.2.3
- **Database:** MongoDB (with tenant isolation via tenant ID)
- **Authentication:** OAuth 2.0, JWT tokens
- **API:** OpenAPI 3.0 specification with openapi-generator-cli ≥4.3.1
- **Infrastructure:** Docker containers, Kubernetes orchestration support

### 1.3 Integration Points

- **CRM Integration:** OAuth server authentication, subscriber data sync
- **Billing Integration:** Real-time balance queries, invoice generation, payment processing
- **Payment Gateways:** Stripe, Cash App Pay, Mobile money services
- **Analytics:** Embedded analytics with automatic tenant context
- **AAA Services:** Authentication, Authorization, Accounting via Alepo AAA

---

## 2. Multi-Tenancy Architecture Requirements

### 2.1 Tenant Isolation

**REQ-MT-001: Complete Data Segregation**
- Full data segregation across all selfcare modules at database level
- Separate MongoDB collections per tenant with tenant ID injection
- No shared data between tenants at any system layer
- Automatic data filtering in all queries and operations

**REQ-MT-002: Tenant Context Management**
- Tenant context maintained throughout request lifecycle
- Automatic tenant validation on all API calls
- Tenant-aware caching strategies with isolated cache namespaces
- Session management per tenant with secure token handling

**REQ-MT-003: Database Architecture**
- Tenant ID field in all MongoDB collections
- Automatic filtering on tenant ID in all queries
- Indexes optimized for tenant-based queries
- Support for tenant-specific connection pools

**REQ-MT-004: Tenant Boundaries**
- Prevention of cross-tenant data access at all layers
- Tenant-aware API endpoints with automatic filtering
- Security policies configured independently per tenant
- Compliance boundaries respected per tenant

### 2.2 Tenant Onboarding & Management

**REQ-MT-005: Automated Tenant Provisioning**
- Self-service tenant creation via admin portal
- API-based tenant provisioning for programmatic creation
- Guided setup wizard with validation and error checking
- Automated rollback on provisioning failure

**REQ-MT-006: Tenant Configuration**
- Basic tenant information (name, key, description, status)
- Contact information (support email, phone, address, business hours)
- Custom domain configuration (e.g., tenant.selfcare.com)
- DNS configuration requirements and validation

**REQ-MT-007: Tenant Lifecycle Management**
- Tenant creation, activation, suspension, deletion
- Bulk tenant operations support
- Tenant health monitoring and status tracking
- Migration tools for existing deployments

---

## 3. Customization & Branding Requirements

### 3.1 Brand Identity

**REQ-BRAND-001: Logo Management**
- Custom logo upload with validation (PNG, SVG, JPG)
- Recommended logo dimensions: 200x60 pixels
- Logo display across all portal pages and email communications
- Automatic logo scaling and optimization

**REQ-BRAND-002: Color Scheme Customization**
- Primary brand color configuration
- Secondary/accent color configuration
- Theme mode support (Light/Dark/Auto)
- Color scheme application across UI components
- CSS custom properties for brand colors

**REQ-BRAND-003: Custom Domain Support**
- Subdomain-based tenant routing (tenant.selfcare.com)
- Custom domain configuration (www.tenant-domain.com)
- SSL/TLS certificate management per domain
- DNS configuration validation and guidance

### 3.2 Localization

**REQ-LOC-001: Date & Time Formatting**
- Tenant-specific date format configuration (MM/DD/YYYY, DD/MM/YYYY, etc.)
- Time zone configuration per tenant
- Localized date/time displays throughout portal
- Dual location support (abbreviated and full names, e.g., "NY" and "New York")

**REQ-LOC-002: Multi-Language Support**
- Language selection per tenant
- Multi-language content support
- Language file upload and management
- RTL (Right-to-Left) language support

**REQ-LOC-003: Regional Settings**
- Currency configuration with multi-currency support
- Number formatting based on locale
- Address format customization
- Regional compliance requirements

---

## 4. Authentication & Security Requirements

### 4.1 Authentication

**REQ-AUTH-001: OAuth 2.0 Integration**
- OAuth server integration with CRM
- JWT token-based authentication
- Client ID and Client Secret management
- Token expiration and refresh mechanisms

**REQ-AUTH-002: Multi-Factor Authentication**
- SMS-based OTP verification
- Email-based verification codes
- Time-based one-time password (TOTP) support
- Fallback authentication methods

**REQ-AUTH-003: Password Management**
- Configurable password policies per tenant
- Password strength requirements (length, complexity)
- Password reset via email/SMS
- Password history and reuse prevention
- Account lockout after failed attempts

### 4.2 Authorization

**REQ-AUTHZ-001: Role-Based Access Control (RBAC)**
- Tenant-specific role definitions
- Granular permission models per tenant
- User-role assignment management
- Permission inheritance and override

**REQ-AUTHZ-002: Resource Access Control**
- API endpoint authorization per tenant
- Feature flag-based access control
- Data-level access restrictions
- Service-level permissions

### 4.3 Security Controls

**REQ-SEC-001: Data Protection**
- Encryption at rest for sensitive data
- Encryption in transit (TLS 1.2+)
- Data masking for PII in logs
- Secure credential storage (hashed passwords)

**REQ-SEC-002: Session Management**
- Secure session token generation
- Session timeout configuration per tenant
- Concurrent session limits
- Session invalidation on logout

**REQ-SEC-003: Audit & Compliance**
- Tenant-specific audit trail logging
- Activity logging for all user actions
- Security event monitoring per tenant
- GDPR compliance features (data export, deletion)

---

## 5. Core Selfcare Features

### 5.1 Dashboard

**REQ-DASH-001: Customer Dashboard**
- At-a-glance view of account status and services
- Real-time balance display (prepaid/postpaid)
- Active services summary with validity periods
- Usage statistics and trends
- Quick action widgets (pay bill, purchase add-ons, etc.)
- Activity feed showing recent transactions

**REQ-DASH-002: Data Visualization**
- Usage charts and graphs (data, voice, SMS)
- Historical usage trends
- Plan utilization metrics
- Interactive data exploration

**REQ-DASH-003: Notifications & Alerts**
- Real-time push notifications via WebSocket
- Email notifications for important events
- SMS alerts for critical updates
- In-app notification center
- Notification preferences management

### 5.2 Account Management

**REQ-ACCT-001: Profile Management**
- View and update subscriber profile information
- Contact details management (email, phone, address)
- Communication preferences
- Profile picture upload
- Account verification status

**REQ-ACCT-002: Password & Security**
- Change password functionality
- Security question management
- Two-factor authentication setup
- Trusted device management
- Login history and active sessions

**REQ-ACCT-003: Subscription Management**
- View current plan details
- Plan upgrade/downgrade capability
- Service activation/deactivation
- Add-on purchases
- Plan switch with end-of-period (EOP) scheduling

### 5.3 Usage & Services

**REQ-USAGE-001: Usage History**
- Detailed usage history by service type (data, voice, SMS)
- Filterable by date range and service
- Usage details view with timestamps
- CDR (Call Detail Records) viewing
- Export usage reports (PDF, CSV)
- Pagination support (batches of 5-10 records)

**REQ-USAGE-002: Data Pass Management**
- View available data passes
- Purchase data passes
- Auto top-up configuration
- Data pass validity tracking
- Usage alerts and notifications

**REQ-USAGE-003: Service History**
- View active services
- View past/expired services
- Service status tracking (Active, Expired, Suspended)
- Service renewal options
- Service details and specifications

### 5.4 Billing & Payments

**REQ-BILL-001: Bill Viewing**
- Current bill summary
- Itemized bill details
- Bill history (past 12 months minimum)
- Invoice download (PDF format)
- Bill due date tracking

**REQ-BILL-002: Payment Processing**
- Multiple payment method support:
  - Credit/Debit cards
  - Cash App Pay
  - Mobile money wallets
  - Bank transfers
  - E-vouchers
- One-time payment processing
- Payment confirmation and receipts
- Payment history viewing
- Payment receipt download

**REQ-BILL-003: Autopay Enrollment**
- Autopay setup and configuration
- Recurring payment scheduling
- Autopay status management (enroll, cancel)
- Autopay consistency across UI and backend
- Payment method selection for autopay
- Autopay failure handling and notifications

**REQ-BILL-004: Payment Gateway Integration**
- Stripe integration with tokenization
- 3D Secure authentication support
- PCI DSS compliance
- Payment callback handling
- Transaction status tracking
- Refund and chargeback management

**REQ-BILL-005: Express Pay**
- Quick payment without login
- Guest payment processing
- Payment confirmation via email/SMS
- Invoice lookup by account number

### 5.5 Plan & Service Management

**REQ-PLAN-001: Plan Browsing**
- View available plans by category
- Plan comparison functionality
- Plan details with pricing and features
- Promotional offers display
- Plan recommendations based on usage

**REQ-PLAN-002: Plan Purchase**
- Plan selection and purchase flow
- Plan bundle configuration
- Price estimation with proforma invoice
- Service option selection
- Terms and conditions acceptance
- Purchase confirmation

**REQ-PLAN-003: Plan Switching**
- Switch plan with immediate or EOP activation
- Plan downgrade/upgrade
- Impact analysis before switch
- Plan switch scheduling
- Confirmation and notification

**REQ-PLAN-004: Add-On Services**
- Browse available add-ons
- Purchase add-ons (data, voice, international calling)
- Add-on management and renewal
- Add-on validity tracking

### 5.6 Family Hierarchy Management

**REQ-FAM-001: Family Account Management**
- Parent-child account hierarchy
- Add child accounts to parent hierarchy
- Search and link child accounts
- Manage child account permissions
- View child account details and usage

**REQ-FAM-002: Child Account Operations**
- Manage selfcare access for child accounts
- Control notifications for child accounts
- Payment responsibility configuration
- Dissociate child accounts from hierarchy
- Child account activity monitoring

### 5.7 Support & Communication

**REQ-SUPP-001: Help & Support Center**
- FAQ and knowledge base
- Contact information display
- Support ticket creation
- View ticket status and history
- Attachment support for tickets

**REQ-SUPP-002: Chatbot Integration**
- AI-powered chatbot for common queries
- Multi-lingual chatbot support
- Chatbot integrated in web and mobile
- Escalation to human support
- Chatbot conversation history

**REQ-SUPP-003: Notifications**
- Email notifications for account events
- SMS notifications for critical alerts
- Push notifications for mobile app
- Notification preferences management
- Notification history and archive

### 5.8 Additional Features

**REQ-FEAT-001: Voucher Management**
- Physical voucher redemption
- E-voucher purchase and activation
- Voucher history tracking
- Balance top-up via voucher
- Voucher validity verification

**REQ-FEAT-002: Credit Transfer**
- Transfer credit to other accounts
- Credit transfer history
- Transfer limits and validation
- Confirmation and notification

**REQ-FEAT-003: Refer & Earn**
- Referral program participation
- Referral code generation
- Track referral status and rewards
- Reward redemption

---

## 6. Admin Portal Requirements

### 6.1 Tenant Management

**REQ-ADMIN-001: Tenant Onboarding Portal**
- Tenant creation via web interface
- Tenant configuration wizard
- Tenant activation/deactivation
- Bulk tenant provisioning
- Tenant search and filtering

**REQ-ADMIN-002: Tenant Settings Management**
- Branding configuration (logo, colors, themes)
- Feature flag management per tenant
- Localization settings
- Integration configuration
- Security settings

**REQ-ADMIN-003: Tenant Monitoring**
- Tenant health status dashboard
- Resource utilization tracking
- Performance metrics per tenant
- Alert and notification configuration
- SLA monitoring

### 6.2 Plan & Service Management

**REQ-ADMIN-004: Plan Bundle Management**
- Create plan bundles
- Configure plan pricing and features
- Associate services with plans
- Plan bundle activation/deactivation
- Plan deletion with proper cleanup (hard delete from database)
- Price estimation validation for different account types

**REQ-ADMIN-005: Service Configuration**
- Service creation and configuration
- Service pricing and options
- Service availability by tenant
- Service lifecycle management

**REQ-ADMIN-006: System Configuration**
- Global system parameters
- Tenant-specific configurations
- Feature toggles and flags
- Integration settings
- Location configuration (dual format support)

### 6.3 Reporting & Analytics

**REQ-ADMIN-007: Admin Reports**
- Tenant usage and adoption reports
- Revenue and billing reports
- User activity and engagement reports
- System performance reports
- Custom report creation

**REQ-ADMIN-008: Analytics Integration**
- Embedded analytics with tenant filtering
- Dashboard customization
- Real-time data updates
- Export capabilities
- Drill-down analysis

---

## 7. Technical Requirements

### 7.1 Performance

**REQ-PERF-001: Response Time**
- Page load time < 2 seconds (p95)
- API response time < 500ms (p95)
- Database query optimization with proper indexing
- Efficient tenant filtering in queries

**REQ-PERF-002: Scalability**
- Support for 1000+ concurrent users per tenant
- Horizontal scaling via load balancers
- Auto-scaling based on load
- Connection pooling per tenant

**REQ-PERF-003: Caching**
- Tenant-aware caching strategy
- Cache invalidation on data updates
- Session caching
- Static asset caching with CDN

### 7.2 Reliability

**REQ-REL-001: High Availability**
- 99.9% uptime SLA
- Redundant server deployment
- Failover mechanisms
- Health check endpoints

**REQ-REL-002: Data Backup**
- Automated daily backups
- Point-in-time recovery capability
- Tenant-specific backup and restore
- Backup retention policy (30 days minimum)

**REQ-REL-003: Error Handling**
- Graceful error handling with user-friendly messages
- Error logging and monitoring
- Automatic retry mechanisms for transient failures
- Circuit breaker patterns for external service calls

### 7.3 Integration

**REQ-INT-001: API Design**
- RESTful API design principles
- OpenAPI 3.0 specification
- Versioned API endpoints
- Comprehensive API documentation
- API rate limiting per tenant

**REQ-INT-002: CRM Integration**
- OAuth 2.0 based authentication
- Real-time subscriber data sync
- Event-driven integration where applicable
- Webhook support for async notifications

**REQ-INT-003: Billing Integration**
- Real-time balance queries
- Invoice generation API
- Payment processing callbacks
- Proforma invoice support for cyclic accounts
- Graceful handling of non-cyclic account limitations

**REQ-INT-004: Payment Gateway Integration**
- Support for multiple payment gateways
- Tokenization for secure payment storage
- 3D Secure authentication flow
- Payment callback processing
- Transaction reconciliation

---

## 8. Mobile Requirements

### 8.1 Mobile Responsiveness

**REQ-MOB-001: Responsive Design**
- Mobile-first responsive design
- Support for iOS and Android browsers
- Touch-optimized UI components
- Consistent UX across devices
- Adaptive layouts for different screen sizes

**REQ-MOB-002: Mobile-Specific Features**
- Pull-to-refresh functionality
- Swipe gestures for navigation
- Mobile-optimized forms
- Native-like interactions

### 8.2 Progressive Web App (PWA)

**REQ-MOB-003: PWA Capabilities**
- Offline support for critical features
- App-like experience
- Add to home screen functionality
- Push notification support
- Service worker for caching

---

## 9. Quality Requirements

### 9.1 Testing

**REQ-QA-001: Automated Testing**
- Unit test coverage > 80%
- Integration test coverage for critical flows
- End-to-end testing with Robot Framework
- API testing with automated test suites
- Performance and load testing

**REQ-QA-002: Test Data Management**
- Test data provisioning per tenant
- Automated test data generation
- Test environment isolation
- Data cleanup after testing

**REQ-QA-003: Continuous Testing**
- Automated regression testing
- Continuous integration (CI) pipeline
- Automated deployment to staging
- Smoke tests on production deployment

### 9.2 Documentation

**REQ-DOC-001: Technical Documentation**
- System architecture documentation
- API documentation (OpenAPI/Swagger)
- Database schema documentation
- Deployment guides
- Troubleshooting guides

**REQ-DOC-002: User Documentation**
- End-user guides (web and mobile)
- Admin portal user manual
- FAQ and knowledge base
- Video tutorials
- Release notes

---

## 10. Compliance & Regulatory Requirements

### 10.1 Data Protection

**REQ-COMP-001: GDPR Compliance**
- Right to access personal data
- Right to data portability
- Right to deletion (right to be forgotten)
- Data retention policies
- Consent management

**REQ-COMP-002: PCI DSS Compliance**
- No storage of full credit card numbers
- Payment tokenization
- Secure payment processing
- Regular security audits
- Compliance reporting

### 10.2 Industry Standards

**REQ-COMP-003: Telecommunications Compliance**
- Local regulatory compliance per market
- Number portability support
- Emergency services access
- Fair usage policies
- Service level agreements (SLAs)

---

## 11. Known Issues & Limitations

Based on recent Jira tickets, the following issues are known and being addressed:

### 11.1 Current Issues (As of Jan 2026)

**ISSUE-001: View Past Services Pagination**
- Services loading in batches of 10 instead of 5
- **Ticket:** SCN-387

**ISSUE-002: Service History Page Refresh**
- Past service records disappear after page refresh
- **Ticket:** SCN-386

**ISSUE-003: Service Status Display**
- Expired services showing as "Active" instead of "Expired"
- **Ticket:** SCN-385

**ISSUE-004: Autopay Status Inconsistency**
- Autopay enrollment status inconsistent between Payment onboarding, Settings, and CRM for Cash App Pay
- **Ticket:** SCN-384

**ISSUE-005: Plan Bundle Deletion**
- Plan bundle documents persist in MongoDB after deletion (soft delete issue)
- Re-adding same bundle name fails
- **Ticket:** SCN-380

**ISSUE-006: Price Estimate Error**
- Billing error for non-cyclic accounts on Create Plan Bundle page
- Proforma invoice not supported for non-cyclic accounts
- **Ticket:** SCN-381

### 11.2 Limitations

**LIM-001: Proforma Invoice Support**
- Proforma invoices only supported for cyclic accounts
- Non-cyclic accounts require alternative pricing estimation

**LIM-002: Multi-tenancy Testing**
- Ongoing verification of multitenant features after code merges
- Continuous testing required for tenant isolation

---

## 12. Future Enhancements

### 12.1 Planned Features

**ENH-001: Advanced Analytics**
- Machine learning-based usage predictions
- Personalized plan recommendations
- Anomaly detection for unusual usage patterns
- Customer churn prediction

**ENH-002: Enhanced Personalization**
- AI-driven content personalization
- Dynamic UI customization based on user behavior
- Predictive search and suggestions
- Contextual help and guidance

**ENH-003: Social Features**
- Social login integration (Google, Facebook, Apple)
- Social sharing of achievements
- Community forums
- Gamification elements

**ENH-004: IoT Integration**
- IoT device management
- Device usage tracking
- Smart home integration
- Device-level controls

---

## 13. Deployment Requirements

### 13.1 Infrastructure

**REQ-DEPLOY-001: Container Deployment**
- Docker container images
- Kubernetes deployment manifests
- Helm charts for configuration management
- Multi-environment support (dev, staging, prod)

**REQ-DEPLOY-002: Environment Configuration**
- Environment-specific configuration files
- Secrets management (passwords, API keys)
- Configuration versioning
- Dynamic configuration reload

### 13.2 Monitoring & Operations

**REQ-OPS-001: Application Monitoring**
- Application performance monitoring (APM)
- Error tracking and alerting
- Log aggregation and analysis
- Custom metrics and dashboards

**REQ-OPS-002: Infrastructure Monitoring**
- Server health monitoring
- Resource utilization tracking
- Network performance monitoring
- Database performance monitoring

**REQ-OPS-003: Incident Management**
- Incident detection and alerting
- Incident response procedures
- Post-incident analysis
- Service status page

---

## 14. Dependencies & Prerequisites

### 14.1 Required Software

- **Development:**
  - NodeJS ≥ 12.13.0
  - NPM ≥ 6.12.0
  - Angular ≥ 8.0
  - Sails.js ≥ 1.2.3
  - openapi-generator-cli ≥ 4.3.1

- **Runtime:**
  - MongoDB 4.4+ (production cluster)
  - Redis (for caching and session management)
  - Node.js 12+ runtime

- **Infrastructure:**
  - Docker & Kubernetes (for containerized deployment)
  - Load balancer (Layer 4 or Layer 7)
  - SSL/TLS certificates
  - CDN for static assets

### 14.2 Integration Dependencies

- **Alepo CRM** (version 14.0+)
  - OAuth server configuration
  - Tenant onboarding APIs
  - Subscriber management APIs

- **Alepo Billing System**
  - Invoice generation APIs
  - Payment processing APIs
  - Balance query APIs

- **Payment Gateways**
  - Stripe API integration
  - Cash App Pay integration
  - Mobile money gateway APIs

---

## 15. Success Metrics

### 15.1 Technical Metrics

- **Performance:**
  - Page load time < 2s (p95)
  - API response time < 500ms (p95)
  - 99.9% uptime
  - Zero cross-tenant data leaks

- **Quality:**
  - Code coverage > 80%
  - Zero critical security vulnerabilities
  - Mean time to resolution (MTTR) < 4 hours

### 15.2 Business Metrics

- **Adoption:**
  - Active user growth rate
  - Feature adoption rate
  - Mobile vs web usage ratio
  - Support ticket reduction

- **Efficiency:**
  - Self-service transaction rate > 80%
  - Average resolution time
  - Customer satisfaction score (CSAT) > 4.5/5
  - Net Promoter Score (NPS)

---

## 16. Appendices

### Appendix A: Glossary

- **Tenant:** An independent organization or business entity using the selfcare platform
- **Tenant ID:** Unique identifier for a tenant used for data isolation
- **Plan Bundle:** A combination of services and pricing offered as a package
- **Add-on:** Additional services that can be purchased to supplement a plan
- **EOP:** End of Period - activation scheduled for the end of the billing cycle
- **Proforma Invoice:** A preliminary bill showing estimated charges
- **CDR:** Call Detail Record - detailed usage information
- **OAuth:** Open Authorization - standard for access delegation
- **JWT:** JSON Web Token - compact token format for authentication
- **RBAC:** Role-Based Access Control - access control method

### Appendix B: References

1. Alepo Multi-Tenant BSS Feature Guide
2. SelfcareNOW Architecture Documentation
3. Tenant Configuration Guide
4. Multi-Tenancy Best Practices
5. Alepo Technology Stack Overview

### Appendix C: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-22 | Product Engineering | Initial comprehensive requirements document |

---

**Document Status:** Draft for Review  
**Next Review Date:** 2026-02-22  
**Approvers:** CTO, Product Owner, Engineering Manager

---

## Contact Information

For questions or clarifications regarding this requirements document:

- **Product Owner:** TBD
- **Technical Lead:** TBD
- **Project Manager:** TBD

---

*This document is confidential and proprietary to Alepo Technologies. Unauthorized distribution is prohibited.*
