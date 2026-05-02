/**
 * CommonJS Integration Test
 * Tests the package works correctly with CommonJS require() syntax
 */

const { expect } = require('chai');

describe('CommonJS Integration', function() {
  it('should import default export', function() {
    const ODudeSDK = require('../../src/index');
    expect(ODudeSDK).to.be.a('function');
    expect(ODudeSDK.name).to.equal('ODudeSDK');
  });

  it('should import named exports', function() {
    const { ODudeSDK, Registry, Resolver, TLD, RWAirdrop, utils } = require('../../src/index');
    
    expect(ODudeSDK).to.be.a('function');
    expect(Registry).to.be.a('function');
    expect(Resolver).to.be.a('function');
    expect(TLD).to.be.a('function');
    expect(RWAirdrop).to.be.a('function');
    expect(utils).to.be.an('object');
  });

  it('should import error classes', function() {
    const { 
      ODudeSDKError, 
      NameNotFoundError, 
      NetworkError,
      UnsupportedTLDError 
    } = require('../../src/index');
    
    expect(ODudeSDKError).to.be.a('function');
    expect(NameNotFoundError).to.be.a('function');
    expect(NetworkError).to.be.a('function');
    expect(UnsupportedTLDError).to.be.a('function');
  });

  it('should create SDK instance', function() {
    const ODudeSDK = require('../../src/index');
    const sdk = new ODudeSDK({
      rpcUrl: 'http://localhost:8545'
    });
    
    expect(sdk).to.be.instanceOf(ODudeSDK);
    expect(sdk.config).to.be.an('object');
    expect(sdk.config.rpcUrl).to.equal('http://localhost:8545');
  });

  it('should work with destructuring', function() {
    const { ODudeSDK: SDK, utils: helpers } = require('../../src/index');
    
    const sdk = new SDK();
    expect(sdk).to.be.instanceOf(SDK);
    
    const normalized = helpers.normalizeName('TEST@CRYPTO');
    expect(normalized).to.equal('test@crypto');
  });
});
