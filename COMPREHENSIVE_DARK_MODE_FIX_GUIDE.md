# Comprehensive Dark Mode Fix Guide for All Pages

## ✅ **Completed Fixes**

1. ✅ **SharedSidebar.jsx** - Sidebar visible on all pages
2. ✅ **AgentDashboard.jsx** - Dashboard with metrics
3. ✅ **shieldnest-theme.css** - Custom ShieldNest components
4. ✅ **aegissuite-theme.css** - AegisSuite CSS variables
5. ✅ **dark-mode-utils.css** - Reusable utility classes

---

## 🎯 **Systematic Fix Pattern**

For every page, apply these replacements:

### 1. Page Container Background
```jsx
// BEFORE
<div className="flex h-screen bg-[var(--color-ecru-white)]">

// AFTER
<div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
```

### 2. Headers
```jsx
// BEFORE
<header className="bg-white shadow-sm border-b border-gray-200 p-6">
  <h1 className="text-2xl font-bold text-[var(--color-atoll)]">Page Title</h1>
  <p className="text-sm text-gray-600 mt-1">Description</p>
</header>

// AFTER
<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
  <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">Page Title</h1>
  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Description</p>
</header>
```

### 3. Cards
```jsx
// BEFORE
<Card className="overflow-hidden bg-white border-none">

// AFTER
<Card className="overflow-hidden bg-white dark:bg-gray-800 border-none">
```

### 4. Metric Cards/Summary Cards
```jsx
// BEFORE
<div className="shieldnest-gradient-column rounded-xl p-6">
  <p className="text-base font-medium text-slate-700">{title}</p>
  <p className="text-3xl font-bold text-slate-800">{value}</p>
  <p className="text-sm text-green-600">{change}</p>
</div>

// AFTER
<div className="shieldnest-gradient-column rounded-xl p-6">
  <p className="text-base font-medium text-slate-700 dark:text-slate-300">{title}</p>
  <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
  <p className="text-sm text-green-600 dark:text-green-400">{change}</p>
</div>
```

### 5. Tables
```jsx
// BEFORE
<table className="w-full">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-xs font-medium text-gray-500">Column</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">Data</div>
        <div className="text-sm text-gray-500">Sub-data</div>
      </td>
    </tr>
  </tbody>
</table>

// AFTER
<table className="w-full">
  <thead className="bg-gray-50 dark:bg-gray-700">
    <tr>
      <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Column</th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Data</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Sub-data</div>
      </td>
    </tr>
  </tbody>
</table>
```

### 6. Inputs & Selects
```jsx
// BEFORE
<input 
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  placeholder="Enter text"
/>
<select className="border rounded px-2 py-1">
  <option>Option 1</option>
</select>

// AFTER
<input 
  type="text"
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
  placeholder="Enter text"
/>
<select className="border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
  <option>Option 1</option>
</select>
```

### 7. Buttons
```jsx
// BEFORE
<button className="bg-[#0a2463] text-white px-4 py-2 rounded-lg">
  Click Me
</button>

// AFTER
<button className="bg-[#0a2463] dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-[#0a2463]/90 dark:hover:bg-blue-700">
  Click Me
</button>
```

### 8. Loading States
```jsx
// BEFORE
<div className="bg-gray-200 rounded w-3/4"></div>

// AFTER
<div className="bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
```

### 9. Status Colors
```jsx
// BEFORE
<span className="text-green-600">Success</span>
<span className="text-red-600">Error</span>
<span className="text-yellow-500">Warning</span>
<span className="text-blue-600">Info</span>

// AFTER
<span className="text-green-600 dark:text-green-400">Success</span>
<span className="text-red-600 dark:text-red-400">Error</span>
<span className="text-yellow-500 dark:text-yellow-400">Warning</span>
<span className="text-blue-600 dark:text-blue-400">Info</span>
```

### 10. Modals/Dialogs
```jsx
// BEFORE
<DialogPanel className="bg-white dark:bg-dark-700 shadow-xl px-6 py-8">
  <DialogTitle className="text-2xl font-semibold text-gray-800">Title</DialogTitle>
  <div className="py-4">
    <p className="text-sm text-gray-600">Content</p>
  </div>
</DialogPanel>

// AFTER
<DialogPanel className="bg-white dark:bg-gray-800 shadow-xl px-6 py-8">
  <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Title</DialogTitle>
  <div className="py-4">
    <p className="text-sm text-gray-600 dark:text-gray-300">Content</p>
  </div>
</DialogPanel>
```

---

## 📋 **Quick Reference Chart**

| Light Mode Class | Dark Mode Class to Add |
|------------------|------------------------|
| `bg-white` | `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-700` |
| `bg-gray-100` | `dark:bg-gray-600` |
| `bg-gray-200` | `dark:bg-gray-500` |
| `text-gray-900` | `dark:text-gray-100` |
| `text-gray-800` | `dark:text-gray-200` |
| `text-gray-700` | `dark:text-gray-200` |
| `text-gray-600` | `dark:text-gray-300` |
| `text-gray-500` | `dark:text-gray-400` |
| `text-slate-800` | `dark:text-white` |
| `text-slate-700` | `dark:text-slate-300` |
| `text-[var(--color-atoll)]` | `dark:text-blue-400` |
| `border-gray-200` | `dark:border-gray-700` |
| `border-gray-300` | `dark:border-gray-600` |
| `divide-gray-200` | `dark:divide-gray-700` |
| `hover:bg-gray-50` | `dark:hover:bg-gray-700` |
| `hover:bg-gray-100` | `dark:hover:bg-gray-600` |
| `text-green-600` | `dark:text-green-400` |
| `text-red-600` | `dark:text-red-400` |
| `text-yellow-500` | `dark:text-yellow-400` |
| `text-blue-600` | `dark:text-blue-400` |

---

## 🗂️ **Pages to Fix (Priority Order)**

### **High Priority** (User-facing main pages)
1. ✅ **AgentDashboard.jsx** - DONE
2. ⏳ **LeadManagement.jsx** - Main lead page
3. ⏳ **Marketplace/Marketplace.jsx** - Lead marketplace
4. ⏳ **Territories.jsx** - Territory management
5. ⏳ **OrdersAndSubscriptions/OrdersAndSubscriptions.jsx** - Orders
6. ⏳ **Settings.jsx** - User settings
7. ⏳ **Reports.jsx** / **ReportsAnalytics.jsx** - Analytics

### **Medium Priority** (Admin pages)
8. ⏳ **admin/UserManagement.jsx**
9. ⏳ **admin/AgentManagement.jsx**
10. ⏳ **admin/AdminPromoCodeManagement.jsx**
11. ⏳ **admin/AdminPurchaseHistory.jsx**
12. ⏳ **admin/file-upload/FileUpload.jsx**

### **Low Priority** (Modal/Support components)
13. ⏳ **LeadDetailsModal.jsx**
14. ⏳ **Support.jsx**
15. ⏳ **prospect/ProspectList.jsx**
16. ⏳ **campaign/** (all campaign pages)
17. ⏳ **Subscriptions/** (all subscription pages)

---

## 🔍 **Search & Replace Patterns (VS Code)**

Use VS Code's Find & Replace (Ctrl+H) with regex enabled:

### Pattern 1: Add dark mode to white backgrounds
**Find:** `className="([^"]*)\bbg-white\b([^"]*)"`  
**Replace:** `className="$1bg-white dark:bg-gray-800$2"`

### Pattern 2: Add dark text to gray-900
**Find:** `className="([^"]*)\btext-gray-900\b([^"]*)"`  
**Replace:** `className="$1text-gray-900 dark:text-gray-100$2"`

### Pattern 3: Add dark text to gray-600
**Find:** `className="([^"]*)\btext-gray-600\b([^"]*)"`  
**Replace:** `className="$1text-gray-600 dark:text-gray-300$2"`

### Pattern 4: Add dark borders
**Find:** `className="([^"]*)\bborder-gray-200\b([^"]*)"`  
**Replace:** `className="$1border-gray-200 dark:border-gray-700$2"`

⚠️ **Important:** Review each replacement before applying! Some classes may already have dark variants.

---

## 🧪 **Testing Checklist**

After fixing each page, verify in dark mode:

- [ ] Page background is dark (not white/light)
- [ ] All text is clearly readable
- [ ] Headers and titles are visible
- [ ] Cards have proper backgrounds and borders
- [ ] Tables (headers, rows, cells) are readable
- [ ] Buttons have proper contrast
- [ ] Input fields are visible with dark backgrounds
- [ ] Dropdowns/selects are readable
- [ ] Modal/dialog content is visible
- [ ] Loading states (skeletons) are visible
- [ ] Hover effects work properly
- [ ] Status badges/colors are visible
- [ ] Icons have proper contrast
- [ ] No "invisible" elements

---

## 🚀 **How to Use This Guide**

### Option 1: Manual Fix (Recommended for accuracy)
1. Open a page file (e.g., `LeadManagement.jsx`)
2. Use Ctrl+F to find each pattern from the chart above
3. Add the corresponding dark mode class
4. Test the page in dark mode
5. Move to the next page

### Option 2: VS Code Find & Replace
1. Open VS Code
2. Press Ctrl+Shift+H (Find & Replace in Files)
3. Set "files to include": `src/app/pages/AegisSuite/**/*.jsx`
4. Use the regex patterns above one at a time
5. Review each match before replacing
6. Test all pages after replacements

### Option 3: Automated Script (Use with caution)
```bash
node fix-dark-mode-all-pages.js
```
Then review all changes with `git diff` before committing.

---

## 📝 **Notes**

- Always test after making changes
- Some pages may have custom styling that needs special attention
- Status badges using `shieldnest-badge-*` classes are already fixed in CSS
- The SharedSidebar is already fixed and works across all pages
- Priority should be user-facing pages first

---

## 🆘 **Common Issues**

### Issue: Text still not visible
**Solution**: Check for inline styles or CSS modules overriding Tailwind classes

### Issue: Duplicate dark: classes
**Solution**: Use Find & Replace to remove duplicates: `dark:([a-z-]+)\s+dark:\1`

### Issue: Wrong dark color applied
**Solution**: Refer to the Quick Reference Chart and use correct dark mode color

---

## ✨ **Result**

After applying this guide to all pages, your entire application will have:
- ✅ Consistent dark mode support across all pages
- ✅ Proper text contrast and readability
- ✅ Professional appearance in both light and dark modes
- ✅ No invisible UI elements
- ✅ Smooth theme transitions

---

**Time Estimate**: 15-30 minutes per page (depending on complexity)
**Total Estimated Time**: 4-8 hours for all pages

**Pro Tip**: Start with high-priority pages and test thoroughly before moving to the next page!

