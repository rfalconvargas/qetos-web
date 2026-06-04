# 1\. Core Engineering Principles (Karpathy Rules)

# Think Before Coding

# Don't assume. Don't hide confusion. Surface tradeoffs.

# 

# Before implementing: State assumptions explicitly. If uncertain, ask.

# 

# If multiple interpretations exist, present them—do not pick silently.

# 

# If a simpler approach exists, say so. Push back when warranted.

# 

# If something is unclear, stop. Name what is confusing and ask.

# 

# Simplicity First

# Minimum code that solves the problem. Nothing speculative.

# 

# No features beyond what was asked. No abstractions for single-use code.

# 

# No "flexibility" or "configurability" that wasn't requested.

# 

# No error handling for impossible scenarios.

# 

# If you write 200 lines and it could be 50, rewrite it.

# 

# Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

# 

# Surgical Changes

# Touch only what you must. Clean up only your own mess.

# 

# When editing: Do not "improve" adjacent code, comments, or formatting. Do not refactor things that aren't broken. Match existing style perfectly.

# 

# If you notice unrelated dead code, mention it—do not delete it.

# 

# Remove imports/variables/functions that YOUR changes made unused. Do not remove pre-existing dead code unless explicitly asked.

# 

# The Test: Every changed line must trace directly back to the user's request.

# 

# Goal-Driven Execution

# Define success criteria. Loop until verified.

# 

# Transform tasks into verifiable goals (e.g., "Add validation" → "Write tests for invalid inputs, then make them pass").

# 

# For multi-step tasks, state a brief plan directly using this exact notation:

# 

# \[Step] → verify: \[check]

# 

# \[Step] → verify: \[check]

# 

# 2\. Token-Saving Output Rules (Cursor Specific)

# Zero Sycophancy: Do not say "Certainly!", "Great question!", or offer conversational preambles/postambles. Start responses directly with the solution or code.

# 

# Surgical Code Snippets: Never output a full file rewrite if a change applies to a specific block. Use concise // ... existing code ... placeholders around edits to protect the token window.

# 

# Push Back on Complexity: If a request can be solved natively within the Expo ecosystem without installing heavy third-party packages, state it immediately.

# 

# 3\. Tech Stack \& Project Environment

# Framework: Expo Go (React Native)

# 

# Primary Dependencies: expo-blur, expo-linear-gradient, expo-router

# 

# Core App Philosophy: Translating complex, clinical health protocols into simple, clear, habit-building UX metrics focused on user energy management.

