// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ZKPullAVS
 * @notice AVS contract for automated zkTLS validation
 * @dev Manages operators and validation tasks for zkPull protocol
 */
contract ZKPullAVS {
    // ============================================
    // State Variables
    // ============================================
    
    address public owner;
    address public issuesClaimContract;
    address public stakeToken; // mUSD token address
    uint256 public taskCounter;
    uint256 public minimumStake;
    uint256 public operatorCount;
    
    // ============================================
    // Structs
    // ============================================
    
    struct Operator {
        address operatorAddress;
        string endpoint;
        uint256 stake;
        bool isActive;
        uint256 tasksCompleted;
        uint256 tasksRejected;
        uint256 registeredAt;
    }
    
    struct ValidationTask {
        uint256 taskId;
        uint256 issueId;
        uint256 claimIndex;
        string prLink;
        address developer;
        uint256 createdAt;
        TaskStatus status;
        address assignedOperator;
        bytes zkProof;
    }
    
    enum TaskStatus {
        Pending,
        Assigned,
        Validated,
        Rejected,
        Completed
    }
    
    // ============================================
    // Storage Mappings
    // ============================================
    
    mapping(address => Operator) public operators;
    mapping(uint256 => ValidationTask) public tasks;
    mapping(address => uint256[]) public operatorTasks;
    mapping(uint256 => mapping(uint256 => uint256)) public issueClaimToTask;
    
    address[] public operatorList;
    
    // ============================================
    // Events
    // ============================================
    
    event OperatorRegistered(address indexed operator, string endpoint, uint256 stake);
    event OperatorDeregistered(address indexed operator);
    event OperatorStakeUpdated(address indexed operator, uint256 newStake);
    event TaskCreated(uint256 indexed taskId, uint256 issueId, uint256 claimIndex);
    event TaskAssigned(uint256 indexed taskId, address indexed operator);
    event TaskValidated(uint256 indexed taskId, bool isValid, bytes zkProof);
    event TaskCompleted(uint256 indexed taskId, address indexed operator);
    
    // ============================================
    // Errors
    // ============================================
    
    error OnlyOwner();
    error OnlyIssuesContract();
    error OnlyOperator();
    error InsufficientStake();
    error OperatorAlreadyRegistered();
    error OperatorNotRegistered();
    error OperatorNotActive();
    error TaskNotFound();
    error TaskAlreadyAssigned();
    error TaskNotAssigned();
    error InvalidTaskStatus();
    
    // ============================================
    // Modifiers
    // ============================================
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier onlyIssuesContract() {
        if (msg.sender != issuesClaimContract) revert OnlyIssuesContract();
        _;
    }
    
    modifier onlyOperator() {
        if (!operators[msg.sender].isActive) revert OnlyOperator();
        _;
    }
    
    // ============================================
    // Constructor
    // ============================================
    
    constructor(address _issuesClaimContract, address _stakeToken, uint256 _minimumStake) {
        owner = msg.sender;
        issuesClaimContract = _issuesClaimContract;
        stakeToken = _stakeToken;
        minimumStake = _minimumStake;
    }
    
    // ============================================
    // Operator Management
    // ============================================
    
    /**
     * @notice Register as an operator
     * @param _endpoint API endpoint for the operator
     * @param _stakeAmount Amount of mUSD to stake
     */
    function registerOperator(string memory _endpoint, uint256 _stakeAmount) external {
        if (operators[msg.sender].operatorAddress != address(0)) {
            revert OperatorAlreadyRegistered();
        }
        if (_stakeAmount < minimumStake) revert InsufficientStake();
        
        // Transfer mUSD tokens from operator to contract
        require(
            IERC20(stakeToken).transferFrom(msg.sender, address(this), _stakeAmount),
            "Token transfer failed"
        );
        
        operators[msg.sender] = Operator({
            operatorAddress: msg.sender,
            endpoint: _endpoint,
            stake: _stakeAmount,
            isActive: true,
            tasksCompleted: 0,
            tasksRejected: 0,
            registeredAt: block.timestamp
        });
        
        operatorList.push(msg.sender);
        operatorCount++;
        
        emit OperatorRegistered(msg.sender, _endpoint, _stakeAmount);
    }
    
    /**
     * @notice Deregister as an operator
     */
    function deregisterOperator() external onlyOperator {
        Operator storage operator = operators[msg.sender];
        operator.isActive = false;
        
        // Return stake in mUSD
        uint256 stakeAmount = operator.stake;
        operator.stake = 0;
        
        require(
            IERC20(stakeToken).transfer(msg.sender, stakeAmount),
            "Token transfer failed"
        );
        
        operatorCount--;
        
        emit OperatorDeregistered(msg.sender);
    }
    
    /**
     * @notice Add more stake
     * @param _amount Amount of mUSD to add
     */
    function addStake(uint256 _amount) external onlyOperator {
        require(
            IERC20(stakeToken).transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        
        operators[msg.sender].stake += _amount;
        emit OperatorStakeUpdated(msg.sender, operators[msg.sender].stake);
    }
    
    /**
     * @notice Update operator endpoint
     */
    function updateEndpoint(string memory _newEndpoint) external onlyOperator {
        operators[msg.sender].endpoint = _newEndpoint;
    }
    
    // ============================================
    // Task Management
    // ============================================
    
    /**
     * @notice Create a new validation task
     * @param _issueId Issue ID from IssuesClaim contract
     * @param _claimIndex Claim index
     * @param _prLink Pull request link
     * @param _developer Developer address
     */
    function createTask(
        uint256 _issueId,
        uint256 _claimIndex,
        string memory _prLink,
        address _developer
    ) external onlyIssuesContract returns (uint256) {
        uint256 taskId = taskCounter++;
        
        tasks[taskId] = ValidationTask({
            taskId: taskId,
            issueId: _issueId,
            claimIndex: _claimIndex,
            prLink: _prLink,
            developer: _developer,
            createdAt: block.timestamp,
            status: TaskStatus.Pending,
            assignedOperator: address(0),
            zkProof: ""
        });
        
        issueClaimToTask[_issueId][_claimIndex] = taskId;
        
        emit TaskCreated(taskId, _issueId, _claimIndex);
        
        // Auto-assign to available operator
        _autoAssignTask(taskId);
        
        return taskId;
    }
    
    /**
     * @notice Operator picks up a task
     */
    function pickTask(uint256 _taskId) external onlyOperator {
        ValidationTask storage task = tasks[_taskId];
        
        if (task.taskId != _taskId) revert TaskNotFound();
        if (task.status != TaskStatus.Pending) revert TaskAlreadyAssigned();
        
        task.status = TaskStatus.Assigned;
        task.assignedOperator = msg.sender;
        
        operatorTasks[msg.sender].push(_taskId);
        
        emit TaskAssigned(_taskId, msg.sender);
    }
    
    /**
     * @notice Submit validation result
     * @param _taskId Task ID
     * @param _isValid Whether the claim is valid
     * @param _zkProof zkTLS proof data
     */
    function submitValidation(
        uint256 _taskId,
        bool _isValid,
        bytes memory _zkProof
    ) external onlyOperator {
        ValidationTask storage task = tasks[_taskId];
        
        if (task.taskId != _taskId) revert TaskNotFound();
        if (task.assignedOperator != msg.sender) revert TaskNotAssigned();
        if (task.status != TaskStatus.Assigned) revert InvalidTaskStatus();
        
        task.zkProof = _zkProof;
        task.status = _isValid ? TaskStatus.Validated : TaskStatus.Rejected;
        
        // Update operator stats
        if (_isValid) {
            operators[msg.sender].tasksCompleted++;
        } else {
            operators[msg.sender].tasksRejected++;
        }
        
        emit TaskValidated(_taskId, _isValid, _zkProof);
        
        // Call IssuesClaim contract to validate claim
        _executeValidation(task.issueId, task.claimIndex, _isValid);
        
        task.status = TaskStatus.Completed;
        emit TaskCompleted(_taskId, msg.sender);
    }
    
    // ============================================
    // Internal Functions
    // ============================================
    
    /**
     * @dev Auto-assign task to available operator
     */
    function _autoAssignTask(uint256 _taskId) internal {
        if (operatorCount == 0) return;
        
        // Simple round-robin assignment
        address selectedOperator = operatorList[_taskId % operatorList.length];
        
        if (operators[selectedOperator].isActive) {
            ValidationTask storage task = tasks[_taskId];
            task.status = TaskStatus.Assigned;
            task.assignedOperator = selectedOperator;
            
            operatorTasks[selectedOperator].push(_taskId);
            
            emit TaskAssigned(_taskId, selectedOperator);
        }
    }
    
    /**
     * @dev Execute validation on IssuesClaim contract
     */
    function _executeValidation(
        uint256 _issueId,
        uint256 _claimIndex,
        bool _isValid
    ) internal {
        // Call validateClaim on IssuesClaim contract
        (bool success, ) = issuesClaimContract.call(
            abi.encodeWithSignature(
                "validateClaim(uint256,uint256,bool)",
                _issueId,
                _claimIndex,
                _isValid
            )
        );
        require(success, "Validation execution failed");
    }
    
    // ============================================
    // View Functions
    // ============================================
    
    /**
     * @notice Get operator details
     */
    function getOperator(address _operator) external view returns (Operator memory) {
        return operators[_operator];
    }
    
    /**
     * @notice Get task details
     */
    function getTask(uint256 _taskId) external view returns (ValidationTask memory) {
        return tasks[_taskId];
    }
    
    /**
     * @notice Get all tasks for an operator
     */
    function getOperatorTasks(address _operator) external view returns (uint256[] memory) {
        return operatorTasks[_operator];
    }
    
    /**
     * @notice Get task ID for issue claim
     */
    function getTaskForClaim(uint256 _issueId, uint256 _claimIndex) 
        external 
        view 
        returns (uint256) 
    {
        return issueClaimToTask[_issueId][_claimIndex];
    }
    
    /**
     * @notice Get all active operators
     */
    function getActiveOperators() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active operators
        for (uint256 i = 0; i < operatorList.length; i++) {
            if (operators[operatorList[i]].isActive) {
                activeCount++;
            }
        }
        
        // Build array of active operators
        address[] memory activeOps = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < operatorList.length; i++) {
            if (operators[operatorList[i]].isActive) {
                activeOps[index] = operatorList[i];
                index++;
            }
        }
        
        return activeOps;
    }
    
    // ============================================
    // Admin Functions
    // ============================================
    
    /**
     * @notice Update minimum stake requirement
     */
    function updateMinimumStake(uint256 _newMinimum) external onlyOwner {
        minimumStake = _newMinimum;
    }
    
    /**
     * @notice Update IssuesClaim contract address
     */
    function updateIssuesClaimContract(address _newContract) external onlyOwner {
        issuesClaimContract = _newContract;
    }
    
    /**
     * @notice Slash operator for misbehavior
     */
    function slashOperator(address _operator, uint256 _amount) external onlyOwner {
        Operator storage operator = operators[_operator];
        
        if (operator.stake < _amount) {
            _amount = operator.stake;
        }
        
        operator.stake -= _amount;
        
        // Send slashed mUSD to owner
        require(
            IERC20(stakeToken).transfer(owner, _amount),
            "Token transfer failed"
        );
        
        emit OperatorStakeUpdated(_operator, operator.stake);
    }
}
