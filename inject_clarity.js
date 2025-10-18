#!/usr/bin/env node

/**
 * Microsoft Clarity Code Injector for Gaming Website
 * Automated batch installation script with intelligent insertion logic
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CLARITY_PROJECT_ID = 'trwe96stgu';
const TARGET_DIRECTORY = './';
const EXCLUDED_DIRS = ['node_modules'];

// Microsoft Clarity tracking code
const CLARITY_CODE = `<!-- Microsoft Clarity Analytics -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
</script>`;

// Target HTML files (main pages)
const TARGET_FILES = [
    'index.html',
    'guide.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'fireboy-and-watergirl-1.html',
    'fireboy-and-watergirl-2.html',
    'fireboy-and-watergirl-3.html',
    'fireboy-and-watergirl-4.html',
    'fireboy-and-watergirl-5.html',
    'fireboy-and-watergirl-6.html',
    'casual_games_final.html'
];

// Statistics tracking
const stats = {
    processed: 0,
    success: 0,
    skipped: {
        alreadyHasClarity: 0,
      fileNotFound: 0
    },
    failed: 0,
    details: []
};

/**
 * Check if file already has Clarity code
 */
function hasClarityCode(content) {
    return content.includes('clarity.ms') ||
           content.includes('clarity') ||
           content.includes(CLARITY_PROJECT_ID);
}

/**
 * Find Google Analytics code pattern and insertion point
 */
function findGAInsertionPoint(content) {
    // Look for Google Analytics gtag script
    const gtagScriptMatch = content.match(/<script>\s*window\.dataLayer[\s\S]*?gtag\('config',\s*['"]G-[^'"]*['"]\);?\s*<\/script>/);

    if (gtagScriptMatch) {
        return {
            hasGA: true,
            insertAfter: gtagScriptMatch.index + gtagScriptMatch[0].length,
            gaCode: gtagScriptMatch[0]
        };
    }

    // Look for Google Analytics async script
    const gaAsyncMatch = content.match(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[^"]*"><\/script>/);

    if (gaAsyncMatch) {
        return {
            hasGA: true,
            insertAfter: gaAsyncMatch.index + gaAsyncMatch[0].length,
            gaCode: gaAsyncMatch[0]
        };
    }

    return { hasGA: false };
}

/**
 * Find head tag insertion point
 */
function findHeadInsertionPoint(content) {
    const headMatch = content.match(/<head[^>]*>/);
    if (headMatch) {
        return headMatch.index + headMatch[0].length;
    }
    return null;
}

/**
 * Inject Clarity code into HTML file
 */
function injectClarityCode(filePath) {
    try {
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        stats.processed++;

        // Check if Clarity already exists
        if (hasClarityCode(content)) {
            stats.skipped.alreadyHasClarity++;
            stats.details.push({
                file: filePath,
                status: 'skipped',
                reason: 'Already has Clarity code',
                action: 'None'
            });
            return false;
        }

        // Try to find GA code first
        const gaInfo = findGAInsertionPoint(content);
        let insertionPoint, insertionMethod;

        if (gaInfo.hasGA) {
            // Insert after GA code
            insertionPoint = gaInfo.insertAfter;
            insertionMethod = 'after_ga';
        } else {
            // Insert after head tag
            insertionPoint = findHeadInsertionPoint(content);
            insertionMethod = 'after_head';
        }

        if (insertionPoint === null) {
            stats.failed++;
            stats.details.push({
                file: filePath,
                status: 'failed',
                reason: 'Could not find insertion point',
                action: 'None'
            });
            return false;
        }

        // Insert Clarity code
        const beforeInsertion = content.substring(0, insertionPoint);
        const afterInsertion = content.substring(insertionPoint);
        const newContent = beforeInsertion + '\n    ' + CLARITY_CODE + '\n' + afterInsertion;

        // Write back to file
        fs.writeFileSync(filePath, newContent, 'utf8');

        stats.success++;
        stats.details.push({
            file: filePath,
            status: 'success',
            method: insertionMethod,
            reason: gaInfo.hasGA ? 'Found GA code' : 'No GA found, used head tag',
            action: 'Injected Clarity code'
        });

        return true;

    } catch (error) {
        stats.failed++;
        stats.details.push({
            file: filePath,
            status: 'failed',
            reason: error.message,
            action: 'None'
        });
        return false;
    }
}

/**
 * Get all HTML files in directory recursively
 */
function getAllHtmlFiles(dir, excludeDirs = []) {
    const files = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !excludeDirs.includes(item)) {
                traverse(fullPath);
            } else if (stat.isFile() && item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }

    traverse(dir);
    return files;
}

/**
 * Main execution function
 */
function main() {
    console.log('🎮 Microsoft Clarity Code Injector - Gaming Website');
    console.log('==================================================');
    console.log(`📁 Target Directory: ${TARGET_DIRECTORY}`);
    console.log(`🆔 Project ID: ${CLARITY_PROJECT_ID}`);
    console.log(`📋 Target Files: ${TARGET_FILES.length} specified files`);
    console.log('');

    // Change to target directory
    if (TARGET_DIRECTORY !== './') {
        try {
            process.chdir(TARGET_DIRECTORY);
        } catch (error) {
            console.error(`❌ Failed to change directory: ${error.message}`);
            return;
        }
    }

    // Process target files
    console.log('🚀 Starting batch installation...\n');

    for (const filename of TARGET_FILES) {
        const filePath = path.resolve(filename);

        console.log(`📄 Processing: ${filename}`);

        if (!fs.existsSync(filePath)) {
            stats.skipped.fileNotFound++;
            stats.details.push({
                file: filename,
                status: 'skipped',
                reason: 'File not found',
                action: 'None'
            });
            console.log(`   ⚠️  File not found, skipping...\n`);
            continue;
        }

        const success = injectClarityCode(filePath);

        if (success) {
            console.log(`   ✅ Successfully injected Clarity code\n`);
        }
    }

    // Generate detailed report
    console.log('📊 INSTALLATION REPORT');
    console.log('=====================');
    console.log(`📈 Total files processed: ${stats.processed}`);
    console.log(`✅ Successful installations: ${stats.success}`);
    console.log(`⏭️  Files skipped: ${stats.skipped.alreadyHasClarity + stats.skipped.fileNotFound}`);
    console.log(`   - Already has Clarity: ${stats.skipped.alreadyHasClarity}`);
    console.log(`   - File not found: ${stats.skipped.fileNotFound}`);
    console.log(`❌ Failed installations: ${stats.failed}`);
    console.log('');

    // Detailed breakdown
    console.log('📋 DETAILED BREAKDOWN:');
    console.log('=====================');

    for (const detail of stats.details) {
        const fileName = path.basename(detail.file);
        const statusIcon = detail.status === 'success' ? '✅' :
                          detail.status === 'skipped' ? '⏭️' : '❌';

        console.log(`${statusIcon} ${fileName}`);
        console.log(`   Status: ${detail.status.toUpperCase()}`);
        console.log(`   Reason: ${detail.reason}`);
        console.log(`   Action: ${detail.action}`);
        if (detail.method) {
            console.log(`   Method: ${detail.method.replace('_', ' ').toUpperCase()}`);
        }
        console.log('');
    }

    // Summary
    const successRate = stats.processed > 0 ? ((stats.success / stats.processed) * 100).toFixed(1) : 0;
    console.log('🎯 SUMMARY:');
    console.log('===========');
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Clarity Project ID: ${CLARITY_PROJECT_ID}`);

    if (stats.success > 0) {
        console.log('✅ Microsoft Clarity has been successfully installed on your gaming website!');
        console.log('🌐 You can now view user behavior analytics in your Microsoft Clarity dashboard.');
    } else {
        console.log('⚠️  No files were modified. Please check the report above for details.');
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    injectClarityCode,
    hasClarityCode,
    findGAInsertionPoint,
    CLARITY_CODE
};