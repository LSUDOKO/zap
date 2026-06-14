#!/bin/bash

# Deploy AVS System to Mantle Sepolia
# Usage: ./DEPLOY_AVS.sh

set -e

echo "🚀 Deploying zkPull AVS System to Mantle Sepolia..."
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found!"
    echo "Please create .env file with required variables"
    exit 1
fi

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env"
    exit 1
fi

if [ -z "$VALIDATOR_ADDRESS" ]; then
    echo "❌ VALIDATOR_ADDRESS not set in .env"
    exit 1
fi

# Set default values
MINIMUM_STAKE=${MINIMUM_STAKE:-100000000000000000000} # 100 mUSD
RPC_URL=${MANTLE_SEPOLIA_RPC_URL:-https://rpc.sepolia.mantle.xyz}

echo "📋 Configuration:"
echo "   RPC URL: $RPC_URL"
echo "   Validator: $VALIDATOR_ADDRESS"
echo "   Minimum Stake: $MINIMUM_STAKE wei (100 mUSD)"
echo ""

# Compile contracts (skip tests)
echo "🔨 Compiling contracts..."
forge build --skip test

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful"
echo ""

# Deploy contracts
echo "📤 Deploying contracts..."
DEPLOY_OUTPUT=$(forge script script/DeployAVS.s.sol \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --legacy \
    -vvv)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "$DEPLOY_OUTPUT"

# Extract contract addresses from output
MUSD_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "MantleUSD (mUSD):" | awk '{print $3}')
ISSUES_CLAIM_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "IssuesClaimWithAVS:" | awk '{print $2}')
AVS_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "ZKPullAVS:" | awk '{print $2}')

if [ -z "$MUSD_ADDRESS" ] || [ -z "$ISSUES_CLAIM_ADDRESS" ] || [ -z "$AVS_ADDRESS" ]; then
    echo "⚠️  Could not extract contract addresses from output"
    echo "Please check the deployment output above and manually update .env"
else
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Updating .env file..."
    
    # Update .env file
    if grep -q "MUSD_TOKEN_ADDRESS=" .env; then
        sed -i.bak "s/MUSD_TOKEN_ADDRESS=.*/MUSD_TOKEN_ADDRESS=$MUSD_ADDRESS/" .env
    else
        echo "MUSD_TOKEN_ADDRESS=$MUSD_ADDRESS" >> .env
    fi
    
    if grep -q "ISSUES_CLAIM_ADDRESS=" .env; then
        sed -i.bak "s/ISSUES_CLAIM_ADDRESS=.*/ISSUES_CLAIM_ADDRESS=$ISSUES_CLAIM_ADDRESS/" .env
    else
        echo "ISSUES_CLAIM_ADDRESS=$ISSUES_CLAIM_ADDRESS" >> .env
    fi
    
    if grep -q "AVS_CONTRACT_ADDRESS=" .env; then
        sed -i.bak "s/AVS_CONTRACT_ADDRESS=.*/AVS_CONTRACT_ADDRESS=$AVS_ADDRESS/" .env
    else
        echo "AVS_CONTRACT_ADDRESS=$AVS_ADDRESS" >> .env
    fi
    
    # Also update operator .env
    if [ -f operator/.env ]; then
        if grep -q "AVS_CONTRACT_ADDRESS=" operator/.env; then
            sed -i.bak "s/AVS_CONTRACT_ADDRESS=.*/AVS_CONTRACT_ADDRESS=$AVS_ADDRESS/" operator/.env
        else
            echo "AVS_CONTRACT_ADDRESS=$AVS_ADDRESS" >> operator/.env
        fi
        
        if grep -q "MUSD_TOKEN_ADDRESS=" operator/.env; then
            sed -i.bak "s/MUSD_TOKEN_ADDRESS=.*/MUSD_TOKEN_ADDRESS=$MUSD_ADDRESS/" operator/.env
        else
            echo "MUSD_TOKEN_ADDRESS=$MUSD_ADDRESS" >> operator/.env
        fi
    fi
    
    echo "✅ .env files updated"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📍 Contract Addresses:"
echo "   MantleUSD (mUSD): $MUSD_ADDRESS"
echo "   IssuesClaimWithAVS: $ISSUES_CLAIM_ADDRESS"
echo "   ZKPullAVS: $AVS_ADDRESS"
echo ""
echo "🔗 Explorer Links:"
echo "   mUSD: https://explorer.sepolia.mantle.xyz/address/$MUSD_ADDRESS"
echo "   IssuesClaim: https://explorer.sepolia.mantle.xyz/address/$ISSUES_CLAIM_ADDRESS"
echo "   AVS: https://explorer.sepolia.mantle.xyz/address/$AVS_ADDRESS"
echo ""
echo "📋 Next Steps:"
echo "   1. Get mUSD tokens (already minted to deployer)"
echo "   2. Transfer mUSD to operators"
echo "   3. Register as operator:"
echo "      cd operator && npm run register"
echo "   4. Start operator bot:"
echo "      npm start"
echo ""
echo "💡 Tip: Save these addresses for future reference!"
