#!/usr/bin/env node

/**
 * Verification script to check if ODude SDK is properly set up
 * Run with: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ODude SDK Setup Verification\n');

let allChecks = true;

// Check 1: Node version
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 16) {
  console.log(`   ✅ Node.js ${nodeVersion} (>= 16.0.0)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (requires >= 16.0.0)\n`);
  allChecks = false;
}

// Check 2: Required files
console.log('2. Checking required files...');
const requiredFiles = [
  'package.json',
  'src/index.js',
  'src/ODudeSDK.js',
  'src/contracts/Registry.js',
  'src/contracts/Resolver.js',
  'src/contracts/TLD.js',
  'src/contracts/RWAirdrop.js',
  'src/utils/helpers.js',
  'abi/Registry.json',
  'abi/Resolver.json',
  'abi/TLD.json',
  'abi/RWAirdrop.json',
  'localhost-deployment.json',
  'README.md'
];

let filesOk = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
    filesOk = false;
    allChecks = false;
  }
}
if (filesOk) {
  console.log('   All required files present\n');
} else {
  console.log('   Some files are missing\n');
}

// Check 3: Dependencies
console.log('3. Checking dependencies...');
try {
  const packageJson = require('../package.json');
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules directory exists');
    
    // Check for ethers
    const ethersPath = path.join(nodeModulesPath, 'ethers');
    if (fs.existsSync(ethersPath)) {
      console.log('   ✅ ethers.js installed');
    } else {
      console.log('   ❌ ethers.js not installed (run: npm install)');
      allChecks = false;
    }
    
    // Check for dev dependencies
    const mochaPath = path.join(nodeModulesPath, 'mocha');
    const chaiPath = path.join(nodeModulesPath, 'chai');
    if (fs.existsSync(mochaPath) && fs.existsSync(chaiPath)) {
      console.log('   ✅ Test dependencies installed');
    } else {
      console.log('   ⚠️  Test dependencies not installed (run: npm install)');
    }
  } else {
    console.log('   ❌ node_modules not found (run: npm install)');
    allChecks = false;
  }
  console.log();
} catch (error) {
  console.log('   ❌ Error checking dependencies:', error.message);
  allChecks = false;
  console.log();
}

// Check 4: Test SDK import
console.log('4. Testing SDK import...');
try {
  const ODudeSDK = require('../src/index');
  if (typeof ODudeSDK === 'function') {
    console.log('   ✅ ODudeSDK class can be imported');
  } else {
    console.log('   ❌ ODudeSDK import failed');
    allChecks = false;
  }
  
  // Check exports
  if (ODudeSDK.Registry && ODudeSDK.Resolver && ODudeSDK.TLD && ODudeSDK.RWAirdrop) {
    console.log('   ✅ All contract wrappers exported');
  } else {
    console.log('   ❌ Some contract wrappers not exported');
    allChecks = false;
  }
  
  if (ODudeSDK.utils) {
    console.log('   ✅ Utilities exported');
  } else {
    console.log('   ❌ Utilities not exported');
    allChecks = false;
  }
  console.log();
} catch (error) {
  console.log('   ❌ Error importing SDK:', error.message);
  allChecks = false;
  console.log();
}

// Check 5: Deployment configuration
console.log('5. Checking deployment configuration...');
try {
  const deployment = require('../localhost-deployment.json');
  if (deployment.contracts) {
    const contracts = ['Registry', 'Resolver', 'TLD', 'RWAirdrop'];
    let configOk = true;
    for (const contract of contracts) {
      if (deployment.contracts[contract] && deployment.contracts[contract].address) {
        console.log(`   ✅ ${contract} address configured`);
      } else {
        console.log(`   ❌ ${contract} address missing`);
        configOk = false;
        allChecks = false;
      }
    }
    if (configOk) {
      console.log('   All contract addresses configured\n');
    }
  } else {
    console.log('   ❌ Invalid deployment configuration\n');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error reading deployment config:', error.message);
  allChecks = false;
  console.log();
}

// Check 6: Test files
console.log('6. Checking test files...');
const testFiles = [
  'test/Registry.test.js',
  'test/Resolver.test.js',
  'test/TLD.test.js',
  'test/RWAirdrop.test.js',
  'test/ODudeSDK.test.js',
  'test/helpers.test.js'
];

let testsOk = true;
for (const file of testFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
    testsOk = false;
  }
}
if (testsOk) {
  console.log('   All test files present\n');
} else {
  console.log('   Some test files are missing\n');
}

// Check 7: Example files
console.log('7. Checking example files...');
const exampleFiles = [
  'examples/basic-usage.js',
  'examples/resolve-names.js',
  'examples/check-airdrop.js',
  'examples/tld-management.js'
];

let examplesOk = true;
for (const file of exampleFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
    examplesOk = false;
  }
}
if (examplesOk) {
  console.log('   All example files present\n');
} else {
  console.log('   Some example files are missing\n');
}

// Final summary
console.log('═'.repeat(50));
if (allChecks) {
  console.log('✅ All checks passed! ODude SDK is properly set up.\n');
  console.log('Next steps:');
  console.log('  1. Start a local Hardhat node with ODude contracts');
  console.log('  2. Run tests: npm test');
  console.log('  3. Try examples: npm run example:basic');
  console.log('  4. Read the documentation: README.md');
} else {
  console.log('❌ Some checks failed. Please review the issues above.\n');
  console.log('Common fixes:');
  console.log('  - Run: npm install');
  console.log('  - Ensure all files are present');
  console.log('  - Check Node.js version (>= 16.0.0)');
}
console.log('═'.repeat(50));

process.exit(allChecks ? 0 : 1);

