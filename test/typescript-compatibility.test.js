/**
 * TypeScript Compatibility Test
 * 
 * Test Motive:
 * This test verifies that the SDK provides proper TypeScript support including
 * type definitions, proper exports, and compatibility with TypeScript projects.
 * 
 * Functions tested:
 * - TypeScript declaration files exist and are valid
 * - Type exports are available
 * - Interface definitions are correct
 * - Generic types work properly
 * 
 * How to run:
 * npm test
 * or
 * npx mocha test/typescript-compatibility.test.js --timeout 10000
 */

const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

describe('TypeScript Compatibility', function() {
  
  describe('Type Declaration Files', function() {
    const srcPath = path.join(__dirname, '..', 'src');
    const distPath = path.join(__dirname, '..', 'dist');

    it('should have main type declarations', function() {
      const mainTypes = path.join(srcPath, 'types.d.ts');
      expect(fs.existsSync(mainTypes), 'types.d.ts should exist').to.be.true;
      
      const content = fs.readFileSync(mainTypes, 'utf8');
      expect(content).to.include('ODudeSDKConfig');
      expect(content).to.include('NetworkInfo');
      expect(content).to.include('NameInfo');
    });

    it('should have SDK type declarations', function() {
      const sdkTypes = path.join(srcPath, 'ODudeSDK.d.ts');
      expect(fs.existsSync(sdkTypes), 'ODudeSDK.d.ts should exist').to.be.true;
      
      const content = fs.readFileSync(sdkTypes, 'utf8');
      expect(content).to.include('declare class ODudeSDK');
      expect(content).to.include('constructor(config?: ODudeSDKConfig)');
    });

    it('should have contract type declarations', function() {
      const contractTypes = path.join(srcPath, 'contracts', 'types.d.ts');
      expect(fs.existsSync(contractTypes), 'contracts/types.d.ts should exist').to.be.true;
      
      const content = fs.readFileSync(contractTypes, 'utf8');
      expect(content).to.include('declare class Registry');
      expect(content).to.include('declare class Resolver');
      expect(content).to.include('declare class TLD');
      expect(content).to.include('declare class RWAirdrop');
    });

    it('should have index type declarations', function() {
      const indexTypes = path.join(srcPath, 'index.d.ts');
      expect(fs.existsSync(indexTypes), 'index.d.ts should exist').to.be.true;
      
      const content = fs.readFileSync(indexTypes, 'utf8');
      expect(content).to.include('export { ODudeSDK as default }');
      expect(content).to.include('export { ODudeSDK }');
    });

    it('should have built type declarations', function() {
      const builtTypes = path.join(distPath, 'index.d.ts');
      expect(fs.existsSync(builtTypes), 'dist/index.d.ts should exist').to.be.true;
      
      const content = fs.readFileSync(builtTypes, 'utf8');
      expect(content).to.include('declare');
    });
  });

  describe('Type Definition Content', function() {
    let typesContent, sdkContent, contractsContent, indexContent;

    before(function() {
      const srcPath = path.join(__dirname, '..', 'src');
      typesContent = fs.readFileSync(path.join(srcPath, 'types.d.ts'), 'utf8');
      sdkContent = fs.readFileSync(path.join(srcPath, 'ODudeSDK.d.ts'), 'utf8');
      contractsContent = fs.readFileSync(path.join(srcPath, 'contracts', 'types.d.ts'), 'utf8');
      indexContent = fs.readFileSync(path.join(srcPath, 'index.d.ts'), 'utf8');
    });

    it('should define configuration interfaces', function() {
      expect(typesContent).to.include('interface ODudeSDKConfig');
      expect(typesContent).to.include('interface ContractAddresses');
      expect(typesContent).to.include('interface NetworkConfig');
      expect(typesContent).to.include('interface NetworkInfo');
    });

    it('should define data interfaces', function() {
      expect(typesContent).to.include('interface NameInfo');
      expect(typesContent).to.include('interface NFTMetadata');
      expect(typesContent).to.include('interface ResolutionRecord');
      expect(typesContent).to.include('interface AirdropInfo');
    });

    it('should define error classes', function() {
      expect(typesContent).to.include('class ODudeSDKError');
      expect(typesContent).to.include('class TokenNotFoundError');
      expect(typesContent).to.include('class NameNotFoundError');
      expect(typesContent).to.include('class NetworkError');
    });

    it('should define utility interfaces', function() {
      expect(typesContent).to.include('interface HelperUtils');
      expect(typesContent).to.include('interface ParsedName');
    });

    it('should define callback types', function() {
      expect(typesContent).to.include('type TransferCallback');
      expect(typesContent).to.include('type NameResolvedCallback');
      expect(typesContent).to.include('type DomainMintedCallback');
    });

    it('should define SDK class properly', function() {
      expect(sdkContent).to.include('declare class ODudeSDK');
      expect(sdkContent).to.include('constructor(config?: ODudeSDKConfig)');
      expect(sdkContent).to.include('resolve(name: string): Promise<string>');
      expect(sdkContent).to.include('getNameInfo(name: string): Promise<NameInfo>');
    });

    it('should define contract classes properly', function() {
      expect(contractsContent).to.include('declare class Registry');
      expect(contractsContent).to.include('declare class Resolver');
      expect(contractsContent).to.include('declare class TLD');
      expect(contractsContent).to.include('declare class RWAirdrop');
    });

    it('should have proper method signatures', function() {
      // Registry methods
      expect(contractsContent).to.include('totalSupply(): Promise<bigint>');
      expect(contractsContent).to.include('ownerOf(tokenId: BigNumberish): Promise<string>');
      
      // Resolver methods
      expect(contractsContent).to.include('resolve(name: string): Promise<string>');
      expect(contractsContent).to.include('reverse(address: string): Promise<string>');
      
      // TLD methods
      expect(contractsContent).to.include('getBaseTLDPrice(): Promise<bigint>');
      expect(contractsContent).to.include('checkMintEligibility(domainName: string): Promise<MintEligibility>');
    });

    it('should export types properly', function() {
      expect(indexContent).to.include('export { ODudeSDK as default }');
      expect(indexContent).to.include('export { ODudeSDK }');
      expect(indexContent).to.include('export { Registry, Resolver, TLD, RWAirdrop }');
      expect(indexContent).to.include('export * from \'./types\'');
    });
  });

  describe('TypeScript Configuration', function() {
    it('should have valid tsconfig.json', function() {
      const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath), 'tsconfig.json should exist').to.be.true;
      
      const content = fs.readFileSync(tsconfigPath, 'utf8');
      const config = JSON.parse(content);
      
      expect(config.compilerOptions).to.be.an('object');
      expect(config.compilerOptions.target).to.equal('ES2020');
      expect(config.compilerOptions.module).to.equal('ESNext');
      expect(config.compilerOptions.declaration).to.be.true;
      expect(config.compilerOptions.strict).to.be.true;
    });
  });

  describe('Package.json TypeScript Support', function() {
    it('should have proper TypeScript configuration in package.json', function() {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const pkg = JSON.parse(content);
      
      expect(pkg.types).to.equal('dist/index.d.ts');
      expect(pkg.exports['.']).to.have.property('types');
      expect(pkg.exports['.'].types).to.equal('./dist/index.d.ts');
      
      // Should have TypeScript in devDependencies
      expect(pkg.devDependencies).to.have.property('typescript');
      expect(pkg.devDependencies).to.have.property('@types/node');
    });
  });

  describe('Import Compatibility', function() {
    it('should support CommonJS require', function() {
      // This should not throw
      const ODudeSDK = require('../src/index');
      expect(ODudeSDK).to.be.a('function');
    });

    it('should support named imports', function() {
      const { ODudeSDK, Registry, utils } = require('../src/index');
      expect(ODudeSDK).to.be.a('function');
      expect(Registry).to.be.a('function');
      expect(utils).to.be.an('object');
    });

    it('should support error imports', function() {
      const { NameNotFoundError, NetworkError } = require('../src/index');
      expect(NameNotFoundError).to.be.a('function');
      expect(NetworkError).to.be.a('function');
    });
  });

  describe('Type Safety', function() {
    it('should provide proper error types', function() {
      const { NameNotFoundError } = require('../src/index');
      const error = new NameNotFoundError('test@crypto');

      expect(error.name).to.equal('NameNotFoundError');
      expect(error.code).to.equal('NAME_NOT_FOUND');
      expect(error).to.have.property('domainName', 'test@crypto');
    });

    it('should provide utility functions with proper signatures', function() {
      const { utils } = require('../src/index');
      
      // These should work without type errors
      const normalized = utils.normalizeName('TEST@CRYPTO');
      expect(normalized).to.be.a('string');
      
      const tld = utils.extractTLD('alice@crypto');
      expect(tld).to.be.a('string');
      
      const parsed = utils.parseName('sub@alice@crypto');
      expect(parsed).to.be.an('object');
      expect(parsed).to.have.property('tld');
      expect(parsed).to.have.property('parts');
    });
  });
});
