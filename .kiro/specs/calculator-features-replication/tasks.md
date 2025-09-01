# Implementation Plan

- [x] 1. Create shared components for reusable functionality
  - Extract common components from MaquinasVirtuaisCalculator
  - Create reusable ProposalActions, NegotiationRounds, ProposalViewer components
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 1.1 Extract ProposalActions component
  - Create shared/ProposalActions.tsx with Edit, Delete, View buttons
  - Implement proper TypeScript interfaces for props
  - Add consistent styling matching MaquinasVirtuaisCalculator
  - _Requirements: 2.1, 2.2, 5.4_

- [x] 1.2 Extract NegotiationRounds component
  - Create shared/NegotiationRounds.tsx with discount application logic
  - Implement round history tracking and display
  - Add form validation for discount inputs
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 1.3 Extract ProposalViewer component
  - Create shared/ProposalViewer.tsx with PDF-formatted display
  - Implement print functionality
  - Add professional styling for proposal preview
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 1.4 Extract DeleteConfirmation component
  - Create shared/DeleteConfirmation.tsx with confirmation modal
  - Implement proper error handling for deletion failures
  - Add loading states during deletion process
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 2. Update PABXSIPCalculator with new functionality
  - Integrate all shared components into PABXSIPCalculator
  - Update state management and event handlers
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2.1 Add state management to PABXSIPCalculator
  - Add state variables for modals and selected proposal
  - Implement event handlers for edit, delete, view actions
  - Update component imports and dependencies
  - _Requirements: 2.2, 3.1, 4.1_

- [x] 2.2 Update PABXSIPCalculator proposals table
  - Add Actions column with ProposalActions component
  - Update table structure to accommodate new buttons
  - Ensure consistent styling with other calculators
  - _Requirements: 2.1, 5.4_

- [x] 2.3 Integrate modals in PABXSIPCalculator
  - Add NegotiationRounds modal with proper props
  - Add ProposalViewer modal with proposal data
  - Add DeleteConfirmation modal with deletion logic
  - _Requirements: 2.3, 3.1, 4.1_

- [x] 2.4 Fix API integration in PABXSIPCalculator
  - Update data structure to match backend expectations
  - Implement proper error handling and user feedback
  - Add validation for client and account manager data
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Update FiberLinkCalculator with new functionality
  - Integrate all shared components into FiberLinkCalculator
  - Update state management and event handlers
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 3.1 Add state management to FiberLinkCalculator
  - Add state variables for modals and selected proposal
  - Implement event handlers for edit, delete, view actions
  - Update component imports and dependencies
  - _Requirements: 2.2, 3.1, 4.1_

- [x] 3.2 Update FiberLinkCalculator proposals table
  - Add Actions column with ProposalActions component
  - Update table structure to accommodate new buttons
  - Ensure consistent styling with other calculators
  - _Requirements: 2.1, 5.4_

- [x] 3.3 Integrate modals in FiberLinkCalculator
  - Add NegotiationRounds modal with proper props
  - Add ProposalViewer modal with proposal data
  - Add DeleteConfirmation modal with deletion logic
  - _Requirements: 2.3, 3.1, 4.1_

- [x] 3.4 Fix API integration in FiberLinkCalculator
  - Update data structure to match backend expectations
  - Implement proper error handling and user feedback
  - Add validation for client and account manager data
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Update RadioInternetCalculator with new functionality
  - Integrate all shared components into RadioInternetCalculator
  - Update state management and event handlers
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 4.1 Add state management to RadioInternetCalculator
  - Add state variables for modals and selected proposal
  - Implement event handlers for edit, delete, view actions
  - Update component imports and dependencies
  - _Requirements: 2.2, 3.1, 4.1_

- [x] 4.2 Update RadioInternetCalculator proposals table
  - Add Actions column with ProposalActions component
  - Update table structure to accommodate new buttons
  - Ensure consistent styling with other calculators
  - _Requirements: 2.1, 5.4_

- [x] 4.3 Integrate modals in RadioInternetCalculator
  - Add NegotiationRounds modal with proper props
  - Add ProposalViewer modal with proposal data
  - Add DeleteConfirmation modal with deletion logic
  - _Requirements: 2.3, 3.1, 4.1_

- [x] 4.4 Fix API integration in RadioInternetCalculator
  - Update data structure to match backend expectations
  - Implement proper error handling and user feedback
  - Add validation for client and account manager data
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Update DoubleRadioFibraCalculator with new functionality
  - Integrate all shared components into DoubleRadioFibraCalculator
  - Update state management and event handlers
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 5.1 Add state management to DoubleRadioFibraCalculator
  - Add state variables for modals and selected proposal
  - Implement event handlers for edit, delete, view actions
  - Update component imports and dependencies
  - _Requirements: 2.2, 3.1, 4.1_

- [x] 5.2 Update DoubleRadioFibraCalculator proposals table
  - Add Actions column with ProposalActions component
  - Update table structure to accommodate new buttons
  - Ensure consistent styling with other calculators
  - _Requirements: 2.1, 5.4_

- [x] 5.3 Integrate modals in DoubleRadioFibraCalculator
  - Add NegotiationRounds modal with proper props
  - Add ProposalViewer modal with proposal data
  - Add DeleteConfirmation modal with deletion logic
  - _Requirements: 2.3, 3.1, 4.1_

- [x] 5.4 Fix API integration in DoubleRadioFibraCalculator
  - Update data structure to match backend expectations
  - Implement proper error handling and user feedback
  - Add validation for client and account manager data
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Create unit tests for shared components
  - Write comprehensive tests for all shared components
  - Test error handling and edge cases
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6.1 Test ProposalActions component
  - Write unit tests for button interactions
  - Test prop handling and event callbacks
  - Test error states and loading states
  - _Requirements: 2.1, 2.2, 5.4_

- [x] 6.2 Test NegotiationRounds component
  - Write unit tests for discount calculations
  - Test form validation and submission
  - Test round history display and management
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 6.3 Test ProposalViewer component
  - Write unit tests for PDF formatting
  - Test print functionality
  - Test modal open/close behavior
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Validate consistency across all calculators
  - Test that all calculators have identical functionality
  - Verify API integration works consistently
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7.1 Cross-calculator functionality testing
  - Test proposal creation, editing, deletion in all calculators
  - Verify negotiation rounds work identically across calculators
  - Test proposal viewing and printing in all calculators
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 7.2 API integration validation
  - Test data structure consistency across all calculators
  - Verify error handling works identically
  - Test validation messages are consistent
  - _Requirements: 1.1, 1.2, 1.3, 1.4_