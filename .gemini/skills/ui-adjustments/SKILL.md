---
name: ui-adjustments
description: "Use when the user asks to adjust UI layouts, sizes, or positions. Emphasizes building temporary visual tools rather than blind guessing, and clarifying exactly WHAT to adjust before applying complex hacks."
---

# UI Adjustment Workflow

When the human partner asks to adjust UI elements (like sizes, alignments, or positioning):

## 1. Clarify Intent Before Complex Hacks
- If a request is ambiguous (e.g., "center it", "adjust the length"), ALWAYS clarify whether they mean the container, the text inside, or the element itself.
- DO NOT apply complex, non-standard CSS hacks (like invisible absolute elements over spans) to achieve basic layouts unless explicitly requested. Start with simple CSS layout principles (Flexbox, Grid) on the appropriate containers.

## 2. Use Temporary Visual Tools for Pixel Tweaking
- If the user wants to tweak sizes or positions and says "I don't want to type code", build a **Temporary Floating Control Panel** in the UI using React state (`useState`) and range sliders (`<input type="range">`).
- Allow them to visually drag and adjust the values in real-time in their browser.
- Once they find the perfect values, ask them for the numbers, apply the hardcoded CSS, and completely remove the temporary control panel.

## 3. Avoid Guesswork & Respect Location
- Don't guess exact pixel values for complex layout matching. Use the interactive control panel approach to let the human partner visually confirm.
- When placing new code, respect the exact location the user intends (e.g., don't move local component constants into a global CSS file unless specifically asked to).
