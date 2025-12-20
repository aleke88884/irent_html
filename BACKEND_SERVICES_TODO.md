# iRent Backend Services - C# Implementation Plan

## Architecture Overview
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: PostgreSQL with Entity Framework Core
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Real-time**: SignalR
- **Authentication**: JWT + Refresh Tokens
- **Storage**: MinIO/AWS S3 for files
- **Maps**: 2GIS API / Google Maps API

---

## 1. Authentication & Authorization Service

### Description
Handles user registration, login, token management, and role-based access control for three user types: Customers, Couriers, and Admins.

### Models
```
- User (Id, Email, Phone, PasswordHash, Role, IsActive, CreatedAt, LastLoginAt)
- RefreshToken (Id, UserId, Token, ExpiresAt, CreatedAt, RevokedAt)
- UserRole (enum: Customer, Courier, Admin, SuperAdmin)
- PasswordResetToken (Id, UserId, Token, ExpiresAt, IsUsed)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login with phone/email + password |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/forgot-password` | Send password reset code |
| POST | `/api/auth/verify-code` | Verify SMS/Email code |
| POST | `/api/auth/reset-password` | Set new password |
| POST | `/api/auth/change-password` | Change password (authenticated) |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/social/google` | Google OAuth login |
| POST | `/api/auth/social/apple` | Apple OAuth login |

### Tasks
- [ ] Implement JWT token generation with claims
- [ ] Implement refresh token rotation
- [ ] Create password hashing service (BCrypt)
- [ ] Implement SMS verification service (Mobizon/Twilio)
- [ ] Implement email verification service (SendGrid/SMTP)
- [ ] Create role-based authorization policies
- [ ] Implement rate limiting for auth endpoints
- [ ] Add brute-force protection (account lockout)
- [ ] Implement OAuth providers (Google, Apple, Facebook)
- [ ] Create audit logging for auth events

---

## 2. User Management Service

### Description
Manages user profiles, addresses, payment methods, and preferences for customers.

### Models
```
- UserProfile (Id, UserId, FirstName, LastName, AvatarUrl, DateOfBirth, IIN)
- UserAddress (Id, UserId, Name, City, Street, Building, Apartment, Entrance, Floor, Intercom, Latitude, Longitude, IsDefault)
- UserPaymentMethod (Id, UserId, Type, CardLast4, CardBrand, ExpiryDate, IsDefault, Token)
- UserNotificationSettings (Id, UserId, PushEnabled, SmsEnabled, EmailEnabled, PromoEnabled)
- UserBonusAccount (Id, UserId, Balance, TotalEarned, TotalSpent)
- BonusTransaction (Id, UserId, Amount, Type, OrderId, Description, CreatedAt)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| POST | `/api/users/profile/avatar` | Upload avatar |
| GET | `/api/users/addresses` | Get user addresses |
| POST | `/api/users/addresses` | Add new address |
| PUT | `/api/users/addresses/{id}` | Update address |
| DELETE | `/api/users/addresses/{id}` | Delete address |
| PUT | `/api/users/addresses/{id}/default` | Set default address |
| GET | `/api/users/payment-methods` | Get payment methods |
| POST | `/api/users/payment-methods` | Add payment method |
| DELETE | `/api/users/payment-methods/{id}` | Remove payment method |
| PUT | `/api/users/payment-methods/{id}/default` | Set default payment |
| GET | `/api/users/notifications/settings` | Get notification settings |
| PUT | `/api/users/notifications/settings` | Update notification settings |
| GET | `/api/users/bonuses` | Get bonus balance |
| GET | `/api/users/bonuses/history` | Get bonus transactions |

### Tasks
- [ ] Create user profile CRUD operations
- [ ] Implement avatar upload with image resizing
- [ ] Create address management with geocoding
- [ ] Integrate payment tokenization (Kaspi/CloudPayments)
- [ ] Implement bonus points system
- [ ] Create notification preferences management
- [ ] Add profile validation (IIN check for Kazakhstan)
- [ ] Implement user search for admin panel

---

## 3. Catalog Service (Tools)

### Description
Manages tool inventory, categories, pricing, availability, and search functionality.

### Models
```
- Category (Id, Name, Description, IconName, Color, ParentId, SortOrder, IsActive)
- Tool (Id, Name, Description, CategoryId, Brand, Model, DailyPrice, DepositAmount, IsAvailable, TotalQuantity, AvailableQuantity, Rating, ReviewCount, CreatedAt)
- ToolImage (Id, ToolId, ImageUrl, SortOrder, IsMain)
- ToolSpecification (Id, ToolId, Name, Value, Unit)
- ToolInventoryItem (Id, ToolId, SerialNumber, Status, Condition, LastMaintenanceDate, Notes)
- InventoryStatus (enum: Available, Rented, Maintenance, Retired)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by id |
| GET | `/api/categories/{id}/tools` | Get tools in category |
| GET | `/api/tools` | Get tools (with filters, pagination) |
| GET | `/api/tools/{id}` | Get tool details |
| GET | `/api/tools/{id}/availability` | Check availability for dates |
| GET | `/api/tools/search` | Search tools |
| GET | `/api/tools/popular` | Get popular tools |
| GET | `/api/tools/{id}/similar` | Get similar tools |
| POST | `/api/admin/categories` | Create category (admin) |
| PUT | `/api/admin/categories/{id}` | Update category (admin) |
| DELETE | `/api/admin/categories/{id}` | Delete category (admin) |
| POST | `/api/admin/tools` | Create tool (admin) |
| PUT | `/api/admin/tools/{id}` | Update tool (admin) |
| DELETE | `/api/admin/tools/{id}` | Delete tool (admin) |
| POST | `/api/admin/tools/{id}/images` | Upload tool images (admin) |
| GET | `/api/admin/inventory` | Get inventory items (admin) |
| PUT | `/api/admin/inventory/{id}` | Update inventory item (admin) |

### Tasks
- [ ] Create category tree structure with caching
- [ ] Implement tool CRUD with specifications
- [ ] Build availability calculation algorithm
- [ ] Implement full-text search with Elasticsearch/PostgreSQL
- [ ] Create image upload and optimization pipeline
- [ ] Build inventory tracking system
- [ ] Implement tool rating aggregation
- [ ] Create popular/recommended tools algorithm
- [ ] Add price calculation for rental periods
- [ ] Implement bulk import/export for tools

---

## 4. Favorites Service

### Description
Manages user's favorite tools list.

### Models
```
- UserFavorite (Id, UserId, ToolId, CreatedAt)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | Get user's favorites |
| POST | `/api/favorites/{toolId}` | Add to favorites |
| DELETE | `/api/favorites/{toolId}` | Remove from favorites |
| GET | `/api/favorites/check/{toolId}` | Check if tool is favorite |

### Tasks
- [ ] Create favorites CRUD
- [ ] Implement favorites count for tools
- [ ] Add pagination for favorites list
- [ ] Create "back in stock" notifications for favorites

---

## 5. Cart Service

### Description
Manages shopping cart with rental date calculations and pricing.

### Models
```
- Cart (Id, UserId, CreatedAt, UpdatedAt)
- CartItem (Id, CartId, ToolId, StartDate, EndDate, DailyPrice, Quantity)
- CartPromoCode (Id, CartId, Code, DiscountType, DiscountValue)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart contents |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/{id}` | Update cart item (dates, quantity) |
| DELETE | `/api/cart/items/{id}` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/cart/promo` | Apply promo code |
| DELETE | `/api/cart/promo` | Remove promo code |
| GET | `/api/cart/summary` | Get cart totals |

### Tasks
- [ ] Implement cart storage (Redis for guests, DB for users)
- [ ] Create rental price calculator
- [ ] Implement promo code validation
- [ ] Add cart item availability validation
- [ ] Create cart merge on login (guest → user)
- [ ] Implement cart expiration cleanup
- [ ] Add deposit calculation

---

## 6. Order Service

### Description
Core service for order lifecycle management from creation to completion.

### Models
```
- Order (Id, OrderNumber, UserId, Status, DeliveryMethod, DeliveryAddressId, DeliveryFee, SubTotal, Discount, DepositAmount, TotalAmount, PromoCodeId, PaymentStatus, PaymentMethod, PaidAt, Notes, CreatedAt, UpdatedAt)
- OrderItem (Id, OrderId, ToolId, InventoryItemId, StartDate, EndDate, DailyPrice, TotalPrice, Status)
- OrderStatusHistory (Id, OrderId, OldStatus, NewStatus, Comment, ChangedByUserId, CreatedAt)
- OrderStatus (enum: Pending, Confirmed, Preparing, ReadyForDelivery, InDelivery, Delivered, Active, ReturnRequested, Returned, Completed, Cancelled, Refunded)
- DeliveryMethod (enum: Delivery, Pickup)
- PromoCode (Id, Code, DiscountType, DiscountValue, MinOrderAmount, MaxUsageCount, UsedCount, StartDate, EndDate, IsActive)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/orders/{id}/cancel` | Cancel order |
| POST | `/api/orders/{id}/extend` | Extend rental period |
| GET | `/api/orders/active` | Get active rentals |
| GET | `/api/orders/history` | Get completed orders |
| POST | `/api/orders/{id}/return-request` | Request return pickup |
| GET | `/api/admin/orders` | Get all orders (admin) |
| PUT | `/api/admin/orders/{id}/status` | Update order status (admin) |
| PUT | `/api/admin/orders/{id}/assign-courier` | Assign courier (admin) |
| GET | `/api/admin/orders/{id}` | Get order details (admin) |
| POST | `/api/admin/orders/{id}/refund` | Process refund (admin) |

### Tasks
- [ ] Create order placement flow
- [ ] Implement order number generation
- [ ] Build status transition state machine
- [ ] Create inventory reservation system
- [ ] Implement rental period extension
- [ ] Build order cancellation with refund logic
- [ ] Create order history tracking
- [ ] Implement deposit hold/release logic
- [ ] Add order confirmation emails/SMS
- [ ] Create admin order management
- [ ] Build order search and filtering
- [ ] Implement order export (PDF invoice)

---

## 7. Payment Service

### Description
Handles payment processing, deposits, refunds, and financial transactions.

### Models
```
- Payment (Id, OrderId, Amount, Currency, Status, PaymentMethod, TransactionId, GatewayResponse, CreatedAt, ProcessedAt)
- DepositTransaction (Id, OrderId, UserId, Amount, Type, Status, ReleasedAt, CreatedAt)
- Refund (Id, PaymentId, OrderId, Amount, Reason, Status, ProcessedAt, CreatedAt)
- PaymentStatus (enum: Pending, Processing, Completed, Failed, Refunded)
- DepositType (enum: Hold, Release, PartialRelease, Forfeit)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate payment |
| POST | `/api/payments/callback` | Payment gateway callback |
| GET | `/api/payments/{orderId}` | Get payment status |
| POST | `/api/payments/{id}/refund` | Request refund |
| GET | `/api/deposits` | Get user's deposits |
| GET | `/api/admin/payments` | Get all payments (admin) |
| POST | `/api/admin/deposits/{id}/release` | Release deposit (admin) |
| POST | `/api/admin/deposits/{id}/forfeit` | Forfeit deposit (admin) |

### Tasks
- [ ] Integrate Kaspi Pay API
- [ ] Integrate CloudPayments/Stripe
- [ ] Implement payment status webhooks
- [ ] Create deposit hold mechanism
- [ ] Build refund processing
- [ ] Implement partial refunds
- [ ] Create payment receipts generation
- [ ] Add payment retry logic
- [ ] Build financial reporting
- [ ] Implement PCI DSS compliance measures

---

## 8. Delivery Service

### Description
Manages delivery scheduling, courier assignment, and tracking.

### Models
```
- Delivery (Id, OrderId, CourierId, Type, Status, PickupAddressId, DeliveryAddressId, ScheduledDate, PickedUpAt, DeliveredAt, Distance, EstimatedDuration, Fee, Notes)
- DeliveryZone (Id, Name, Polygon, BaseFee, PerKmFee, IsActive)
- DeliverySlot (Id, Date, StartTime, EndTime, MaxOrders, CurrentOrders, IsAvailable)
- DeliveryStatus (enum: Pending, AssignedToCourier, PickedUp, InTransit, Delivered, Failed, Returned)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery/slots` | Get available delivery slots |
| GET | `/api/delivery/fee` | Calculate delivery fee |
| GET | `/api/delivery/{orderId}/track` | Track delivery |
| GET | `/api/delivery/zones` | Get delivery zones |
| PUT | `/api/admin/delivery/{id}/assign` | Assign courier (admin) |
| PUT | `/api/admin/delivery/{id}/status` | Update delivery status (admin) |
| GET | `/api/admin/delivery/zones` | Manage delivery zones (admin) |
| POST | `/api/admin/delivery/zones` | Create delivery zone (admin) |

### Tasks
- [ ] Create delivery zone management with GeoJSON
- [ ] Implement delivery fee calculator
- [ ] Build delivery slot scheduling
- [ ] Create courier assignment algorithm
- [ ] Implement real-time tracking with SignalR
- [ ] Build route optimization
- [ ] Create delivery time estimation
- [ ] Implement failed delivery handling
- [ ] Add delivery proof (photo/signature)

---

## 9. Courier Service

### Description
Manages courier accounts, assignments, earnings, and mobile app functionality.

### Models
```
- Courier (Id, UserId, Status, VehicleType, VehicleNumber, CurrentLatitude, CurrentLongitude, LastLocationUpdate, Rating, TotalDeliveries, IsVerified)
- CourierDocument (Id, CourierId, Type, DocumentUrl, ExpiryDate, IsVerified, VerifiedAt)
- CourierEarning (Id, CourierId, DeliveryId, Amount, BonusAmount, Status, PaidAt, CreatedAt)
- CourierPayoutRequest (Id, CourierId, Amount, Status, BankDetails, ProcessedAt, CreatedAt)
- CourierStatus (enum: Offline, Online, OnDelivery, OnBreak)
- VehicleType (enum: Motorcycle, Car, Bicycle, OnFoot)
- DocumentType (enum: Passport, DriverLicense, VehicleRegistration)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/courier/register` | Register as courier |
| GET | `/api/courier/profile` | Get courier profile |
| PUT | `/api/courier/profile` | Update courier profile |
| PUT | `/api/courier/status` | Update online status |
| PUT | `/api/courier/location` | Update current location |
| GET | `/api/courier/orders/available` | Get available orders |
| POST | `/api/courier/orders/{id}/accept` | Accept order |
| POST | `/api/courier/orders/{id}/reject` | Reject order |
| GET | `/api/courier/orders/active` | Get active deliveries |
| PUT | `/api/courier/orders/{id}/status` | Update delivery status |
| POST | `/api/courier/orders/{id}/complete` | Complete delivery |
| POST | `/api/courier/orders/{id}/problem` | Report problem |
| GET | `/api/courier/earnings` | Get earnings |
| GET | `/api/courier/earnings/history` | Get earnings history |
| POST | `/api/courier/payout` | Request payout |
| GET | `/api/courier/stats` | Get performance stats |
| POST | `/api/courier/documents` | Upload documents |
| GET | `/api/admin/couriers` | Get all couriers (admin) |
| PUT | `/api/admin/couriers/{id}/verify` | Verify courier (admin) |
| PUT | `/api/admin/couriers/{id}/block` | Block courier (admin) |
| GET | `/api/admin/couriers/map` | Get couriers on map (admin) |

### Tasks
- [ ] Create courier registration flow
- [ ] Implement document verification system
- [ ] Build real-time location tracking
- [ ] Create order assignment algorithm (nearest/best rated)
- [ ] Implement earnings calculation
- [ ] Build payout processing
- [ ] Create courier rating system
- [ ] Implement performance metrics
- [ ] Build courier mobile API
- [ ] Add push notifications for new orders
- [ ] Create courier bonus programs

---

## 10. Review & Rating Service

### Description
Manages reviews and ratings for tools and couriers.

### Models
```
- ToolReview (Id, ToolId, UserId, OrderId, Rating, Comment, IsVerified, CreatedAt, UpdatedAt)
- CourierReview (Id, CourierId, UserId, DeliveryId, Rating, Comment, CreatedAt)
- ReviewImage (Id, ReviewId, ImageUrl)
- ReviewReport (Id, ReviewId, ReporterId, Reason, Status, CreatedAt)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools/{id}/reviews` | Get tool reviews |
| POST | `/api/tools/{id}/reviews` | Add tool review |
| PUT | `/api/reviews/{id}` | Update review |
| DELETE | `/api/reviews/{id}` | Delete review |
| POST | `/api/reviews/{id}/report` | Report review |
| POST | `/api/courier/{id}/review` | Review courier |
| GET | `/api/admin/reviews` | Get all reviews (admin) |
| PUT | `/api/admin/reviews/{id}/approve` | Approve/reject review (admin) |

### Tasks
- [ ] Create review submission flow
- [ ] Implement verified purchase badge
- [ ] Build rating aggregation
- [ ] Add review moderation
- [ ] Create review image upload
- [ ] Implement review reporting
- [ ] Build review analytics

---

## 11. Notification Service

### Description
Handles push notifications, SMS, and email communications.

### Models
```
- Notification (Id, UserId, Type, Title, Message, Data, IsRead, CreatedAt)
- NotificationTemplate (Id, Type, TitleTemplate, MessageTemplate, Channel)
- SmsLog (Id, Phone, Message, Status, Provider, SentAt)
- EmailLog (Id, Email, Subject, Body, Status, SentAt)
- PushToken (Id, UserId, Token, Platform, CreatedAt)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/{id}` | Delete notification |
| POST | `/api/notifications/push-token` | Register push token |
| DELETE | `/api/notifications/push-token` | Remove push token |
| POST | `/api/admin/notifications/broadcast` | Send broadcast (admin) |

### Tasks
- [ ] Integrate Firebase Cloud Messaging (FCM)
- [ ] Integrate Apple Push Notification Service (APNS)
- [ ] Create SMS gateway integration (Mobizon/Twilio)
- [ ] Build email service (SendGrid/SMTP)
- [ ] Create notification templates
- [ ] Implement notification preferences
- [ ] Build notification queue with RabbitMQ
- [ ] Create scheduled notifications
- [ ] Add notification analytics

---

## 12. Support Service

### Description
Manages customer support tickets and live chat.

### Models
```
- SupportTicket (Id, UserId, OrderId, Subject, Status, Priority, AssignedToId, CreatedAt, UpdatedAt, ClosedAt)
- TicketMessage (Id, TicketId, SenderId, Message, AttachmentUrl, IsFromSupport, CreatedAt)
- FAQ (Id, CategoryId, Question, Answer, SortOrder, IsActive)
- FAQCategory (Id, Name, IconName, SortOrder)
- TicketStatus (enum: Open, InProgress, WaitingForCustomer, Resolved, Closed)
- TicketPriority (enum: Low, Medium, High, Urgent)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/faq` | Get FAQ |
| GET | `/api/support/faq/categories` | Get FAQ categories |
| POST | `/api/support/tickets` | Create ticket |
| GET | `/api/support/tickets` | Get user's tickets |
| GET | `/api/support/tickets/{id}` | Get ticket details |
| POST | `/api/support/tickets/{id}/messages` | Add message to ticket |
| PUT | `/api/support/tickets/{id}/close` | Close ticket |
| GET | `/api/admin/support/tickets` | Get all tickets (admin) |
| PUT | `/api/admin/support/tickets/{id}/assign` | Assign ticket (admin) |
| PUT | `/api/admin/support/tickets/{id}/status` | Update status (admin) |
| POST | `/api/admin/support/faq` | Create FAQ (admin) |

### Tasks
- [ ] Create ticket management system
- [ ] Implement real-time chat with SignalR
- [ ] Build ticket assignment
- [ ] Create FAQ management
- [ ] Add file attachments
- [ ] Implement ticket SLA tracking
- [ ] Build canned responses
- [ ] Create support analytics

---

## 13. Analytics & Reporting Service

### Description
Provides business analytics, reports, and dashboards for admin panel.

### Models
```
- DailyStats (Id, Date, TotalOrders, TotalRevenue, NewUsers, ActiveRentals)
- ToolStats (Id, ToolId, Date, Views, Rentals, Revenue)
- CourierStats (Id, CourierId, Date, Deliveries, Distance, Earnings, Rating)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics/dashboard` | Get dashboard stats |
| GET | `/api/admin/analytics/revenue` | Get revenue analytics |
| GET | `/api/admin/analytics/orders` | Get order analytics |
| GET | `/api/admin/analytics/users` | Get user analytics |
| GET | `/api/admin/analytics/tools` | Get tool performance |
| GET | `/api/admin/analytics/couriers` | Get courier performance |
| GET | `/api/admin/reports/orders` | Generate orders report |
| GET | `/api/admin/reports/revenue` | Generate revenue report |
| GET | `/api/admin/reports/inventory` | Generate inventory report |
| POST | `/api/admin/reports/export` | Export report (PDF/Excel) |

### Tasks
- [ ] Create analytics aggregation jobs
- [ ] Build dashboard API
- [ ] Implement revenue reports
- [ ] Create inventory reports
- [ ] Build courier performance reports
- [ ] Implement PDF report generation
- [ ] Create Excel export
- [ ] Add scheduled report emails
- [ ] Build real-time dashboard with SignalR

---

## 14. Admin Service

### Description
Administrative functions for system management.

### Models
```
- AdminUser (Id, UserId, Role, Permissions, LastLoginAt)
- AuditLog (Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, CreatedAt)
- SystemSetting (Id, Key, Value, Description, UpdatedAt)
- AdminRole (enum: SuperAdmin, Admin, Manager, Operator, Support)
```

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/{id}` | Get user details |
| PUT | `/api/admin/users/{id}/block` | Block/unblock user |
| GET | `/api/admin/admins` | Get admin users |
| POST | `/api/admin/admins` | Create admin user |
| PUT | `/api/admin/admins/{id}` | Update admin |
| DELETE | `/api/admin/admins/{id}` | Remove admin |
| GET | `/api/admin/settings` | Get system settings |
| PUT | `/api/admin/settings` | Update settings |
| GET | `/api/admin/audit-logs` | Get audit logs |
| POST | `/api/admin/promo-codes` | Create promo code |
| GET | `/api/admin/promo-codes` | Get promo codes |
| PUT | `/api/admin/promo-codes/{id}` | Update promo code |

### Tasks
- [ ] Create admin user management
- [ ] Implement role-based permissions
- [ ] Build audit logging system
- [ ] Create system settings management
- [ ] Implement promo code management
- [ ] Build admin activity tracking
- [ ] Create data export tools
- [ ] Implement system health monitoring

---

## 15. Integration Services

### Description
Third-party service integrations.

### Tasks
- [ ] **SMS Gateway**: Mobizon/Twilio integration for SMS
- [ ] **Email Service**: SendGrid/Mailgun for transactional emails
- [ ] **Payment Gateway**: Kaspi Pay, CloudPayments integration
- [ ] **Maps API**: 2GIS/Google Maps for geocoding and routing
- [ ] **Push Notifications**: Firebase FCM, Apple APNS
- [ ] **File Storage**: MinIO/AWS S3 for images and documents
- [ ] **Analytics**: Google Analytics, Mixpanel integration
- [ ] **Monitoring**: Sentry for error tracking
- [ ] **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## Infrastructure & DevOps Tasks

### Tasks
- [ ] Set up Docker containers for all services
- [ ] Create Docker Compose for local development
- [ ] Set up PostgreSQL with replication
- [ ] Configure Redis for caching and sessions
- [ ] Set up RabbitMQ for message queuing
- [ ] Configure Nginx as reverse proxy
- [ ] Implement CI/CD pipeline (GitHub Actions/GitLab CI)
- [ ] Set up staging and production environments
- [ ] Configure SSL certificates
- [ ] Implement database migrations strategy
- [ ] Set up automated backups
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up log aggregation
- [ ] Implement health checks
- [ ] Create API documentation (Swagger/OpenAPI)

---

## Database Schema Summary

### Core Tables
1. Users & Authentication (8 tables)
2. Catalog (6 tables)
3. Orders (5 tables)
4. Payments (4 tables)
5. Delivery (4 tables)
6. Courier (5 tables)
7. Reviews (4 tables)
8. Notifications (5 tables)
9. Support (5 tables)
10. Admin (4 tables)

### Estimated Total: ~50 tables

---

## API Response Standards

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [ ],
    "page": 1,
    "pageSize": 20,
    "totalCount": 100,
    "totalPages": 5
  }
}
```

---

## Security Checklist

- [ ] Implement HTTPS everywhere
- [ ] Set up CORS policies
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Implement SQL injection protection (parameterized queries)
- [ ] Add XSS protection
- [ ] Implement CSRF protection
- [ ] Set up API key authentication for external services
- [ ] Implement data encryption at rest
- [ ] Add PII data masking in logs
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement penetration testing
- [ ] Create security audit schedule

---

## Testing Strategy

- [ ] Unit tests for all services (xUnit)
- [ ] Integration tests for API endpoints
- [ ] Load testing with k6/JMeter
- [ ] End-to-end testing
- [ ] Security testing
- [ ] Performance benchmarking

---

## Project Structure (Clean Architecture)

```
iRent.Backend/
├── src/
│   ├── iRent.Domain/              # Entities, Enums, Interfaces
│   ├── iRent.Application/         # Use Cases, DTOs, Validators
│   ├── iRent.Infrastructure/      # EF Core, External Services
│   ├── iRent.API/                 # Controllers, Middleware
│   └── iRent.Shared/              # Common utilities
├── tests/
│   ├── iRent.UnitTests/
│   ├── iRent.IntegrationTests/
│   └── iRent.E2ETests/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/
    ├── api/
    └── architecture/
```

---

## Priority Order

### Phase 1 - MVP (Core Functionality)
1. Authentication Service
2. User Management Service
3. Catalog Service
4. Cart Service
5. Order Service
6. Payment Service

### Phase 2 - Operations
7. Delivery Service
8. Courier Service
9. Notification Service

### Phase 3 - Enhancement
10. Review & Rating Service
11. Support Service
12. Favorites Service

### Phase 4 - Analytics & Admin
13. Analytics & Reporting Service
14. Admin Service
15. Integration Services

---

*Last Updated: December 2024*
