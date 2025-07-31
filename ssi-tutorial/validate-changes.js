#!/usr/bin/env node

/**
 * Validation script for Enhanced SSI Application changes
 * This script checks if all the required changes have been made correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Enhanced SSI Application Changes...\n');

const validations = [];

// Check 1: Schema attributes updated
try {
  const schemaFile = fs.readFileSync('demo/acapy/utils/schema-credDef.ts', 'utf8');
  const hasNewAttributes = schemaFile.includes('"username"') && 
                          schemaFile.includes('"email"') && 
                          schemaFile.includes('"occupation"') && 
                          schemaFile.includes('"citizenship"');
  const hasOldAttributes = schemaFile.includes('"name"') || 
                          schemaFile.includes('"age"') || 
                          schemaFile.includes('"department"');
  
  if (hasNewAttributes && !hasOldAttributes) {
    validations.push({ test: 'Schema attributes updated', status: '✅ PASS' });
  } else {
    validations.push({ test: 'Schema attributes updated', status: '❌ FAIL', details: 'Schema still contains old attributes or missing new ones' });
  }
} catch (error) {
  validations.push({ test: 'Schema attributes updated', status: '❌ ERROR', details: error.message });
}

// Check 2: Credential controller updated
try {
  const credentialFile = fs.readFileSync('demo/acapy/controllers/v2/credential.controller.ts', 'utf8');
  const hasNewParams = credentialFile.includes('username, email, occupation, citizenship');
  const hasNewAttributes = credentialFile.includes("name: 'username'") && 
                          credentialFile.includes("name: 'occupation'") && 
                          credentialFile.includes("name: 'citizenship'");
  
  if (hasNewParams && hasNewAttributes) {
    validations.push({ test: 'Credential controller updated', status: '✅ PASS' });
  } else {
    validations.push({ test: 'Credential controller updated', status: '❌ FAIL', details: 'Missing new parameter handling or attribute mapping' });
  }
} catch (error) {
  validations.push({ test: 'Credential controller updated', status: '❌ ERROR', details: error.message });
}

// Check 3: Proof controller updated
try {
  const proofFile = fs.readFileSync('demo/acapy/controllers/v2/proof.controller.ts', 'utf8');
  const hasOccupationAttr = proofFile.includes('occupation_attr') && proofFile.includes("names: ['occupation']");
  const hasCitizenshipAttr = proofFile.includes('citizenship_attr') && proofFile.includes("names: ['citizenship']");
  const removedAgePredicates = !proofFile.includes("name: 'age'");
  
  if (hasOccupationAttr && hasCitizenshipAttr && removedAgePredicates) {
    validations.push({ test: 'Proof controller updated', status: '✅ PASS' });
  } else {
    validations.push({ test: 'Proof controller updated', status: '❌ FAIL', details: 'Missing new attribute requests or still has old age predicates' });
  }
} catch (error) {
  validations.push({ test: 'Proof controller updated', status: '❌ ERROR', details: error.message });
}

// Check 4: AcceptCredential form updated
try {
  const acceptCredFile = fs.readFileSync('interface/src/components/AcceptCredential.jsx', 'utf8');
  const hasFormInputs = acceptCredFile.includes('name="username"') && 
                       acceptCredFile.includes('name="email"') && 
                       acceptCredFile.includes('name="occupation"') && 
                       acceptCredFile.includes('name="citizenship"');
  const hasFormState = acceptCredFile.includes('username:') && 
                      acceptCredFile.includes('occupation:') && 
                      acceptCredFile.includes('citizenship:');
  
  if (hasFormInputs && hasFormState) {
    validations.push({ test: 'AcceptCredential form updated', status: '✅ PASS' });
  } else {
    validations.push({ test: 'AcceptCredential form updated', status: '❌ FAIL', details: 'Missing form inputs or state management for new attributes' });
  }
} catch (error) {
  validations.push({ test: 'AcceptCredential form updated', status: '❌ ERROR', details: error.message });
}

// Check 5: ShareProof display updated
try {
  const shareProofFile = fs.readFileSync('interface/src/components/ShareProof.jsx', 'utf8');
  const hasOccupationDisplay = shareProofFile.includes('occupation') && shareProofFile.includes('setOccupation');
  const hasCitizenshipDisplay = shareProofFile.includes('citizenship') && shareProofFile.includes('setCitizenship');
  const removedOldDisplays = !shareProofFile.includes('setDepartment') && !shareProofFile.includes('predicateValue');
  
  if (hasOccupationDisplay && hasCitizenshipDisplay && removedOldDisplays) {
    validations.push({ test: 'ShareProof display updated', status: '✅ PASS' });
  } else {
    validations.push({ test: 'ShareProof display updated', status: '❌ FAIL', details: 'Missing new attribute displays or still has old department/age displays' });
  }
} catch (error) {
  validations.push({ test: 'ShareProof display updated', status: '❌ ERROR', details: error.message });
}

// Print results
console.log('Validation Results:');
console.log('==================');
validations.forEach(validation => {
  console.log(`${validation.status} ${validation.test}`);
  if (validation.details) {
    console.log(`   Details: ${validation.details}`);
  }
});

const passCount = validations.filter(v => v.status === '✅ PASS').length;
const totalCount = validations.length;

console.log(`\n📊 Summary: ${passCount}/${totalCount} validations passed`);

if (passCount === totalCount) {
  console.log('\n🎉 All validations passed! The Enhanced SSI Application is ready for testing.');
  console.log('\n📋 Next Steps:');
  console.log('1. Start ACAPY agent: cd acapy/demo && ./run_demo faber');
  console.log('2. Start API server: cd demo/acapy && npm run issuer');
  console.log('3. Start web interface: cd interface && npm run dev');
  console.log('4. Test with Bifold wallet');
} else {
  console.log('\n⚠️  Some validations failed. Please review the changes before testing.');
  process.exit(1);
}