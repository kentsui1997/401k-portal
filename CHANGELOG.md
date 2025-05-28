# Changelog

## 2023-11-01

### Fund Transfer System Refactoring

#### Issues Addressed

- **Duplicated Logic:** Code for calculating transfers, handling validations, and UI display was duplicated across components
- **Lack of Validation:** Input validation was incomplete and inconsistently applied
- **Mixed Responsibilities:** Business logic was intertwined with UI components
- **Error Handling:** Error handling was inconsistent and incomplete
- **Maintainability:** Functions were difficult to test and reuse

#### Changes Made

1. **Created Utility Module**
   - Implemented a new `investmentUtils.js` to centralize common functions
   - Added comprehensive validation for transfers and reallocations
   - Moved calculation logic out of UI components

2. **Improved Investment Context**
   - Added dedicated preview functions for transfers and reallocations
   - Added proper error state management
   - Improved validation with clear error messages
   - Made functions return success/failure status for better handling

3. **Enhanced Money Movement Modal**
   - Fixed UI to prevent invalid transfers
   - Improved error message display
   - Added validations on form inputs
   - Streamlined user workflow
   - Fixed the fund selection to prevent selecting the same fund for source and target
   - Added step property to number inputs for better precision

#### Business Rules Implementation

The refactoring ensures the following business rules are properly enforced:

- Users can only transfer funds between eligible investment options
- Transfers must maintain a positive balance in source funds
- Transfer amounts must be greater than $0
- Users cannot transfer more than their available balance
- When a transfer is initiated, the funds go into the same investment type bucket
- Total allocation across all funds must equal 100%
- Allocation percentages must be between 0% and 100%

#### Benefits

- **Improved Reliability:** All transfers are now properly validated
- **Better User Experience:** Clear error messages and improved UI flow
- **Maintainability:** Code is more modular and easier to test
- **Consistency:** Business rules are enforced consistently
- **Performance:** Reduced duplicate calculations and unnecessary re-renders