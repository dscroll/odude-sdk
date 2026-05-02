/**
 * Build System and Import/Export Test
 * 
 * Test Motive:
 * This test verifies that the SDK works correctly with different import/export patterns
 * and that the build system produces compatible outputs for various environments.
 * 
 * Functions tested:
 * - CommonJS require() syntax
 * - ES Module import syntax (where supported)
 * - Default and named exports
 * - Error class exports
 * - Utility exports
 * - TypeScript compatibility
 * 
 * How to run:
 * npm test
 * or
 * npx mocha test/build-system.test.js --timeout 10000
 */

const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('Build System and Exports', function() {
  
  describe('CommonJS Exports', function() {
    let ODudeSDK, Registry, Resolver, TLD, RWAirdrop, utils;
    let ODudeSDKError, NameNotFoundError, NetworkError;

    before(function() {
      // Test CommonJS require syntax
      ODudeSDK = require('../src/index');
      
      // Test named exports
      const exports = require('../src/index');
      Registry = exports.Registry;
      Resolver = exports.Resolver;
      TLD = exports.TLD;
      RWAirdrop = exports.RWAirdrop;
      utils = exports.utils;
      
      // Test error exports
      ODudeSDKError = exports.ODudeSDKError;
      NameNotFoundError = exports.NameNotFoundError;
      NetworkError = exports.NetworkError;
    });

    it('should export ODudeSDK as default', function() {
      expect(ODudeSDK).to.be.a('function');
      expect(ODudeSDK.name).to.equal('ODudeSDK');
    });

    it('should export contract classes', function() {
      expect(Registry).to.be.a('function');
      expect(Registry.name).to.equal('Registry');
      
      expect(Resolver).to.be.a('function');
      expect(Resolver.name).to.equal('Resolver');
      
      expect(TLD).to.be.a('function');
      expect(TLD.name).to.equal('TLD');
      
      expect(RWAirdrop).to.be.a('function');
      expect(RWAirdrop.name).to.equal('RWAirdrop');
    });

    it('should export utilities', function() {
      expect(utils).to.be.an('object');
      expect(utils.normalizeName).to.be.a('function');
      expect(utils.extractTLD).to.be.a('function');
      expect(utils.parseName).to.be.a('function');
    });

    it('should export error classes', function() {
      expect(ODudeSDKError).to.be.a('function');
      expect(NameNotFoundError).to.be.a('function');
      expect(NetworkError).to.be.a('function');
      
      // Test error inheritance
      const error = new NameNotFoundError('test');
      expect(error).to.be.instanceOf(ODudeSDKError);
      expect(error).to.be.instanceOf(Error);
    });

    it('should support destructuring import', function() {
      const { ODudeSDK: SDK, Registry: Reg, utils: helpers } = require('../src/index');
      
      expect(SDK).to.be.a('function');
      expect(SDK.name).to.equal('ODudeSDK');
      expect(Reg).to.be.a('function');
      expect(Reg.name).to.equal('Registry');
      expect(helpers).to.be.an('object');
    });
  });

  describe('Built Files', function() {
    const distPath = path.join(__dirname, '..', 'dist');

    it('should have generated all build outputs', function() {
      const expectedFiles = [
        'index.cjs',
        'index.mjs', 
        'index.umd.js',
        'index.browser.mjs',
        'index.d.ts'
      ];

      expectedFiles.forEach(file => {
        const filePath = path.join(distPath, file);
        expect(fs.existsSync(filePath), `${file} should exist`).to.be.true;
      });
    });

    it('should have source maps for all builds', function() {
      const expectedMaps = [
        'index.cjs.map',
        'index.mjs.map',
        'index.umd.js.map',
        'index.browser.mjs.map'
      ];

      expectedMaps.forEach(file => {
        const filePath = path.join(distPath, file);
        expect(fs.existsSync(filePath), `${file} should exist`).to.be.true;
      });
    });

    it('should have TypeScript declarations', function() {
      const dtsPath = path.join(distPath, 'index.d.ts');
      expect(fs.existsSync(dtsPath)).to.be.true;
      
      const content = fs.readFileSync(dtsPath, 'utf8');
      expect(content).to.include('declare');
      expect(content).to.include('ODudeSDK');
    });

    it('CommonJS build should be valid', function() {
      const cjsPath = path.join(distPath, 'index.cjs');
      const content = fs.readFileSync(cjsPath, 'utf8');
      
      // Should use CommonJS exports
      expect(content).to.include('exports');
      expect(content).to.include('module.exports');
    });

    it('ESM build should be valid', function() {
      const esmPath = path.join(distPath, 'index.mjs');
      const content = fs.readFileSync(esmPath, 'utf8');
      
      // Should use ES module exports
      expect(content).to.include('export');
    });

    it('UMD build should be valid', function() {
      const umdPath = path.join(distPath, 'index.umd.js');
      const content = fs.readFileSync(umdPath, 'utf8');
      
      // Should define UMD pattern
      expect(content).to.include('ODudeSDK');
      // Should be minified
      expect(content.split('\n').length).to.be.lessThan(50);
    });
  });

  describe('SDK Instantiation', function() {
    it('should create SDK instance with default export', function() {
      const ODudeSDK = require('../src/index');
      const sdk = new ODudeSDK();
      
      expect(sdk).to.be.instanceOf(ODudeSDK);
      expect(sdk.config).to.be.an('object');
      expect(sdk.providers).to.be.an('object');
      expect(sdk.contracts).to.be.an('object');
    });

    it('should create SDK instance with named export', function() {
      const { ODudeSDK } = require('../src/index');
      const sdk = new ODudeSDK();
      
      expect(sdk).to.be.instanceOf(ODudeSDK);
    });

    it('should work with configuration', function() {
      const ODudeSDK = require('../src/index');
      const config = {
        rpcUrl: 'http://localhost:8545',
        privateKey: '0x' + '1'.repeat(64)
      };
      
      const sdk = new ODudeSDK(config);
      expect(sdk.config).to.deep.include(config);
    });
  });

  describe('Error Handling', function() {
    it('should throw proper error types', function() {
      const { NameNotFoundError, NetworkError } = require('../src/index');

      const nameError = new NameNotFoundError('test@crypto');
      expect(nameError.message).to.include('test@crypto');
      expect(nameError.name).to.equal('NameNotFoundError');
      expect(nameError.domainName).to.equal('test@crypto');

      const networkError = new NetworkError('Connection failed', 'ethereum');
      expect(networkError.message).to.include('Connection failed');
      expect(networkError.networkName).to.equal('ethereum');
    });
  });

  describe('Utilities', function() {
    it('should export working utilities', function() {
      const { utils } = require('../src/index');
      
      // Test name normalization
      const normalized = utils.normalizeName('TEST@CRYPTO');
      expect(normalized).to.equal('test@crypto');
      
      // Test TLD extraction
      const tld = utils.extractTLD('alice@crypto');
      expect(tld).to.equal('crypto');
      
      // Test name parsing
      const parsed = utils.parseName('sub@alice@crypto');
      expect(parsed).to.be.an('object');
      expect(parsed.tld).to.equal('crypto');
      expect(parsed.parts).to.deep.equal(['sub', 'alice', 'crypto']);
    });
  });
});
