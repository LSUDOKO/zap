.PHONY: help install build test clean deploy-mantle-sepolia verify-mantle interact-mantle

# Load environment variables
include .env
export

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)zkPull Contracts - Makefile Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-30s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	forge install
	@echo "$(GREEN)Dependencies installed!$(NC)"

build: ## Build contracts
	@echo "$(GREEN)Building contracts...$(NC)"
	forge build
	@echo "$(GREEN)Build complete!$(NC)"

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	forge test -vvv

test-gas: ## Run tests with gas report
	@echo "$(GREEN)Running tests with gas report...$(NC)"
	forge test --gas-report

test-coverage: ## Run test coverage
	@echo "$(GREEN)Running test coverage...$(NC)"
	forge coverage

test-fuzz: ## Run fuzz tests
	@echo "$(GREEN)Running fuzz tests...$(NC)"
	forge test --match-path "test/IssuesClaimFuzz.t.sol" -vvv

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	forge clean
	rm -rf cache out broadcast
	@echo "$(GREEN)Clean complete!$(NC)"

format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	forge fmt

check-env: ## Check environment variables
	@echo "$(GREEN)Checking environment variables...$(NC)"
	@if [ -z "$(VALIDATOR_ADDRESS)" ]; then \
		echo "$(RED)ERROR: VALIDATOR_ADDRESS not set$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "$(RED)ERROR: PRIVATE_KEY not set$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(MANTLE_SEPOLIA_RPC_URL)" ]; then \
		echo "$(RED)ERROR: MANTLE_SEPOLIA_RPC_URL not set$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Environment variables OK!$(NC)"
	@echo "Validator: $(VALIDATOR_ADDRESS)"
	@echo "RPC URL: $(MANTLE_SEPOLIA_RPC_URL)"

check-balance: check-env ## Check deployer balance
	@echo "$(GREEN)Checking deployer balance...$(NC)"
	@cast balance $$(cast wallet address --private-key $(PRIVATE_KEY)) --rpc-url $(MANTLE_SEPOLIA_RPC_URL)

deploy-mantle-sepolia: check-env build ## Deploy to Mantle Sepolia
	@echo "$(GREEN)Deploying to Mantle Sepolia...$(NC)"
	forge script script/DeployMantleSepolia.s.sol \
		--rpc-url $(MANTLE_SEPOLIA_RPC_URL) \
		--broadcast \
		-vvvv

deploy-mantle-sepolia-verify: check-env build ## Deploy to Mantle Sepolia with verification
	@echo "$(GREEN)Deploying to Mantle Sepolia with verification...$(NC)"
	forge script script/DeployMantleSepolia.s.sol \
		--rpc-url $(MANTLE_SEPOLIA_RPC_URL) \
		--broadcast \
		--verify \
		-vvvv

simulate-deploy: check-env build ## Simulate deployment (dry run)
	@echo "$(YELLOW)Simulating deployment...$(NC)"
	forge script script/DeployMantleSepolia.s.sol \
		--rpc-url $(MANTLE_SEPOLIA_RPC_URL) \
		-vvvv

verify-mantle: ## Verify contract on Mantle Sepolia
	@echo "$(GREEN)Verifying contract on Mantle Sepolia...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)ERROR: CONTRACT_ADDRESS not set$(NC)"; \
		echo "$(YELLOW)Set it with: export CONTRACT_ADDRESS=0xYourAddress$(NC)"; \
		exit 1; \
	fi
	forge verify-contract \
		--chain-id 5003 \
		--num-of-optimizations 200 \
		--watch \
		--constructor-args $$(cast abi-encode "constructor(address)" $(VALIDATOR_ADDRESS)) \
		--etherscan-api-key $(MANTLESCAN_API_KEY) \
		--verifier-url https://api-sepolia.mantlescan.xyz/api \
		$(CONTRACT_ADDRESS) \
		src/IssuesClaim.sol:IssuesClaim

interact-mantle: ## Interact with deployed contract
	@echo "$(GREEN)Interacting with contract on Mantle Sepolia...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)ERROR: CONTRACT_ADDRESS not set$(NC)"; \
		exit 1; \
	fi
	forge script script/InteractMantleSepolia.s.sol \
		--rpc-url $(MANTLE_SEPOLIA_RPC_URL)

create-test-issue: ## Create a test issue
	@echo "$(GREEN)Creating test issue...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)ERROR: CONTRACT_ADDRESS not set$(NC)"; \
		exit 1; \
	fi
	forge script script/InteractMantleSepolia.s.sol \
		--sig "createTestIssue()" \
		--rpc-url $(MANTLE_SEPOLIA_RPC_URL) \
		--broadcast

get-issue: ## Get issue details (usage: make get-issue ISSUE_ID=0)
	@echo "$(GREEN)Getting issue details...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)ERROR: CONTRACT_ADDRESS not set$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(ISSUE_ID)" ]; then \
		echo "$(RED)ERROR: ISSUE_ID not set$(NC)"; \
		echo "$(YELLOW)Usage: make get-issue ISSUE_ID=0$(NC)"; \
		exit 1; \
	fi
	forge script script/InteractMantleSepolia.s.sol \
		--sig "getIssueDetails(uint256)" $(ISSUE_ID) \
		--rpc-url $(MANTLE_SEPOLIA_RPC_URL)

check-contract: ## Check contract state
	@echo "$(GREEN)Checking contract state...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)ERROR: CONTRACT_ADDRESS not set$(NC)"; \
		exit 1; \
	fi
	@echo "Issue Count:"
	@cast call $(CONTRACT_ADDRESS) "issueCount()" --rpc-url $(MANTLE_SEPOLIA_RPC_URL)
	@echo ""
	@echo "Validator:"
	@cast call $(CONTRACT_ADDRESS) "validator()" --rpc-url $(MANTLE_SEPOLIA_RPC_URL)

explorer: ## Open contract in Mantle Sepolia explorer
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)ERROR: CONTRACT_ADDRESS not set$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Opening in browser...$(NC)"
	@open "https://sepolia.mantlescan.xyz/address/$(CONTRACT_ADDRESS)" || \
	 xdg-open "https://sepolia.mantlescan.xyz/address/$(CONTRACT_ADDRESS)" || \
	 echo "$(YELLOW)Visit: https://sepolia.mantlescan.xyz/address/$(CONTRACT_ADDRESS)$(NC)"

snapshot: ## Create gas snapshot
	@echo "$(GREEN)Creating gas snapshot...$(NC)"
	forge snapshot

lint: ## Lint Solidity files
	@echo "$(GREEN)Linting Solidity files...$(NC)"
	forge fmt --check

setup: ## Initial setup (install + build + test)
	@echo "$(GREEN)Running initial setup...$(NC)"
	@make install
	@make build
	@make test
	@echo "$(GREEN)Setup complete!$(NC)"

all: clean install build test ## Clean, install, build, and test

.DEFAULT_GOAL := help
