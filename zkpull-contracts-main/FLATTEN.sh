#!/bin/bash

# ============================================
# Quick Flatten Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Flattening zkPull Contracts${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Create flattened directory
mkdir -p flattened

# Flatten MantleUSD
echo -e "${YELLOW}[1/3] Flattening MantleUSD...${NC}"
forge flatten src/avs/MantleUSD.sol -o flattened/MantleUSD_flat.sol
echo -e "${GREEN}✓ MantleUSD flattened${NC}"
echo ""

# Flatten IssuesClaimWithAVS
echo -e "${YELLOW}[2/3] Flattening IssuesClaimWithAVS...${NC}"
forge flatten src/avs/IssuesClaimWithAVS.sol -o flattened/IssuesClaimWithAVS_flat.sol
echo -e "${GREEN}✓ IssuesClaimWithAVS flattened${NC}"
echo ""

# Flatten ZKPullAVS
echo -e "${YELLOW}[3/3] Flattening ZKPullAVS...${NC}"
forge flatten src/avs/ZKPullAVS.sol -o flattened/ZKPullAVS_flat.sol
echo -e "${GREEN}✓ ZKPullAVS flattened${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}All contracts flattened successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Flattened files:${NC}"
echo "  📄 flattened/MantleUSD_flat.sol"
echo "  📄 flattened/IssuesClaimWithAVS_flat.sol"
echo "  📄 flattened/ZKPullAVS_flat.sol"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Deploy contracts (if not deployed yet)"
echo "  2. Generate constructor args: ./generate_constructor_args.sh <ContractName>"
echo "  3. Verify on explorer: https://explorer.sepolia.mantle.xyz/"
echo ""
