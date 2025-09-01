# Design Document

## Overview

The proposal saving error occurs due to a mismatch between the data structure sent from the frontend (MaquinasVirtuaisCalculator component) and what the backend API expects. The error "Erro na resposta da API: {}" indicates that the API is returning an empty response object, which suggests the request is failing validation or encountering an error that isn't being properly handled.

### Root Cause Analysis

After examining the code, I identified several issues:

1. **Data Structure Mismatch**: The frontend sends `client`, `accountManager`, and `products` but the backend expects `client_data`, `account_manager_data`, and `products`
2. **Missing Error Handling**: The frontend doesn't properly handle API error responses
3. **Inconsistent Property Names**: The Proposal interface has both `client`/`clientData` and `accountManager`/`accountManagerData` properties
4. **Validation Issues**: The backend validation checks for `client_data` but the frontend sends `client`

## Architecture

The solution involves fixing the data flow between the frontend calculator component and the backend API:

```
Frontend (MaquinasVirtuaisCalculator) 
    ↓ (sends proposal data)
API Route (/api/proposals) 
    ↓ (validates and processes)
Database (PostgreSQL)
```

## Components and Interfaces

### 1. Frontend Component Updates

**MaquinasVirtuaisCalculator.tsx**
- Fix the `saveProposal` function to send correctly formatted data
- Improve error handling and user feedback
- Add proper validation before API calls
- Enhance logging for debugging

### 2. API Route Improvements

**route.ts (/api/proposals)**
- Improve error response formatting
- Add better validation error messages
- Ensure consistent error handling
- Add request/response logging

### 3. Type Definitions

**types/index.ts**
- Standardize the Proposal interface
- Remove duplicate properties
- Ensure consistency between frontend and backend

## Data Models

### Proposal Data Structure (Standardized)

```typescript
interface ProposalData {
  id: string;
  client_data: ClientData;
  account_manager_data: AccountManagerData;
  products: ProposalItem[];
  total_setup: number;
  total_monthly: number;
  status: string;
  type: string;
  proposal_number: string;
  created_at: string;
  user_id: string;
  user_email: string;
}
```

### API Request/Response Format

**Request Body:**
```json
{
  "id": "prop_123456789",
  "client_data": { "name": "...", "email": "...", "phone": "..." },
  "account_manager_data": { "name": "...", "email": "...", "phone": "..." },
  "products": [...],
  "total_setup": 0,
  "total_monthly": 1500.00,
  "status": "Salva",
  "type": "VM",
  "proposal_number": "Prop_MV_0001/2025"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Proposta salva com sucesso",
  "proposalId": "prop_123456789"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Detailed error message",
  "details": "Additional error context"
}
```

## Error Handling

### Frontend Error Handling Strategy

1. **Pre-submission Validation**
   - Validate required fields before API call
   - Check data format and types
   - Provide immediate feedback for validation errors

2. **API Error Handling**
   - Parse error responses properly
   - Display meaningful error messages to users
   - Log detailed error information for debugging
   - Handle network connectivity issues

3. **User Feedback**
   - Show loading states during API calls
   - Display success/error messages clearly
   - Provide actionable error messages

### Backend Error Handling Strategy

1. **Request Validation**
   - Validate all required fields
   - Check data types and formats
   - Return specific validation error messages

2. **Database Error Handling**
   - Handle connection issues
   - Manage constraint violations
   - Provide meaningful error responses

3. **Response Formatting**
   - Consistent error response structure
   - Include error codes and messages
   - Add debugging information in development

## Testing Strategy

### Unit Tests
- Test data transformation functions
- Validate error handling logic
- Test API request/response parsing

### Integration Tests
- Test complete proposal saving flow
- Verify error scenarios
- Test data persistence

### Manual Testing
- Test various error scenarios
- Verify user experience improvements
- Test with different data combinations

## Implementation Approach

### Phase 1: Data Structure Fix
1. Standardize the data structure between frontend and backend
2. Update the saveProposal function to send correct field names
3. Fix the Proposal interface inconsistencies

### Phase 2: Error Handling Enhancement
1. Improve frontend error handling and user feedback
2. Enhance backend error responses
3. Add comprehensive logging

### Phase 3: Validation Improvements
1. Add client-side validation
2. Improve server-side validation
3. Add proper error messages for validation failures

### Phase 4: Testing and Refinement
1. Test all error scenarios
2. Verify user experience improvements
3. Add monitoring and logging