# Testing Tools & Development Utilities

## Overview

A development-only page and API for managing test credentials and viewing registered employees in the HRMS system. This is strictly for development, QA, and testing purposes.

## ⚠️ SECURITY WARNING

**This feature should NEVER be accessible in production.** The endpoint automatically blocks access when `NODE_ENV=production`.

## Features

### 1. Testing Tools Page
**URL:** `/dashboard/testing-tools`

A simple, user-friendly interface to:
- View all registered test employees
- See their test credentials (employee number, name, email, password)
- Copy credentials to clipboard for quick login testing
- Refresh the list

### 2. Registered Users API
**Endpoint:** `GET /api/testing/registered-users`

Returns JSON array of test users with their credentials:
```json
{
  "success": true,
  "users": [
    {
      "employee_number": "M1174",
      "full_name": "Shanda Kabamba",
      "email": "shanda@mulongawater.com",
      "test_password": "TestPass123!"
    }
  ],
  "note": "DEVELOPMENT ONLY - Test credentials for development and QA testing",
  "warning": "Never expose this endpoint or these credentials in production"
}
```

## How to Use

### 1. Access the Testing Tools Page

1. Log in to the dashboard (or use any valid credentials)
2. Navigate to: `/dashboard/testing-tools`
3. View all registered test employees

### 2. Copy Test Credentials

1. Find the employee you want to test with
2. Click the "Copy" button next to their password
3. The password is copied to your clipboard
4. Go to `/login` and enter the credentials

### 3. Login and Test

1. Employee Number: `M1174`
2. Password: `TestPass123!` (copied from the testing tools page)
3. Click Login
4. You're now logged in as that employee

## Test Users Available

| Employee Number | Name | Email | Password |
|---|---|---|---|
| M1174 | Shanda Kabamba | shanda@mulongawater.com | TestPass123! |
| M1495 | Test User | test@mulongawater.com | TestPass123! |
| M1001 | John Smith | john@mulongawater.com | TestPass123! |

## Security Implementation

### 1. Production Block
The API endpoint automatically blocks in production:
```typescript
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'This endpoint is not available' }, { status: 404 });
}
```

### 2. Environment-Based Protection
- Development: ✅ Accessible
- Production: ❌ Returns 404

### 3. Optional API Key Authentication
Add `TESTING_API_KEY` environment variable for additional security:
```bash
TESTING_API_KEY=your-secret-key
```

Then call the API with:
```
Authorization: Bearer your-secret-key
```

## Real Password Storage

**Important:** This system does NOT store user passwords in the React/Next.js database.

Instead:
- User passwords are stored securely in **Business Central (ERP system)**
- Passwords are verified via SOAP API calls
- No passwords are stored in plain text anywhere
- Test passwords shown here are only for development testing

## Configuration

### Environment Variables

```bash
# .env.local or .env
NODE_ENV=development  # Must be 'development' for testing tools to work

# Optional: Protect API with a key
TESTING_API_KEY=your-secret-testing-key
```

## Adding More Test Users

To add more test users, edit `app/api/testing/registered-users/route.ts`:

```typescript
const TEST_USERS = [
  {
    employee_number: 'M1234',
    full_name: 'New Test User',
    email: 'newtest@mulongawater.com',
    test_password: 'TestPass123!',
  },
  // ... add more users
];
```

## Testing Workflow

1. **Developer needs to test login:** → Go to Testing Tools page
2. **Copy test credentials** → Click "Copy" button
3. **Go to login page** → `/login`
4. **Enter credentials** → Paste employee number and password
5. **Test functionality** → Browse dashboard, create requests, etc.
6. **Switch users** → Return to Testing Tools, copy different credentials, logout and login again

## Disabling for Production

### Option 1: Environment Check (Current)
The code already checks `NODE_ENV === 'production'` and blocks access.

### Option 2: Remove the Page Entirely
Delete `/dashboard/testing-tools` directory for production builds.

### Option 3: Behind Authentication
Add admin-only middleware before the page:
```typescript
// In app/dashboard/testing-tools/layout.tsx or page.tsx
import { requireAdmin } from '@/lib/auth-middleware';

export const metadata = {
  title: 'Testing Tools - Admin Only'
};

// Wrapper component
export default function TestingToolsLayout({ children }) {
  const user = await getSession();
  if (!user.isAdmin) {
    redirect('/login');
  }
  return children;
}
```

## Best Practices

✅ **DO:**
- Use this for QA and testing
- Change test passwords regularly
- Document which employee accounts are test accounts
- Keep test passwords simple (for testing only)
- Test across all user roles

❌ **DON'T:**
- Use in production
- Share test credentials outside dev team
- Use real employee passwords
- Store actual user data here
- Deploy to production with this enabled

## Troubleshooting

### Page returns 404
- Check if `NODE_ENV=production`
- Switch to `NODE_ENV=development`
- Restart the development server

### API returns 404
- Verify `NODE_ENV=development`
- Check browser console for errors
- Verify the endpoint URL: `/api/testing/registered-users`

### Can't copy password
- Check browser clipboard permissions
- Try right-click copy instead
- Check browser console for JS errors

## Future Enhancements

1. **Database Integration:**
   - Store test users in a separate database table
   - Dynamically add/remove test users from UI
   - Track login history

2. **Enhanced Features:**
   - Generate random test passwords
   - Test multiple user roles
   - Test permission scenarios
   - Test approval workflows with multiple users

3. **Security:**
   - Require authentication to access
   - Log all access to testing endpoint
   - Encrypt test passwords in storage
   - Require VPN or IP whitelist

4. **Integration:**
   - Sync with actual employee database
   - Real-time employee status
   - Test account lifecycle management

## Files Created

- `app/dashboard/testing-tools/page.tsx` - Testing tools UI page
- `app/api/testing/registered-users/route.ts` - API endpoint for test users
- `lib/testing-auth.ts` - Helper functions for testing security

## Support

For issues or improvements:
1. Check environment variables
2. Verify `NODE_ENV` setting
3. Check browser console for errors
4. Review endpoint URL and API response
5. Clear cache and restart development server

---

**Remember:** This is for development and testing only. Never use in production environments.
