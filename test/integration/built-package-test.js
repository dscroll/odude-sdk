/**
 * Built Package Integration Test
 * Tests the built package files work correctly
 */

const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('Built Package Integration', function() {
  const distPath = path.join(__dirname, '..', '..', 'dist');

  before(function() {
    // Ensure dist directory exists
    if (!fs.existsSync(distPath)) {
      throw new Error('Dist directory not found. Run "npm run build" first.');
    }
  });

  describe('CommonJS Build', function() {
    it('should load CommonJS build', function() {
      const cjsPath = path.join(distPath, 'index.cjs');
      expect(fs.existsSync(cjsPath), 'index.cjs should exist').to.be.true;
      
      // This should not throw
      const ODudeSDK = require(cjsPath);
      expect(ODudeSDK).to.be.a('function');
    });

    it('should have proper exports in CommonJS build', function() {
      const cjsPath = path.join(distPath, 'index.cjs');
      const exports = require(cjsPath);
      
      expect(exports).to.be.a('function'); // Default export
      expect(exports.ODudeSDK).to.be.a('function'); // Named export
      expect(exports.Registry).to.be.a('function');
      expect(exports.Resolver).to.be.a('function');
      expect(exports.utils).to.be.an('object');
    });
  });

  describe('TypeScript Declarations', function() {
    it('should have TypeScript declarations', function() {
      const dtsPath = path.join(distPath, 'index.d.ts');
      expect(fs.existsSync(dtsPath), 'index.d.ts should exist').to.be.true;
      
      const content = fs.readFileSync(dtsPath, 'utf8');
      expect(content).to.include('declare');
      expect(content).to.include('ODudeSDK');
    });

    it('should have valid TypeScript syntax', function() {
      const dtsPath = path.join(distPath, 'index.d.ts');
      const content = fs.readFileSync(dtsPath, 'utf8');
      
      // Basic syntax checks
      expect(content).to.match(/declare\s+class\s+\w+/);
      expect(content).to.match(/interface\s+\w+/);
      expect(content).to.match(/export\s+/);
    });
  });

  describe('File Sizes', function() {
    it('should have reasonable file sizes', function() {
      const files = [
        'index.cjs',
        'index.mjs',
        'index.umd.js',
        'index.browser.mjs',
        'index.d.ts'
      ];

      files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        
        // Files should not be empty
        expect(stats.size, `${file} should not be empty`).to.be.greaterThan(0);
        
        // Files should not be unreasonably large (> 5MB)
        expect(stats.size, `${file} should not be too large`).to.be.lessThan(5 * 1024 * 1024);
      });
    });

    it('UMD build should be minified', function() {
      const umdPath = path.join(distPath, 'index.umd.js');
      const content = fs.readFileSync(umdPath, 'utf8');
      
      // Minified files typically have fewer line breaks
      const lineCount = content.split('\n').length;
      expect(lineCount, 'UMD build should be minified').to.be.lessThan(100);
    });
  });

  describe('Source Maps', function() {
    it('should have source maps for all builds', function() {
      const mapFiles = [
        'index.cjs.map',
        'index.mjs.map',
        'index.umd.js.map',
        'index.browser.mjs.map'
      ];

      mapFiles.forEach(file => {
        const filePath = path.join(distPath, file);
        expect(fs.existsSync(filePath), `${file} should exist`).to.be.true;
        
        const content = fs.readFileSync(filePath, 'utf8');
        const sourceMap = JSON.parse(content);
        
        expect(sourceMap.version).to.equal(3);
        expect(sourceMap.sources).to.be.an('array');
        expect(sourceMap.mappings).to.be.a('string');
      });
    });
  });

  describe('Package.json Compatibility', function() {
    it('should have correct package.json exports', function() {
      const packagePath = path.join(__dirname, '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check main fields
      expect(pkg.main).to.equal('dist/index.cjs');
      expect(pkg.module).to.equal('dist/index.mjs');
      expect(pkg.types).to.equal('dist/index.d.ts');
      
      // Check exports
      expect(pkg.exports).to.be.an('object');
      expect(pkg.exports['.']).to.be.an('object');
      expect(pkg.exports['.'].types).to.equal('./dist/index.d.ts');
      expect(pkg.exports['.'].import).to.equal('./dist/index.mjs');
      expect(pkg.exports['.'].require).to.equal('./dist/index.cjs');
    });

    it('should have browser field', function() {
      const packagePath = path.join(__dirname, '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(pkg.browser).to.be.an('object');
      expect(pkg.browser['./dist/index.cjs']).to.equal('./dist/index.umd.js');
      expect(pkg.browser['./dist/index.mjs']).to.equal('./dist/index.browser.mjs');
    });
  });
});
