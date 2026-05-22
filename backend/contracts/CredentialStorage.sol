// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialStorage
 * @dev A smart contract for issuing, verifying, and revoking digital credentials.
 *      Each credential is identified by its SHA-256 hash and is linked to a student address.
 *      Only the original issuer can revoke a credential.
 */
contract CredentialStorage {
    // ========================
    // Structs
    // ========================

    /// @dev Represents a single digital credential stored on-chain
    struct Credential {
        address issuer;           // The institution/entity that issued the credential
        address studentAddress;   // The student who received the credential
        bytes32 credentialHash;   // SHA-256 hash of the credential file/data
        uint256 timestamp;        // Block timestamp when the credential was issued
        bool isValid;             // Whether the credential is still valid (not revoked)
        bool exists;              // Whether this credential entry exists at all
    }

    // ========================
    // State Variables
    // ========================

    /// @dev Maps a credential hash to its Credential struct
    mapping(bytes32 => Credential) public credentials;

    /// @dev Maps a student address to an array of their credential hashes
    mapping(address => bytes32[]) public studentCredentials;

    /// @dev Contract owner (deployer)
    address public owner;

    // ========================
    // Events
    // ========================

    /// @dev Emitted when a new credential is issued
    event CredentialIssued(
        bytes32 indexed credentialHash,
        address indexed issuer,
        address indexed student,
        uint256 timestamp
    );

    /// @dev Emitted when a credential is revoked
    event CredentialRevoked(
        bytes32 indexed credentialHash,
        address indexed issuer,
        uint256 timestamp
    );

    // ========================
    // Modifiers
    // ========================

    /// @dev Restricts function access to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // ========================
    // Constructor
    // ========================

    constructor() {
        owner = msg.sender;
    }

    // ========================
    // Functions
    // ========================

    /**
     * @dev Issue a new credential. Stores the hash on-chain and links it to the student.
     * @param _student The student's Ethereum address
     * @param _credentialHash The SHA-256 hash of the credential file (as bytes32)
     */
    function issueCredential(address _student, bytes32 _credentialHash) external {
        // Ensure this credential hash hasn't already been issued
        require(!credentials[_credentialHash].exists, "Credential with this hash already exists");

        // Ensure student address is valid
        require(_student != address(0), "Invalid student address");

        // Create and store the credential
        credentials[_credentialHash] = Credential({
            issuer: msg.sender,
            studentAddress: _student,
            credentialHash: _credentialHash,
            timestamp: block.timestamp,
            isValid: true,
            exists: true
        });

        // Add the credential hash to the student's list
        studentCredentials[_student].push(_credentialHash);

        // Emit event for off-chain listeners
        emit CredentialIssued(_credentialHash, msg.sender, _student, block.timestamp);
    }

    /**
     * @dev Verify whether a credential exists and is still valid.
     * @param _credentialHash The hash of the credential to verify
     * @return isValid Whether the credential is valid
     * @return issuer The address of the original issuer
     * @return student The student's address
     * @return timestamp When the credential was issued
     */
    function verifyCredential(bytes32 _credentialHash)
        external
        view
        returns (
            bool isValid,
            address issuer,
            address student,
            uint256 timestamp
        )
    {
        Credential memory cred = credentials[_credentialHash];

        // If the credential doesn't exist, return all defaults (isValid = false)
        if (!cred.exists) {
            return (false, address(0), address(0), 0);
        }

        return (cred.isValid, cred.issuer, cred.studentAddress, cred.timestamp);
    }

    /**
     * @dev Revoke a credential. Only the original issuer can revoke it.
     * @param _credentialHash The hash of the credential to revoke
     */
    function revokeCredential(bytes32 _credentialHash) external {
        Credential storage cred = credentials[_credentialHash];

        // Make sure the credential exists
        require(cred.exists, "Credential does not exist");

        // Only the original issuer can revoke
        require(cred.issuer == msg.sender, "Only the original issuer can revoke this credential");

        // Only revoke if it's currently valid
        require(cred.isValid, "Credential is already revoked");

        // Revoke the credential
        cred.isValid = false;

        // Emit event
        emit CredentialRevoked(_credentialHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Get all credential hashes for a specific student.
     * @param _student The student's Ethereum address
     * @return An array of credential hashes (bytes32)
     */
    function getStudentCredentials(address _student)
        external
        view
        returns (bytes32[] memory)
    {
        return studentCredentials[_student];
    }

    /**
     * @dev Get full credential details by hash.
     * @param _credentialHash The credential hash to look up
     * @return The full Credential struct
     */
    function getCredentialDetails(bytes32 _credentialHash)
        external
        view
        returns (Credential memory)
    {
        return credentials[_credentialHash];
    }
}
