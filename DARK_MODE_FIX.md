# Dark Mode Fix Documentation

## Problem
When the application switched to dark mode, fonts and various UI elements became invisible or hard to read because the ShieldNest and AegisSuite theme CSS files did not include dark mode color variants.

## Solution Overview
Added comprehensive dark mode support to both theme files by:
1. Adding dark mode CSS variable overrides
2. Creating `.dark` selector variants for all custom components
3. Ensuring all text, backgrounds, borders, and shadows adapt properly to dark mode

---

## Changes Made

### 1. ShieldNest Theme (`src/styles/shieldnest-theme.css`)

#### Added Dark Mode Variables
```css
.dark {
  --atoll-dark: #1e3a8a;
  --aegis-gold-dark: #fbbf24;
  --ecru-white-dark: #1f2937;
  --fern-dark: #4ade80;
  --atlantis-dark: #a3e635;
  --shadow-green-dark: #6b7280;
  --botticelli-dark: #374151;
  --waterloo-dark: #9ca3af;
}
```

#### Updated Components with Dark Mode Support

**Backgrounds:**
- `.shieldnest-bg` → Dark background: `#1f2937`
- `.shieldnest-bg1`, `.shieldnest-bg2`, `.shieldnest-bg3` → Adjusted colors

**Cards:**
- `.shieldnest-metric-card` → Dark gradient background with light text
- `.shieldnest-card` → Dark background `#1f2937`, light text, adjusted borders
- `.shieldnest-white-column` → Dark background with proper shadows
- `.shieldnest-gradient-column` → Dark gradient variant

**Inputs:**
- `.shieldnest-input` → Dark background, light text, adjusted borders
- Focus states updated with proper dark mode colors

**Tables:**
- `.shieldnest-table` → Dark background with light text
- Table headers → Dark background `#374151`
- Table rows hover → Darker background on hover

**Other Elements:**
- Main content area → Dark background `#111827`
- Shadows → Stronger shadows for dark mode visibility

---

### 2. AegisSuite Theme (`src/styles/aegissuite-theme.css`)

#### Added Dark Mode CSS Variables Override
Instead of updating individual classes, we used CSS variables that automatically cascade to all components:

```css
.dark {
  /* Background Colors - Dark theme */
  --aegis-bg-primary: #1f2937;
  --aegis-bg-secondary: #111827;
  --aegis-bg-tertiary: #374151;
  
  /* Text Colors - Light on dark */
  --aegis-text-primary: #f9fafb;
  --aegis-text-secondary: #d1d5db;
  --aegis-text-tertiary: #9ca3af;
  
  /* Border Colors - Subtle on dark */
  --aegis-border-light: #374151;
  --aegis-border-medium: #4b5563;
  
  /* Primary Colors - Lighter for visibility */
  --aegis-primary: #3b82f6;
  --aegis-primary-light: #60a5fa;
  --aegis-primary-dark: #2563eb;
  
  /* Secondary Colors - Adjusted */
  --aegis-success: #4ade80;
  --aegis-warning: #fb923c;
  --aegis-info: #60a5fa;
  --aegis-purple: #a78bfa;
  
  /* Shadows - Stronger for depth */
  --aegis-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --aegis-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --aegis-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}
```

**All AegisSuite components automatically inherit these changes because they use CSS variables!**

---

## Components Now Properly Supported

### ShieldNest Components
✅ Background sections
✅ Metric cards
✅ Buttons (gradient, primary)
✅ Tabs (active states)
✅ Cards (hover effects)
✅ Input fields (focus states)
✅ Status badges (all 13 variants)
✅ Tables (headers, rows, hover)
✅ Text colors
✅ Gradient backgrounds
✅ Columns (white and gradient)
✅ Shadows

### AegisSuite Components
✅ All buttons (primary, secondary)
✅ All cards (standard, metric)
✅ Sidebar items (active states)
✅ Input fields
✅ Badges (all variants)
✅ Tables (headers, rows)
✅ Headers
✅ Search bars
✅ User profiles
✅ Notification badges
✅ All utility classes

---

## How Dark Mode Works in the App

The app uses the `ThemeProvider` context from `src/app/contexts/theme/Provider.jsx` which:

1. **Detects theme preference** from localStorage or system preference
2. **Applies `.dark` class** to the `<html>` element when dark mode is active
3. **Removes `.dark` class** when light mode is active

This triggers all the CSS rules we added with `.dark` selector prefix.

---

## Testing Dark Mode

### To Switch Between Themes:

1. **Via System Settings** (if `themeMode: "system"` in settings):
   - The app follows your OS dark/light mode preference

2. **Via App Settings** (if available):
   - Look for theme switcher in app settings/customizer
   - Toggle between "light", "dark", or "system" modes

3. **Via Browser DevTools** (for testing):
   ```javascript
   // In browser console:
   // Enable dark mode
   document.documentElement.classList.add('dark');
   
   // Disable dark mode
   document.documentElement.classList.remove('dark');
   ```

---

## Color Palette Reference

### Light Mode Colors
- **Backgrounds**: White (`#ffffff`), Light Gray (`#f9fafb`)
- **Text**: Dark Gray (`#111827`), Medium Gray (`#6b7280`)
- **Primary**: Navy Blue (`#0a2463`)
- **Accent**: Gold (`#f4d03f`)

### Dark Mode Colors
- **Backgrounds**: Dark Gray (`#1f2937`), Darker Gray (`#111827`)
- **Text**: Off-White (`#f9fafb`), Light Gray (`#d1d5db`)
- **Primary**: Bright Blue (`#3b82f6`)
- **Accent**: Yellow (`#fbbf24`)

---

## Additional Notes

### For Developers

1. **Always use CSS variables** for colors in new components:
   ```css
   /* Good */
   background: var(--aegis-bg-primary);
   color: var(--aegis-text-primary);
   
   /* Avoid */
   background: #ffffff;
   color: #111827;
   ```

2. **Use `.dark` selector** when you need specific dark mode overrides:
   ```css
   .my-component {
     background: white;
   }
   
   .dark .my-component {
     background: #1f2937;
   }
   ```

3. **Test both themes** when adding new UI elements

4. **Contrast ratios**: Ensure text has sufficient contrast in both modes
   - Light mode: Dark text on light background
   - Dark mode: Light text on dark background

### Color Accessibility
All color combinations have been chosen to meet WCAG 2.1 Level AA contrast requirements for readability.

---

## Troubleshooting

### If text is still not visible:

1. **Check element has proper class**: Make sure component uses theme classes
2. **Inspect in DevTools**: Check if `.dark` class is on `<html>` element
3. **Clear cache**: Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
4. **Check custom styles**: Ensure no inline styles override theme colors

### If colors look wrong:

1. **Verify theme variables**: Check CSS custom properties in DevTools
2. **Check cascade order**: Ensure theme CSS files load in correct order
3. **Look for !important**: Remove any `!important` overrides conflicting with theme

---

## Files Modified

1. `src/styles/shieldnest-theme.css` - Added dark mode support for ShieldNest components
2. `src/styles/aegissuite-theme.css` - Added dark mode CSS variables for AegisSuite components

---

## Maintenance

When adding new components:

1. Use existing CSS variables from the theme files
2. If creating custom colors, add both light and dark variants
3. Test in both light and dark modes
4. Update this documentation if adding new theme components

---

## Support

If you encounter any visibility issues in dark mode:
1. Identify the specific component/page
2. Check if it uses theme CSS classes
3. Add dark mode support following patterns in this document
4. Update this documentation with your changes

