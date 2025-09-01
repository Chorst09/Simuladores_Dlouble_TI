# Implementation Plan

- [x] 1. Migrate VMCalculator to use ClientManagerForm pattern
  - Update VMCalculator imports to include ClientManagerForm and related interfaces
  - Modify viewMode type from 'search' | 'create' | 'edit' to 'search' | 'client-form' | 'calculator'
  - Add clientData and accountManagerData state variables
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 1.1 Update VMCalculator state management
  - Add ClientData and AccountManagerData state variables with proper initialization
  - Modify viewMode state to use the standard three-state pattern
  - Update navigation functions to use client-form flow
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.2 Implement client-form view in VMCalculator
  - Add conditional rendering for client-form viewMode
  - Integrate ClientManagerForm component with proper props
  - Implement navigation callbacks for back and continue actions
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 1.3 Update VMCalculator proposal creation flow
  - Modify createNewProposal function to navigate to client-form instead of direct calculator
  - Update editProposal function to handle client data properly
  - Ensure proper data flow from client-form to calculator view
  - _Requirements: 1.1, 1.3, 2.4_

- [x] 2. Update VMCalculator data persistence
  - Modify Proposal interface to include clientData and accountManagerData fields
  - Update saveProposal function to include project name in saved data
  - Ensure backward compatibility with existing proposals that only have clientName
  - _Requirements: 1.3, 2.4, 3.1_

- [x] 2.1 Implement data validation in VMCalculator
  - Add validation for required fields including projectName
  - Implement error handling for missing client data
  - Ensure validation messages are consistent with other calculators
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.2 Update VMCalculator proposal display
  - Modify proposal listing to show project name when available
  - Update proposal summary to include client and project information
  - Ensure consistent display format across all calculator views
  - _Requirements: 1.4, 2.3_

- [-] 3. Test VMCalculator integration
  - Create unit tests for ClientManagerForm integration in VMCalculator
  - Test navigation flow between search, client-form, and calculator views
  - Verify that project name field validation works correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3.1 Test data persistence and compatibility
  - Test saving new proposals with project name field
  - Verify that existing proposals without project name still load correctly
  - Test editing existing proposals and adding project name
  - _Requirements: 2.4, 3.1, 3.2_

- [ ] 3.2 Verify cross-calculator consistency
  - Compare VMCalculator implementation with other calculators
  - Ensure consistent behavior and styling across all calculators
  - Test that all calculators properly validate project name field
  - _Requirements: 2.1, 2.2, 2.3_