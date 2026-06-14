# AVS Test Suite

Comprehensive testing for zkPull AVS (Actively Validated Service).

## Test Files

### 1. ZKPullAVS.t.sol
Tests for the main AVS contract.

**Coverage:**
- ✅ Constructor initialization
- ✅ Operator registration/deregistration
- ✅ Stake management
- ✅ Task creation and assignment
- ✅ Task pickup by operators
- ✅ Validation submission
- ✅ View functions
- ✅ Admin functions
- ✅ Slashing mechanism
- ✅ Complete workflows
- ✅ Multiple operators

### 2. IssuesClaimWithAVS.t.sol
Tests for IssuesClaim integration with AVS.

**Coverage:**
- ✅ AVS task creation on claim
- ✅ Complete workflow with AVS
- ✅ AVS enable/disable toggle
- ✅ Manual validation fallback

### 3. bot.test.js
Unit tests for operator bot (JavaScript).

**Coverage:**
- ✅ Bot initialization
- ✅ PR link parsing
- ✅ Verification logic
- ✅ Fallback mechanisms

## Running Tests

### Solidity Tests

```bash
# Run all AVS tests
forge test --match-path "test/avs/**/*.sol"

# Run specific test file
forge test --match-path test/avs/ZKPullAVS.t.sol

# Run with verbosity
forge test --match-path test/avs/ZKPullAVS.t.sol -vvv

# Run with gas report
forge test --match-path test/avs/ZKPullAVS.t.sol --gas-report

# Run specific test
forge test --match-test test_RegisterOperator_Success -vvv
```

### JavaScript Tests

```bash
cd operator
npm test
```

## Test Scenarios

### Scenario 1: Single Operator
1. Register operator with stake
2. Create task
3. Task auto-assigned to operator
4. Operator submits validation
5. Reward distributed

### Scenario 2: Multiple Operators
1. Register 3 operators
2. Create 6 tasks
3. Tasks distributed round-robin
4. Each operator processes 2 tasks
5. Verify task completion stats

### Scenario 3: Operator Deregistration
1. Register operator
2. Assign tasks
3. Deregister operator
4. Verify stake returned
5. Verify operator inactive

### Scenario 4: Slashing
1. Register operator with 1 ETH stake
2. Operator misbehaves
3. Owner slashes 0.5 ETH
4. Verify reduced stake
5. Verify slashed amount sent to owner

### Scenario 5: AVS Integration
1. Create issue in IssuesClaim
2. Developer submits claim
3. AVS task created automatically
4. Operator validates via AVS
5. Developer receives reward

## Test Coverage

Run coverage report:

```bash
forge coverage --match-path "test/avs/**/*.sol"
```

**Target Coverage:**
- Line Coverage: 100%
- Branch Coverage: 100%
- Function Coverage: 100%

## Gas Benchmarks

| Function | Gas Used |
|----------|----------|
| registerOperator | ~150,000 |
| createTask | ~120,000 |
| submitValidation | ~100,000 |
| deregisterOperator | ~50,000 |

## Debugging

### Enable detailed logs

```bash
forge test --match-test test_name -vvvv
```

### Check specific assertion

```bash
forge test --match-test test_RegisterOperator_Success -vvv
```

### Debug with console.log

```solidity
import {console2} from "forge-std/console2.sol";

function test_Something() public {
    console2.log("Value:", someValue);
    // test code
}
```

## Common Issues

### Issue: "OnlyOperator" error
**Solution**: Make sure operator is registered before calling operator-only functions

### Issue: "InsufficientStake" error
**Solution**: Send at least MINIMUM_STAKE (0.1 ETH) when registering

### Issue: "TaskNotAssigned" error
**Solution**: Verify task is assigned to the operator calling submitValidation

## Best Practices

1. **Setup**: Always register operators in setUp()
2. **Cleanup**: Use vm.stopPrank() after vm.startPrank()
3. **Balance Checks**: Verify ETH transfers with balance assertions
4. **Event Testing**: Use expectEmit for event verification
5. **State Verification**: Check contract state after operations

## Integration Testing

Test complete workflows:

```solidity
function test_CompleteWorkflow() public {
    // 1. Setup
    registerOperator();
    createIssue();
    
    // 2. Action
    submitClaim();
    validateClaim();
    
    // 3. Verify
    checkRewardDistributed();
    checkOperatorStats();
}
```

## Performance Testing

### Load Testing

```solidity
function test_ManyOperators() public {
    // Register 100 operators
    for (uint256 i = 0; i < 100; i++) {
        address op = address(uint160(i + 1000));
        vm.deal(op, 1 ether);
        vm.prank(op);
        avs.registerOperator{value: MINIMUM_STAKE}("endpoint");
    }
    
    // Verify all registered
    assertEq(avs.operatorCount(), 100);
}
```

### Stress Testing

```solidity
function test_ManyTasks() public {
    registerOperator();
    
    // Create 1000 tasks
    vm.startPrank(address(issuesClaim));
    for (uint256 i = 0; i < 1000; i++) {
        avs.createTask(1, i, "pr", developer);
    }
    vm.stopPrank();
    
    assertEq(avs.taskCounter(), 1000);
}
```

## Security Testing

### Test Access Control

```solidity
function test_OnlyOwner() public {
    vm.prank(attacker);
    vm.expectRevert(ZKPullAVS.OnlyOwner.selector);
    avs.updateMinimumStake(1 ether);
}
```

### Test Reentrancy

```solidity
function test_NoReentrancy() public {
    // Verify state updates before external calls
    // Check for reentrancy guards
}
```

## Continuous Integration

Add to CI pipeline:

```yaml
- name: Run AVS Tests
  run: |
    forge test --match-path "test/avs/**/*.sol"
    forge coverage --match-path "test/avs/**/*.sol"
```

## Support

- Issues: GitHub Issues
- Discord: #testing channel
- Docs: /docs/testing.md
