#!/usr/bin/env node

/**
 * Automated Dark Mode Fix Script
 * This script automatically adds dark mode classes to all AegisSuite pages
 */

const fs = require('fs');
const path = require('path');

// Define the replacements to apply
const replacements = [
  // Page backgrounds
  {
    pattern: /className="([^"]*\bbg-white\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:bg-')) {
        return `className="${classes} dark:bg-gray-800"`;
      }
      return match;
    },
    description: 'Adding dark background to white backgrounds'
  },
  {
    pattern: /className="([^"]*\bbg-gray-50\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:bg-gray-700')) {
        return `className="${classes} dark:bg-gray-700"`;
      }
      return match;
    },
    description: 'Adding dark background to gray-50 backgrounds'
  },
  
  // Text colors - Primary
  {
    pattern: /className="([^"]*\btext-gray-900\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:text-gray-100')) {
        return `className="${classes} dark:text-gray-100"`;
      }
      return match;
    },
    description: 'Adding light text to gray-900 text'
  },
  
  // Text colors - Secondary
  {
    pattern: /className="([^"]*\btext-gray-600\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:text-gray-300')) {
        return `className="${classes} dark:text-gray-300"`;
      }
      return match;
    },
    description: 'Adding light text to gray-600 text'
  },
  
  // Text colors - Tertiary
  {
    pattern: /className="([^"]*\btext-gray-500\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:text-gray-400')) {
        return `className="${classes} dark:text-gray-400"`;
      }
      return match;
    },
    description: 'Adding light text to gray-500 text'
  },
  
  // Slate text colors
  {
    pattern: /className="([^"]*\btext-slate-800\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:text-white')) {
        return `className="${classes} dark:text-white"`;
      }
      return match;
    },
    description: 'Adding white text to slate-800 text'
  },
  {
    pattern: /className="([^"]*\btext-slate-700\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:text-slate-300')) {
        return `className="${classes} dark:text-slate-300"`;
      }
      return match;
    },
    description: 'Adding light text to slate-700 text'
  },
  
  // Borders
  {
    pattern: /className="([^"]*\bborder-gray-200\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:border-gray-700')) {
        return `className="${classes} dark:border-gray-700"`;
      }
      return match;
    },
    description: 'Adding dark borders'
  },
  {
    pattern: /className="([^"]*\bborder-gray-300\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:border-gray-600')) {
        return `className="${classes} dark:border-gray-600"`;
      }
      return match;
    },
    description: 'Adding dark borders to gray-300'
  },
  
  // Dividers
  {
    pattern: /className="([^"]*\bdivide-gray-200\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:divide-gray-700')) {
        return `className="${classes} dark:divide-gray-700"`;
      }
      return match;
    },
    description: 'Adding dark dividers'
  },
  
  // Hover states
  {
    pattern: /className="([^"]*\bhover:bg-gray-50\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:hover:bg-gray-700')) {
        return `className="${classes} dark:hover:bg-gray-700"`;
      }
      return match;
    },
    description: 'Adding dark hover states'
  },
  {
    pattern: /className="([^"]*\bhover:bg-gray-100\b[^"]*)"/g,
    replace: (match, classes) => {
      if (!classes.includes('dark:hover:bg-gray-600')) {
        return `className="${classes} dark:hover:bg-gray-600"`;
      }
      return match;
    },
    description: 'Adding dark hover states to gray-100'
  },
];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ pattern, replace, description }) => {
      const originalContent = content;
      content = content.replace(pattern, replace);
      if (content !== originalContent) {
        modified = true;
        console.log(`  ✓ ${description}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all JSX files
function findJSXFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findJSXFiles(filePath, fileList);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
const aegisSuiteDir = path.join(__dirname, 'src', 'app', 'pages', 'AegisSuite');

console.log('🌙 Starting Dark Mode Fix for All Pages...\n');
console.log(`Scanning: ${aegisSuiteDir}\n`);

if (!fs.existsSync(aegisSuiteDir)) {
  console.error('Error: AegisSuite directory not found!');
  process.exit(1);
}

const jsxFiles = findJSXFiles(aegisSuiteDir);
console.log(`Found ${jsxFiles.length} files to process\n`);

let modifiedCount = 0;

jsxFiles.forEach(file => {
  const relativePath = path.relative(aegisSuiteDir, file);
  console.log(`\nProcessing: ${relativePath}`);
  
  if (processFile(file)) {
    modifiedCount++;
    console.log(`  ✅ Modified`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`✨ Dark Mode Fix Complete!`);
console.log(`Modified ${modifiedCount} out of ${jsxFiles.length} files`);
console.log(${'='.repeat(50)}\n`);
console.log('Next steps:');
console.log('1. Review the changes: git diff');
console.log('2. Test the application in dark mode');
console.log('3. Commit the changes if everything looks good\n');

