#!/bin/bash

# Automated Dark Mode Fix Script for All Remaining Pages
# This script applies dark mode classes to all JSX files in the AegisSuite directory

echo "🌙 Starting Automated Dark Mode Fix for All Remaining Pages..."
echo "================================================"

# Define the target directory
TARGET_DIR="src/app/pages/AegisSuite"

# Counter for modified files
MODIFIED_COUNT=0

# Find all JSX files
while IFS= read -r file; do
    echo ""
    echo "Processing: $file"
    
    CHANGED=false
    
    # Apply all dark mode patterns
    
    # 1. Page backgrounds
    if grep -q 'bg-\[var(--color-ecru-white)\]' "$file" && ! grep -q 'bg-\[var(--color-ecru-white)\] dark:bg-gray-900' "$file"; then
        sed -i 's/bg-\[var(--color-ecru-white)\]/bg-[var(--color-ecru-white)] dark:bg-gray-900/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed ecru-white background"
    fi
    
    # 2. White backgrounds (avoid already fixed)
    if grep -q 'className="[^"]*\bbg-white\b[^"]*"' "$file"; then
        sed -i 's/\(className="[^"]*\)bg-white\([^"]*"\)/\1bg-white dark:bg-gray-800\2/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed white backgrounds"
    fi
    
    # 3. Gray-50 backgrounds
    if grep -q 'bg-gray-50' "$file" && ! grep -q 'bg-gray-50 dark:bg-gray-700' "$file"; then
        sed -i 's/bg-gray-50/bg-gray-50 dark:bg-gray-700/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-50 backgrounds"
    fi
    
    # 4. Text colors
    if grep -q 'text-gray-900' "$file" && ! grep -q 'text-gray-900 dark:text-gray-100' "$file"; then
        sed -i 's/text-gray-900/text-gray-900 dark:text-gray-100/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-900 text"
    fi
    
    if grep -q 'text-gray-600' "$file" && ! grep -q 'text-gray-600 dark:text-gray-300' "$file"; then
        sed -i 's/text-gray-600/text-gray-600 dark:text-gray-300/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-600 text"
    fi
    
    if grep -q 'text-gray-500' "$file" && ! grep -q 'text-gray-500 dark:text-gray-400' "$file"; then
        sed -i 's/text-gray-500/text-gray-500 dark:text-gray-400/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-500 text"
    fi
    
    if grep -q 'text-gray-700' "$file" && ! grep -q 'text-gray-700 dark:text-gray-200' "$file"; then
        sed -i 's/text-gray-700/text-gray-700 dark:text-gray-200/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-700 text"
    fi
    
    # 5. Borders
    if grep -q 'border-gray-200' "$file" && ! grep -q 'border-gray-200 dark:border-gray-700' "$file"; then
        sed -i 's/border-gray-200/border-gray-200 dark:border-gray-700/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-200 borders"
    fi
    
    if grep -q 'border-gray-300' "$file" && ! grep -q 'border-gray-300 dark:border-gray-600' "$file"; then
        sed -i 's/border-gray-300/border-gray-300 dark:border-gray-600/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed gray-300 borders"
    fi
    
    # 6. Brand colors
    if grep -q 'text-\[var(--color-atoll)\]' "$file" && ! grep -q 'text-\[var(--color-atoll)\] dark:text-blue-400' "$file"; then
        sed -i 's/text-\[var(--color-atoll)\]/text-[var(--color-atoll)] dark:text-blue-400/g' "$file"
        CHANGED=true
        echo "  ✓ Fixed brand color text"
    fi
    
    if [ "$CHANGED" = true ]; then
        ((MODIFIED_COUNT++))
        echo "  ✅ File modified"
    else
        echo "  ℹ️  No changes needed (already fixed or no applicable patterns)"
    fi
    
done < <(find "$TARGET_DIR" -name "*.jsx" -type f)

echo ""
echo "================================================"
echo "✨ Dark Mode Fix Complete!"
echo "Modified $MODIFIED_COUNT files"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test the application in dark mode"
echo "3. Commit changes if everything looks good"
echo ""

