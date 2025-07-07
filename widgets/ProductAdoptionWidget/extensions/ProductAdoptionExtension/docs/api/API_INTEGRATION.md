# ProductAdoption API Integration Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [WebSocket Events](#websocket-events)
6. [Rate Limiting](#rate-limiting)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)
9. [Best Practices](#best-practices)
10. [API Changelog](#api-changelog)

## Overview

The ProductAdoption API provides programmatic access to create, manage, and analyze product tours. This RESTful API uses JSON for request and response bodies and follows standard HTTP conventions.

### Base URLs

```
Production: https://api.productadoption.com/v1
Staging: https://staging-api.productadoption.com/v1
Development: http://localhost:3000/api/v1
```

### API Versioning

The API version is included in the URL path. When breaking changes are introduced, a new version will be released while maintaining backward compatibility for previous versions.

Current version: `v1`

### Request Format

```http
POST /api/v1/tours
Host: api.productadoption.com
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "name": "Getting Started Tour",
  "url_pattern": "https://app.example.com/*"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "tour_abc123",
    "name": "Getting Started Tour",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "request_id": "req_xyz789",
    "version": "v1"
  }
}
```

## Authentication

### OAuth 2.0 Flow

ProductAdoption uses OAuth 2.0 for authentication. Extensions should use the Authorization Code flow with PKCE.

#### 1. Authorization Request

```http
GET https://app.productadoption.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://YOUR_REDIRECT_URI&
  response_type=code&
  scope=tours:write analytics:read&
  state=RANDOM_STATE&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

#### 2. Authorization Response

```
https://YOUR_REDIRECT_URI?
  code=AUTHORIZATION_CODE&
  state=RANDOM_STATE
```

#### 3. Token Exchange

```http
POST https://api.productadoption.com/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "https://YOUR_REDIRECT_URI",
  "client_id": "YOUR_CLIENT_ID",
  "code_verifier": "CODE_VERIFIER"
}
```

#### 4. Token Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_abc123",
  "scope": "tours:write analytics:read"
}
```

### API Key Authentication (Legacy)

For backward compatibility, API keys are still supported but deprecated:

```http
GET /api/v1/tours
X-API-Key: your_api_key_here
```

### Scopes

| Scope | Description |
|-------|-------------|
| `tours:read` | Read tour data |
| `tours:write` | Create and modify tours |
| `tours:delete` | Delete tours |
| `analytics:read` | View analytics data |
| `analytics:write` | Track custom events |
| `users:read` | Access user information |
| `teams:manage` | Manage team settings |

### Token Refresh

```http
POST https://api.productadoption.com/oauth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "refresh_token": "refresh_token_abc123",
  "client_id": "YOUR_CLIENT_ID"
}
```

## API Endpoints

### Tours

#### List Tours

```http
GET /api/v1/tours
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (draft, published, archived)
- `search` (string): Search in tour names and descriptions
- `sort` (string): Sort field (created_at, updated_at, name)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tour_abc123",
      "name": "Getting Started Tour",
      "status": "published",
      "url_pattern": "https://app.example.com/*",
      "created_at": "2024-01-15T10:30:00Z",
      "stats": {
        "views": 1523,
        "completions": 892
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Tour

```http
GET /api/v1/tours/{tour_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tour_abc123",
    "name": "Getting Started Tour",
    "description": "Introduction to our product",
    "status": "published",
    "url_pattern": "https://app.example.com/*",
    "theme": {
      "primaryColor": "#007bff",
      "backgroundColor": "#ffffff"
    },
    "settings": {
      "autoStart": false,
      "showOnce": true
    },
    "steps": [
      {
        "id": "step_1",
        "order": 1,
        "target": {
          "selector": "#welcome-button",
          "position": "bottom"
        },
        "content": {
          "title": "Welcome!",
          "description": "Click here to get started"
        }
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

#### Create Tour

```http
POST /api/v1/tours
Content-Type: application/json

{
  "name": "New Feature Tour",
  "description": "Showcase our latest features",
  "url_pattern": "https://app.example.com/dashboard/*",
  "theme": {
    "primaryColor": "#28a745"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tour_def456",
    "name": "New Feature Tour",
    "status": "draft",
    "created_at": "2024-01-25T09:15:00Z"
  }
}
```

#### Update Tour

```http
PATCH /api/v1/tours/{tour_id}
Content-Type: application/json

{
  "name": "Updated Tour Name",
  "status": "published"
}
```

#### Delete Tour

```http
DELETE /api/v1/tours/{tour_id}
```

#### Duplicate Tour

```http
POST /api/v1/tours/{tour_id}/duplicate
Content-Type: application/json

{
  "name": "Copy of Original Tour"
}
```

### Tour Steps

#### List Steps

```http
GET /api/v1/tours/{tour_id}/steps
```

#### Add Step

```http
POST /api/v1/tours/{tour_id}/steps
Content-Type: application/json

{
  "target": {
    "selector": "#feature-button",
    "position": "top"
  },
  "content": {
    "title": "New Feature",
    "description": "Click here to try our new feature"
  },
  "order": 2
}
```

#### Update Step

```http
PATCH /api/v1/tours/{tour_id}/steps/{step_id}
Content-Type: application/json

{
  "content": {
    "title": "Updated Title"
  }
}
```

#### Delete Step

```http
DELETE /api/v1/tours/{tour_id}/steps/{step_id}
```

#### Reorder Steps

```http
POST /api/v1/tours/{tour_id}/steps/reorder
Content-Type: application/json

{
  "steps": [
    { "id": "step_3", "order": 1 },
    { "id": "step_1", "order": 2 },
    { "id": "step_2", "order": 3 }
  ]
}
```

### Analytics

#### Tour Analytics

```http
GET /api/v1/analytics/tours/{tour_id}?
  start_date=2024-01-01&
  end_date=2024-01-31&
  granularity=day
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_views": 5234,
      "total_completions": 3121,
      "completion_rate": 0.596,
      "avg_completion_time": 45.2
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "views": 156,
        "completions": 89
      }
    ],
    "steps": [
      {
        "step_id": "step_1",
        "views": 5234,
        "exits": 423,
        "exit_rate": 0.081
      }
    ]
  }
}
```

#### Track Event

```http
POST /api/v1/analytics/events
Content-Type: application/json

{
  "event": "tour_started",
  "tour_id": "tour_abc123",
  "properties": {
    "url": "https://app.example.com/dashboard",
    "user_agent": "Mozilla/5.0..."
  },
  "timestamp": "2024-01-25T10:30:00Z"
}
```

#### Export Analytics

```http
POST /api/v1/analytics/export
Content-Type: application/json

{
  "tour_ids": ["tour_abc123", "tour_def456"],
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "csv"
}
```

### User Management

#### Get Current User

```http
GET /api/v1/user
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "team": {
      "id": "team_456",
      "name": "Acme Corp"
    },
    "permissions": [
      "tours:write",
      "analytics:read"
    ]
  }
}
```

#### Update User Settings

```http
PATCH /api/v1/user/settings
Content-Type: application/json

{
  "notifications": {
    "email": true,
    "tour_completed": false
  },
  "default_theme": "dark"
}
```

### Team Management

#### Get Team

```http
GET /api/v1/teams/{team_id}
```

#### List Team Members

```http
GET /api/v1/teams/{team_id}/members
```

#### Invite Team Member

```http
POST /api/v1/teams/{team_id}/invitations
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "editor",
  "permissions": ["tours:write", "analytics:read"]
}
```

### Webhooks

#### List Webhooks

```http
GET /api/v1/webhooks
```

#### Create Webhook

```http
POST /api/v1/webhooks
Content-Type: application/json

{
  "url": "https://app.example.com/webhooks/productadoption",
  "events": ["tour.completed", "tour.published"],
  "secret": "webhook_secret_123"
}
```

#### Update Webhook

```http
PATCH /api/v1/webhooks/{webhook_id}
```

#### Delete Webhook

```http
DELETE /api/v1/webhooks/{webhook_id}
```

## Data Models

### Tour Object

```typescript
interface Tour {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  url_pattern: string;
  theme: TourTheme;
  settings: TourSettings;
  steps: TourStep[];
  triggers: TourTrigger[];
  targeting: TourTargeting;
  analytics?: TourAnalytics;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface TourTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily?: string;
  customCSS?: string;
}

interface TourSettings {
  autoStart: boolean;
  showOnce: boolean;
  keyboard: boolean;
  exitOnEsc: boolean;
  overlayOpacity: number;
  scrollPadding: number;
  animationDuration: number;
}

interface TourStep {
  id: string;
  order: number;
  target: StepTarget;
  content: StepContent;
  behavior: StepBehavior;
  conditions?: StepCondition[];
}

interface StepTarget {
  selector: string;
  fallbackSelectors?: string[];
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
}

interface StepContent {
  title: string;
  description?: string;
  image?: string;
  video?: string;
  buttons: StepButton[];
}

interface StepButton {
  text: string;
  action: 'next' | 'prev' | 'skip' | 'close' | 'custom';
  primary?: boolean;
  customAction?: string;
}

interface StepBehavior {
  delay?: number;
  highlight: boolean;
  scrollTo: boolean;
  waitFor?: string;
  autoAdvance?: number;
}

interface StepCondition {
  type: 'element_exists' | 'element_text' | 'url_match' | 'custom';
  value: string;
  operator?: 'equals' | 'contains' | 'matches';
}

interface TourTrigger {
  type: 'pageLoad' | 'click' | 'hover' | 'scroll' | 'time' | 'custom';
  value?: string;
  delay?: number;
}

interface TourTargeting {
  segments?: string[];
  conditions?: TargetingCondition[];
  percentage?: number;
}

interface TargetingCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}
```

### Analytics Event

```typescript
interface AnalyticsEvent {
  id: string;
  event: string;
  tour_id?: string;
  step_id?: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  timestamp: string;
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta: {
    request_id: string;
    timestamp: string;
  };
}
```

## WebSocket Events

Connect to real-time updates:

```javascript
const ws = new WebSocket('wss://api.productadoption.com/v1/websocket');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_ACCESS_TOKEN'
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  console.log('Event:', event);
});
```

### Event Types

#### Tour Events
- `tour.created` - New tour created
- `tour.updated` - Tour modified
- `tour.deleted` - Tour removed
- `tour.published` - Tour status changed to published
- `tour.archived` - Tour archived

#### Analytics Events
- `tour.started` - User started tour
- `tour.completed` - User completed tour
- `tour.skipped` - User skipped tour
- `step.viewed` - Step displayed
- `step.interacted` - User interacted with step

#### Collaboration Events
- `tour.locked` - Tour locked for editing
- `tour.unlocked` - Tour unlocked
- `comment.added` - Comment added to tour
- `member.joined` - Team member joined

### Event Format

```json
{
  "type": "tour.updated",
  "data": {
    "tour_id": "tour_abc123",
    "changes": ["name", "steps"],
    "user_id": "user_456"
  },
  "timestamp": "2024-01-25T10:30:00Z"
}
```

## Rate Limiting

API requests are rate limited to ensure fair usage:

### Limits

| Plan | Requests per minute | Requests per hour |
|------|-------------------|-------------------|
| Free | 60 | 1,000 |
| Starter | 300 | 10,000 |
| Growth | 600 | 50,000 |
| Enterprise | Custom | Custom |

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706175600
X-RateLimit-Retry-After: 42
```

### Handling Rate Limits

```javascript
async function makeAPIRequest(url, options) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('X-RateLimit-Retry-After');
    await sleep(retryAfter * 1000);
    return makeAPIRequest(url, options);
  }
  
  return response;
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `auth_failed` | Authentication failed |
| `invalid_token` | Token is invalid or expired |
| `insufficient_permissions` | Missing required permissions |
| `resource_not_found` | Requested resource doesn't exist |
| `validation_error` | Request validation failed |
| `duplicate_resource` | Resource already exists |
| `rate_limit_exceeded` | Too many requests |
| `internal_error` | Server error occurred |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid tour configuration",
    "details": {
      "fields": {
        "name": "Tour name is required",
        "url_pattern": "Invalid URL pattern"
      }
    }
  },
  "meta": {
    "request_id": "req_xyz789",
    "timestamp": "2024-01-25T10:30:00Z"
  }
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

class ProductAdoptionClient {
  private baseURL = 'https://api.productadoption.com/v1';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        data
      });
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error?.message || error.message);
      }
      throw error;
    }
  }

  async createTour(tour: Partial<Tour>): Promise<Tour> {
    return this.request<Tour>('POST', '/tours', tour);
  }

  async getTour(tourId: string): Promise<Tour> {
    return this.request<Tour>('GET', `/tours/${tourId}`);
  }

  async updateTour(tourId: string, updates: Partial<Tour>): Promise<Tour> {
    return this.request<Tour>('PATCH', `/tours/${tourId}`, updates);
  }

  async addStep(tourId: string, step: Partial<TourStep>): Promise<TourStep> {
    return this.request<TourStep>('POST', `/tours/${tourId}/steps`, step);
  }
}

// Usage
const client = new ProductAdoptionClient('your_access_token');

async function createGettingStartedTour() {
  const tour = await client.createTour({
    name: 'Getting Started',
    url_pattern: 'https://app.example.com/dashboard',
    theme: {
      primaryColor: '#007bff'
    }
  });

  await client.addStep(tour.id, {
    target: {
      selector: '#welcome-banner',
      position: 'bottom'
    },
    content: {
      title: 'Welcome to Our App!',
      description: 'Let us show you around.',
      buttons: [
        { text: 'Next', action: 'next', primary: true }
      ]
    }
  });

  return tour;
}
```

### Python

```python
import requests
from typing import Dict, Any, Optional

class ProductAdoptionClient:
    def __init__(self, token: str):
        self.base_url = "https://api.productadoption.com/v1"
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, json=data)
        
        if response.status_code >= 400:
            error_data = response.json()
            raise Exception(error_data["error"]["message"])
        
        return response.json()["data"]
    
    def create_tour(self, tour_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request("POST", "/tours", tour_data)
    
    def get_tour(self, tour_id: str) -> Dict[str, Any]:
        return self._request("GET", f"/tours/{tour_id}")
    
    def add_step(self, tour_id: str, step_data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request("POST", f"/tours/{tour_id}/steps", step_data)

# Usage
client = ProductAdoptionClient("your_access_token")

tour = client.create_tour({
    "name": "Python SDK Tour",
    "url_pattern": "https://app.example.com/*"
})

step = client.add_step(tour["id"], {
    "target": {
        "selector": "#main-feature",
        "position": "right"
    },
    "content": {
        "title": "Main Feature",
        "description": "This is our main feature"
    }
})
```

### cURL Examples

```bash
# Create a tour
curl -X POST https://api.productadoption.com/v1/tours \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CLI Tour",
    "url_pattern": "https://app.example.com/*"
  }'

# Get tour analytics
curl -X GET "https://api.productadoption.com/v1/analytics/tours/tour_abc123?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Update tour status
curl -X PATCH https://api.productadoption.com/v1/tours/tour_abc123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'
```

## Best Practices

### 1. Authentication

- Store tokens securely (never in code)
- Implement token refresh logic
- Use appropriate OAuth scopes
- Rotate API keys regularly

### 2. Error Handling

```javascript
class APIError extends Error {
  constructor(public code: string, public details?: any) {
    super(`API Error: ${code}`);
  }
}

async function apiCall(fn: () => Promise<any>) {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 401) {
      // Refresh token and retry
      await refreshToken();
      return await fn();
    }
    
    if (error.response?.status === 429) {
      // Handle rate limiting
      const retryAfter = error.response.headers['x-ratelimit-retry-after'];
      await sleep(retryAfter * 1000);
      return await fn();
    }
    
    throw new APIError(
      error.response?.data?.error?.code || 'unknown',
      error.response?.data?.error?.details
    );
  }
}
```

### 3. Pagination

```javascript
async function getAllTours() {
  const tours = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await client.get('/tours', {
      params: { page, limit: 100 }
    });
    
    tours.push(...response.data.data);
    hasMore = page < response.data.meta.pages;
    page++;
  }
  
  return tours;
}
```

### 4. Caching

```javascript
class CachedAPIClient {
  private cache = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  async getTour(tourId: string, skipCache = false) {
    const cacheKey = `tour:${tourId}`;
    
    if (!skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
    }
    
    const tour = await this.api.getTour(tourId);
    
    this.cache.set(cacheKey, {
      data: tour,
      expires: Date.now() + this.cacheTTL
    });
    
    return tour;
  }
}
```

### 5. Webhooks

```javascript
// Webhook endpoint
app.post('/webhooks/productadoption', (req, res) => {
  const signature = req.headers['x-productadoption-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const { type, data } = req.body;
  
  switch (type) {
    case 'tour.completed':
      handleTourCompleted(data);
      break;
    case 'tour.skipped':
      handleTourSkipped(data);
      break;
  }
  
  res.status(200).send('OK');
});
```

### 6. Batch Operations

```javascript
// Batch create steps
async function createMultipleSteps(tourId: string, steps: StepData[]) {
  const operations = steps.map((step, index) => ({
    method: 'POST',
    url: `/tours/${tourId}/steps`,
    body: { ...step, order: index + 1 }
  }));
  
  const response = await client.post('/batch', { operations });
  return response.data.results;
}
```

## API Changelog

### Version 1.2.0 (2024-01-15)
- Added WebSocket support for real-time updates
- New endpoint: `/api/v1/tours/{id}/duplicate`
- Added `customCSS` field to tour themes
- Improved error messages with field-level validation

### Version 1.1.0 (2023-11-01)
- Added batch operations endpoint
- New analytics export functionality
- Support for conditional tour steps
- Added webhook management endpoints

### Version 1.0.0 (2023-09-01)
- Initial API release
- Basic CRUD operations for tours
- Analytics endpoints
- OAuth 2.0 authentication

---

*For the latest updates and announcements, visit [status.productadoption.com](https://status.productadoption.com)*