# Implementation Plan

- [x] 1. Add Edit and Delete action buttons to proposals table
  - Add Edit and Delete buttons in the Actions column of the proposals table in MaquinasVirtuaisCalculator.tsx
  - Implement click handlers for both buttons
  - Add proper icons and styling for the action buttons
  - _Requirements: 1.1, 2.1_

- [x] 2. Create delete confirmation modal
  - Implement a confirmation dialog component for proposal deletion
  - Add warning message about permanent deletion
  - Include proposal details in confirmation dialog
  - Handle user confirmation and cancellation actions
  - _Requirements: 2.1, 2.2_

- [ ] 3. Implement proposal deletion functionality
  - Create DELETE API endpoint in /api/proposals/[id]/route.ts
  - Add proper authorization checks for deletion
  - Implement soft delete or hard delete based on business requirements
  - Update frontend to call delete API and refresh proposals list
  - _Requirements: 2.2, 2.3, 5.2_

- [ ] 4. Create proposal edit mode interface
  - Modify MaquinasVirtuaisCalculator to support edit mode for existing proposals
  - Load existing proposal data into the calculator form
  - Add visual indicators to show the proposal is being edited
  - Implement navigation between view and edit modes
  - _Requirements: 1.1, 1.2_

- [ ] 5. Add discount application system to product editing
  - Create discount input fields for each product in the proposal
  - Implement percentage and fixed value discount options
  - Add discount reason/notes field for each applied discount
  - Validate discount limits and business rules
  - _Requirements: 3.1, 3.2_

- [ ] 6. Implement automatic total recalculation with discounts
  - Update calculation logic to include product-level discounts
  - Recalculate totals automatically when discounts are applied or modified
  - Display original price, discount amount, and final price for each product
  - Update overall proposal totals including setup and monthly costs
  - _Requirements: 3.2, 3.3_

- [ ] 7. Create negotiation rounds data structure and API
  - Update Proposal interface to include currentRound and negotiationRounds fields
  - Create NegotiationRound interface with discount tracking
  - Implement API endpoints for managing negotiation rounds
  - Add database schema for storing negotiation rounds history
  - _Requirements: 1.4, 4.1, 5.4_

- [ ] 8. Implement negotiation rounds creation on proposal save
  - Modify proposal save logic to create new negotiation rounds
  - Increment round number when saving edited proposals
  - Store previous round data before creating new round
  - Add metadata like created_by and timestamps to rounds
  - _Requirements: 1.3, 1.4, 3.3_

- [ ] 9. Create negotiation rounds history viewer
  - Build component to display all negotiation rounds for a proposal
  - Show round number, date, user, and summary of changes
  - Implement round comparison functionality to highlight differences
  - Add ability to view detailed information for each round
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. Add data validation and error handling for edit operations
  - Validate all proposal data before saving edits
  - Check for concurrent edits by other users
  - Implement rollback mechanism for failed operations
  - Add comprehensive error messages for validation failures
  - _Requirements: 5.1, 5.3_

- [ ] 11. Update proposal list to show current round information
  - Display current round number in the proposals table
  - Add visual indicators for proposals with multiple rounds
  - Show last modified date and user information
  - Update sorting and filtering to work with round information
  - _Requirements: 4.1_

- [ ] 12. Test edit, delete, and negotiation functionality
  - Create test cases for all edit scenarios including discount application
  - Test deletion with various user permissions and proposal states
  - Verify negotiation rounds are created and stored correctly
  - Test error handling and edge cases for all new functionality
  - _Requirements: 1.1, 1.2, 2.2, 3.1, 3.2, 4.1_