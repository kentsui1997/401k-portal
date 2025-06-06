# GitHub Copilot Advanced Features Lab (v3)
## 401k Portal Enhancement Exercise

This lab will guide you through using GitHub Copilot's advanced features to enhance a React-based 401k investment portal application.

## Prerequisites
- Visual Studio Code with GitHub Copilot and GitHub Copilot Chat extensions installed
- Active GitHub Copilot subscription
- Node.js and npm installed

## Setup (7 minutes)

1. Clone the repository and install dependencies:
```zsh
git clone https://github.com/yourusername/401k-portal.git
cd 401k-portal
npm install
```

2. Start the development server:
```zsh
npm run dev
```

3. Configure Custom Instructions for GitHub Copilot using a prompt file:
   - Create a `.github` folder in the root of the project if it doesn't exist:
   ```zsh
   mkdir -p .github
   ```
   - Create a file named `copilot-instructions.md` in the `.github` folder:
   ```zsh
   touch .github/copilot-instructions.md
   ```
   - Add the following content to the file:
   ```markdown
   # Instructions for GitHub Copilot

   You are an AI assistant specializing in financial application development for a 401k portal. 

   ## When providing code:
   - Follow strict validation for financial transactions
   - Include proper error handling for all user inputs
   - Follow existing code style (React hooks, Tailwind CSS)
   - Format all money values with proper currency formatting

   ## Business rules:
   - Fund transfers must maintain positive balances
   - Users cannot transfer more than available balance
   - Fund transfers maintain investment type buckets
   ```
   
   > 📝 **Note:** VS Code will automatically pick up these instructions when the file is created. This approach allows custom instructions to be version-controlled and shared across the team.

## Exercise 1: Using Agent Mode (15 minutes)

**Task:** Create a performance dashboard component that shows historical returns

**Steps:**
1. Open VS Code Copilot Chat (Ctrl+Shift+I or Cmd+Shift+I)
2. Ask GitHub Copilot Agent to analyze the existing codebase structure
3. Request it to create a new component that shows:
   - Mock historical performance data
   - Year-to-date and lifetime returns
   - A simple visual representation of trends
4. Ask Copilot to help you integrate the component into the main Dashboard

**Questions to consider:**
- How well did Agent Mode understand the existing codebase?
- How effective was Copilot at suggesting coherent code that matches the existing patterns?

## Exercise 2: Next Edit Suggestion (10 minutes)

**Task:** Implement a portfolio risk assessment utility function with visualization

**Steps:**
1. Create a new utility function in `investmentUtils.js`
2. Define a function signature and observe Next Edit Suggestions:
```javascript
/**
 * Calculate risk score for a portfolio based on asset allocation
 * @param {Array} balances - Current investment balances
 * @param {Array} funds - Fund definitions with risk categories
 * @returns {Object} Risk assessment with score and category
 */
export const calculatePortfolioRisk = (balances, funds) => {
  // Start implementing here and observe NES suggestions
}
```
3. Continue implementing the function, utilizing Next Edit Suggestions
4. After implementing the calculation function, create a visualization component:

   a. Create a new file `RiskGauge.jsx` in the `src/components/ui` directory:
   ```jsx
   import React, { useMemo } from 'react';
   import { useInvestments } from '../../contexts/InvestmentContext';
   import { calculatePortfolioRisk } from '../../utils/investmentUtils';
   
   /**
    * Component to visualize portfolio risk assessment
    * @returns {JSX.Element} Risk gauge visualization
    */
   const RiskGauge = () => {
     // Get investments from context
     const { investments } = useInvestments();
     
     // Calculate risk assessment using our utility function
     const riskAssessment = useMemo(() => {
       if (!investments?.balances || !investments?.funds) {
         return { score: 0, category: 'Unknown', breakdown: {} };
       }
       
       return calculatePortfolioRisk(investments.balances, investments.funds);
     }, [investments?.balances, investments?.funds]);
     
     // Continue implementing the visualization component...
   }
   
   export default RiskGauge;
   ```

   b. Implement a visual gauge that shows the risk level with appropriate color coding:
      - Green for Low risk
      - Yellow for Medium risk 
      - Red for High risk
   
   c. Add a breakdown of allocation by investment type

5. Integrate the component into the AccountPage in `App.jsx` below the PerformanceChart component:

   ```jsx
   // Add import at the top of App.jsx
   import RiskGauge from './components/ui/RiskGauge';
   
   // Then in the AccountPage component:
   
   {/* Add Performance Chart above Balance Matrix */}
   <PerformanceChart />
   
   {/* Add Risk Assessment Gauge */}
   <RiskGauge />
   
   <BalanceMatrix />
   ```

**Questions to consider:**
- Did Copilot suggest appropriate risk calculation logic?
- How did Next Edit Suggestion help speed up your development?
- How effectively did Copilot help visualize the risk assessment results?

## Exercise 3: GitHub Copilot Vision (10 minutes)

**Task:** Improve the UI of the investment balance matrix

**Steps:**
1. Take a screenshot of the current BalanceMatrix component in the browser
2. Open GitHub Copilot Chat and upload the screenshot
3. Ask for specific UI improvements:
   - How to improve data visualization
   - How to enhance accessibility
   - How to make the table more responsive
4. Implement one of the suggested improvements

**Questions to consider:**
- How valuable were Copilot Vision's UI suggestions?
- Did Vision understand the financial context of the application?

## Exercise 4: Agent Mode for Bug Fixing (10 minutes)

**Task:** Find and fix a bug in the investment transfer functionality

**Steps:**
1. Introduce a bug in the `transferFunds` function in `InvestmentContext.jsx`:
```javascript
// After the line that clears errors, add:
params.amount = params.amount.toString();
```
2. Try making a transfer in the application to observe the bug
3. Ask GitHub Copilot Agent to help identify and fix the issue
4. Implement the suggested fix

**Questions to consider:**
- How effectively did Agent Mode diagnose the issue?
- How accurate and relevant was the suggested fix?

## Reflection and Discussion (5 minutes)

- Which GitHub Copilot feature provided the most value during this exercise?
- How might these features change your development workflow?
- What types of tasks were most accelerated by using GitHub Copilot?

## Optional Extension: Model Context Protocol (MCP)

If time permits, explore how GitHub Copilot can be extended with the Model Context Protocol:

1. Ask Copilot Agent about implementing MCP for external financial data
2. Discuss how MCP could provide real-time market data to the application
3. Have Copilot sketch a basic implementation approach

## Tips for Success

- Be specific with your prompts to Agent Mode
- When using Next Edit Suggestion, type slowly to see the suggestions
- For Vision, explain the context and what you're trying to achieve
- Remember to validate Copilot's suggestions before implementing
