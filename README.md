# Enhanced SSI Application Testing Guide
This project showcases a self-sovereign identity flow using ACA-Py agents and a Bifold wallet. An issuer ACA-Py agent issues a VC with username, email, occupation, and citizenship to your mobile wallet. You then generate and share a proof of the VC with a verifier ACA-Py agent, demonstrating credential issuance, storage, and verification.

## Prerequisites
- Docker installed and running
- Node.js and npm/yarn installed
- Python 3.12+ installed
- Ngrok installed and configured
- Bifold wallet app installed on mobile device

## Testing Workflow


```
# Terminal 1: Start ACAPY agent
cd acapy/demo
LEDGER_URL=http://dev.greenlight.bcovrin.vonx.io ./run_demo faber

# Terminal 2: Start issuer API
cd ssi-tutorial/demo/acapy
npm run issuer

# Terminal 3: Start verifier API (optional, for separate verifier)
cd ssi-tutorial/demo/acapy
npm run verifier

# Terminal 4: Start web interface
cd ssi-tutorial/interface
npm run dev
```

### Step 1: Start ACAPY Agent (Required First!)

```bash
# In a separate terminal, navigate to the cloned acapy directory
cd acapy/demo

# Start ngrok for port 8020
ngrok http 8020

# Start the ACAPY agent (this must be running before our API server)
LEDGER_URL=http://dev.greenlight.bcovrin.vonx.io ./run_demo faber
```

**Expected Output:**
- ACAPY agent starts on port 8021 (admin API)
- Agent connects to BCovrin test ledger
- Ngrok provides public endpoint

### Step 2: Start API Server

```bash
# In the ssi-tutorial directory
cd demo/acapy

# Start issuer server
npm run issuer
```

**Expected Output:**
- ✅ "Registering schema to the ledger ...."
- ✅ "Schema Id: [some_schema_id]"
- ✅ "Registering credential definition to the ledger...."
- ✅ "Credential Definition Id: [some_cred_def_id]"
- ✅ "Server running on http://localhost:4000"

### Step 3: Start Verifier Server (Optional)

```bash
# In another terminal
cd demo/acapy
npm run verifier
```

### Step 4: Start Web Interface

```bash
cd interface
npm run dev
```

**Expected Output:**
- ✅ Interface running on http://localhost:3000

## Testing the Enhanced Attributes

### Test 1: Schema Registration
**Verify**: Check console output shows new schema with attributes: `["username", "email", "occupation", "citizenship"]`

### Test 2: Credential Issuance Form
1. Open http://localhost:3000
2. Navigate through issuer stepper to credential issuance step
3. **Verify**: Form shows fields for:
   - Username
   - Email
   - Occupation
   - Citizenship

### Test 3: API Integration
**Test API directly:**
```bash
curl -X POST http://localhost:4000/v2/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "test-connection",
    "username": "alice_smith",
    "email": "alice@example.com",
    "occupation": "Data Scientist",
    "citizenship": "Canada"
  }'
```

**Expected**: API accepts new parameters without errors

### Test 4: Proof Request
**Test proof request API:**
```bash
curl -X POST http://localhost:4000/v2/send-proof-request \
  -H "Content-Type: application/json" \
  -d '{
    "proofRequestlabel": "Identity Verification",
    "connectionId": "test-connection",
    "version": "1.0"
  }'
```

**Expected**: Proof request asks for `occupation` and `citizenship` attributes

## End-to-End Testing with Bifold Wallet

### Complete Workflow Test:
1. **Connection**: Generate QR code, scan with Bifold
2. **Credential Issuance**:
   - Fill form with: username="john_doe", email="john@test.com", occupation="Developer", citizenship="USA"
   - Submit form
   - Accept credential in Bifold wallet
3. **Proof Verification**:
   - Request proof from verifier
   - Share proof from Bifold wallet
   - Verify occupation="Developer" and citizenship="USA" are displayed

## Troubleshooting

### Common Issues:

1. **"ECONNREFUSED 127.0.0.1:8021"**
   - **Solution**: Start ACAPY agent first before API server

2. **"Schema registration failed"**
   - **Solution**: Check ACAPY agent is connected to ledger
   - Verify ngrok is running and accessible

3. **"Credential issuance failed"**
   - **Solution**: Ensure schema and credential definition were registered successfully
   - Check connection exists between issuer and holder

4. **"Proof verification shows old attributes"**
   - **Solution**: Clear browser cache and restart servers
   - Ensure using updated proof controller

## Success Criteria

✅ **Schema**: New schema registered with 4 attributes
✅ **API**: Accepts username, email, occupation, citizenship parameters
✅ **UI**: Form displays new input fields
✅ **Credential**: Bifold wallet shows new attributes
✅ **Proof**: Verification displays occupation and citizenship
✅ **Workflow**: Complete issuer → holder → verifier flow works

## Rollback Plan

If issues occur, revert these files to restore original functionality:
- `demo/acapy/utils/schema-credDef.ts`
- `demo/acapy/controllers/v2/credential.controller.ts`
- `demo/acapy/controllers/v2/proof.controller.ts`
- `interface/src/components/AcceptCredential.jsx`
- `interface/src/components/ShareProof.jsx`
