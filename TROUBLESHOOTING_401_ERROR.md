# 🔧 Fixing the 401 Unauthorized Error

## Error Encountered
```
api/auth/register/check-employee:1  Failed to load resource: 
the server responded with a status of 401 (Unauthorized)
```

## Root Cause
The Business Central SOAP endpoint is rejecting the authentication request. This is a server-side authentication failure, not a client-side issue.

## Debugging Steps

### 1. Test SOAP Endpoint
Visit this URL in your browser to test the SOAP connection:
```
http://localhost:3001/api/auth/register/test-soap
```

**Expected Response:**
```json
{
  "success": false,  // The endpoint might not exist, but auth should pass
  "status": 401,     // or 500, but NOT 401 if server is accessible
  "statusText": "Unauthorized",
  "message": "SOAP request failed"
}
```

If you get `status: 401`, the problem is authentication.
If you get a network error, the problem is the endpoint URL or server is down.

### 2. Check Credentials
Verify the credentials are correct in `/app/api/auth/register/check-employee/route.ts`:
```typescript
const AUTH_USERNAME = 'WEBUSER';
const AUTH_PASSWORD = 'Pass@123!$';
```

**Common issues:**
- [ ] Wrong username (should be `WEBUSER`)
- [ ] Wrong password (should be `Pass@123!$`)
- [ ] Missing special character `!` in password
- [ ] Extra spaces in credentials

### 3. Check SOAP Endpoint URL
Verify the endpoint is correct:
```
http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI
```

**Check each part:**
- [ ] IP address: `41.216.68.50` - correct?
- [ ] Port: `7247` - correct?
- [ ] Instance: `BusinessCentral142` - matches your BC instance?
- [ ] Company: `Mulonga%20Water%20Supply` - correct (URL encoded)?
- [ ] Codeunit: `WebAPI` - correct?

### 4. Check if Business Central is Running
The server might be down. Try:
1. Open `http://41.216.68.50:7247` in browser
2. You should see a Business Central login or error page
3. If page doesn't load, the server is down or unreachable

### 5. Verify SOAP WebService is Published
Business Central might not have the WebAPI codeunit published as a web service.

**To fix in Business Central:**
1. Open Business Central
2. Search for "Web Services"
3. Look for `WebAPI` codeunit
4. Verify it's published (check is marked)
5. Verify "Published" column shows "Yes"

### 6. Check Server Logs
On the Business Central server, check logs for authentication errors:
- Event Viewer (Windows)
- Application Insights (if configured)
- Business Central Application Log

## Solutions

### Solution 1: Credentials Might Be Wrong
Try test with curl in terminal:
```bash
curl -u WEBUSER:Pass@123!$ -H "Content-Type: text/xml;charset=UTF-8" \
  -H "SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:EmployeeExist" \
  -d @body.xml \
  "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI"
```

**Note:** The password contains special characters. Make sure they're properly escaped.

### Solution 2: Endpoint URL Might Be Wrong
Confirm with IT or BC administrator:
- Correct IP/hostname for BC server
- Correct port (usually 7247 or 8080)
- Correct instance name
- Correct company name (URL encoded)

### Solution 3: SOAP Web Service Not Published
Contact BC administrator to:
1. Open Business Central
2. Search for "Web Services"
3. Find and enable `WebAPI` codeunit
4. Publish the web service

### Solution 4: Authentication Method
Some BC instances use different auth. If the above don't work:
- Ask administrator if they support Basic Auth
- Some use OAuth or other methods
- Check Business Central documentation

## How to Monitor
After fixing, watch the terminal logs:
```
📍 URL: http://41.216.68.50:7247/...
📌 Method: POST
📋 Headers:
   • Authorization: Basic [REDACTED]
   • Content-Type: text/xml;charset=UTF-8
   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:EmployeeExist
✅ Status: 200 OK
```

Status should be `200 OK`, not `401 Unauthorized`.

## Success Indicators
When fixed, you should see:
1. ✅ Register page loads
2. ✅ Enter employee number & phone
3. ✅ Click Continue
4. ✅ Terminal shows `✅ Status: 200 OK`
5. ✅ OTP sent to phone
6. ✅ Redirected to OTP verification page

## Contact
If still having issues:
1. Test SOAP endpoint: `/api/auth/register/test-soap`
2. Share the response and error details
3. Check with BC administrator about SOAP configuration

---

**Files Modified:**
- `/app/register/page.tsx` - Fixed UI components and toast imports
- `/app/api/auth/register/check-employee/route.ts` - Optimized SOAP formatting
- `/app/api/auth/register/test-soap/route.ts` - NEW: Test endpoint for debugging

**Next Steps:**
1. Visit `/api/auth/register/test-soap` to test connectivity
2. Check credentials and endpoint URL
3. Verify SOAP web service is published in BC
4. Monitor terminal logs for SOAP responses
