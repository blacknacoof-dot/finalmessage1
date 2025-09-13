// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FinalMessage Contract
 * @dev 유산 메시지의 해시를 블록체인에 저장하고 검증하는 스마트 컨트랙트
 */
contract FinalMessageContract {
    // 구조체 정의
    struct MessageRecord {
        string messageHash;      // 메시지 해시
        address owner;           // 메시지 소유자
        uint256 timestamp;       // 저장 시간
        bool isActive;          // 활성 상태
        address[] verifiers;    // 검증자 주소 목록
        uint256 lastActivity;   // 마지막 활동 시간
    }
    
    struct VerificationRecord {
        address verifier;        // 검증자 주소
        bool hasVerified;       // 검증 완료 여부
        uint256 verifyTime;     // 검증 시간
        string ipfsHash;        // 실제 메시지 IPFS 해시 (암호화됨)
    }
    
    // 매핑
    mapping(address => MessageRecord) public messageRecords;
    mapping(address => VerificationRecord[]) public verificationRecords;
    mapping(address => bool) public authorizedUsers;
    
    // 이벤트
    event MessageStored(address indexed user, string messageHash, uint256 timestamp);
    event VerifierAdded(address indexed user, address indexed verifier);
    event VerificationCompleted(address indexed user, address indexed verifier, uint256 timestamp);
    event MessageReleased(address indexed user, uint256 timestamp);
    event ActivityUpdated(address indexed user, uint256 timestamp);
    
    // 소유자
    address public owner;
    uint256 public defaultInactivityPeriod = 365 days; // 1년
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyMessageOwner(address user) {
        require(msg.sender == user || msg.sender == owner, "Not message owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev 메시지 해시를 블록체인에 저장
     * @param _messageHash 메시지 해시값
     */
    function storeMessageHash(string memory _messageHash) public {
        require(bytes(_messageHash).length > 0, "Message hash cannot be empty");
        
        messageRecords[msg.sender] = MessageRecord({
            messageHash: _messageHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            isActive: true,
            verifiers: new address[](0),
            lastActivity: block.timestamp
        });
        
        authorizedUsers[msg.sender] = true;
        
        emit MessageStored(msg.sender, _messageHash, block.timestamp);
    }
    
    /**
     * @dev 검증자 추가
     * @param _verifier 검증자 주소
     */
    function addVerifier(address _verifier) public {
        require(authorizedUsers[msg.sender], "User not authorized");
        require(_verifier != address(0), "Invalid verifier address");
        require(_verifier != msg.sender, "Cannot add yourself as verifier");
        
        messageRecords[msg.sender].verifiers.push(_verifier);
        
        emit VerifierAdded(msg.sender, _verifier);
    }
    
    /**
     * @dev 활동 상태 업데이트 (체크인)
     */
    function updateActivity() public {
        require(authorizedUsers[msg.sender], "User not authorized");
        
        messageRecords[msg.sender].lastActivity = block.timestamp;
        
        emit ActivityUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev 비활성 상태 확인
     * @param user 사용자 주소
     * @return 비활성 상태 여부
     */
    function isInactive(address user) public view returns (bool) {
        if (!authorizedUsers[user]) return false;
        
        uint256 inactivityPeriod = defaultInactivityPeriod;
        return (block.timestamp - messageRecords[user].lastActivity) > inactivityPeriod;
    }
    
    /**
     * @dev 검증자가 메시지 검증 완료 처리
     * @param user 메시지 소유자 주소
     * @param _ipfsHash 실제 메시지 IPFS 해시
     */
    function verifyMessage(address user, string memory _ipfsHash) public {
        require(authorizedUsers[user], "User not authorized");
        require(isVerifierOf(user, msg.sender), "Not authorized verifier");
        require(isInactive(user), "User is still active");
        
        verificationRecords[user].push(VerificationRecord({
            verifier: msg.sender,
            hasVerified: true,
            verifyTime: block.timestamp,
            ipfsHash: _ipfsHash
        }));
        
        emit VerificationCompleted(user, msg.sender, block.timestamp);
        
        // 모든 검증자가 검증했는지 확인
        if (allVerifiersCompleted(user)) {
            messageRecords[user].isActive = false;
            emit MessageReleased(user, block.timestamp);
        }
    }
    
    /**
     * @dev 특정 사용자의 검증자인지 확인
     * @param user 메시지 소유자
     * @param verifier 검증자 주소
     * @return 검증자 여부
     */
    function isVerifierOf(address user, address verifier) public view returns (bool) {
        address[] memory verifiers = messageRecords[user].verifiers;
        for (uint i = 0; i < verifiers.length; i++) {
            if (verifiers[i] == verifier) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev 모든 검증자가 검증을 완료했는지 확인
     * @param user 메시지 소유자
     * @return 모든 검증 완료 여부
     */
    function allVerifiersCompleted(address user) public view returns (bool) {
        address[] memory verifiers = messageRecords[user].verifiers;
        VerificationRecord[] memory records = verificationRecords[user];
        
        if (verifiers.length == 0) return false;
        if (records.length < verifiers.length) return false;
        
        // 각 검증자가 검증했는지 확인
        for (uint i = 0; i < verifiers.length; i++) {
            bool found = false;
            for (uint j = 0; j < records.length; j++) {
                if (records[j].verifier == verifiers[i] && records[j].hasVerified) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        
        return true;
    }
    
    /**
     * @dev 저장된 메시지 해시 조회
     * @param user 사용자 주소
     * @return 메시지 해시
     */
    function getMessageHash(address user) public view returns (string memory) {
        return messageRecords[user].messageHash;
    }
    
    /**
     * @dev 사용자의 검증자 목록 조회
     * @param user 사용자 주소
     * @return 검증자 주소 배열
     */
    function getVerifiers(address user) public view returns (address[] memory) {
        return messageRecords[user].verifiers;
    }
    
    /**
     * @dev 검증 기록 조회
     * @param user 사용자 주소
     * @return 검증 기록 배열
     */
    function getVerificationRecords(address user) public view returns (VerificationRecord[] memory) {
        return verificationRecords[user];
    }
    
    /**
     * @dev 메시지 무결성 검증
     * @param user 사용자 주소
     * @param originalMessage 원본 메시지
     * @return 검증 결과
     */
    function verifyMessageIntegrity(address user, string memory originalMessage) public view returns (bool) {
        string memory storedHash = messageRecords[user].messageHash;
        string memory computedHash = _computeHash(originalMessage);
        
        return keccak256(abi.encodePacked(storedHash)) == keccak256(abi.encodePacked(computedHash));
    }
    
    /**
     * @dev 메시지 해시 계산 (실제로는 프론트엔드에서 계산)
     * @param message 메시지
     * @return 해시값
     */
    function _computeHash(string memory message) internal pure returns (string memory) {
        // 실제로는 keccak256를 사용하지만, 문자열 반환을 위해 단순화
        return message; // 실제 구현에서는 적절한 해싱 필요
    }
    
    /**
     * @dev 컨트랙트 소유자만 실행 가능한 응급 기능
     * @param user 사용자 주소
     */
    function emergencyRelease(address user) public onlyOwner {
        messageRecords[user].isActive = false;
        emit MessageReleased(user, block.timestamp);
    }
    
    /**
     * @dev 기본 비활성 기간 설정 (소유자만)
     * @param _period 기간 (초 단위)
     */
    function setDefaultInactivityPeriod(uint256 _period) public onlyOwner {
        defaultInactivityPeriod = _period;
    }
}