// SPDX-License-Identifier: MIT
// Specifies the license for the code, MIT is a common permissive license.
pragma solidity ^0.8.20;

/**
 * @title VCRegistry
 * @author Your Name (or AI Assistant!)
 * @notice A simple on-chain registry for Verifiable Credential (VC) statuses.
 * This contract acts as the source of truth for the validity of credentials.
 * It is controlled by an owner (the "Issuer") who can issue and revoke credentials
 * by storing and updating the status of their unique hash.
 */
contract VCRegistry {

    // --- State Variables ---

    address public owner;

    // A mapping is like a hash table or dictionary.
    // It stores the status for each unique credential hash.
    // The key is a bytes32 (a 32-byte hash of the credential).
    // The value is a uint8 representing the status.
    mapping(bytes32 => uint8) public credentialStatuses;

    // --- Events ---

    // Events are logs stored on the blockchain that our frontend can listen to.
    // This event is emitted whenever a credential's status changes.
    event CredentialStatusChanged(bytes32 indexed hash, uint8 status);

    // --- Enums ---

    // Enums are a way to create custom types with a finite set of constant values.
    // This makes the code more readable than using raw numbers (0, 1, 2).
    enum Status {
        NotFound, // Default value, status 0
        Valid,    // Status 1
        Revoked   // Status 2
    }

    // --- Constructor ---

    // The constructor is a special function that runs only once when the contract is deployed.
    // It sets the 'owner' of the contract to the address that deployed it.
    constructor() {
        owner = msg.sender; // msg.sender is the address of the account that initiated the transaction.
    }

    // --- Modifiers ---

    // Modifiers are reusable pieces of code that can be attached to functions
    // to change their behavior, typically for access control.
    modifier onlyOwner() {
        // This require statement checks if the person calling the function is the owner.
        // If it's false, the transaction will fail and revert, saving gas.
        require(msg.sender == owner, "VCRegistry: Caller is not the owner");
        _; // The underscore means "execute the rest of the function's code here."
    }

    // --- Core Functions ---

    /**
     * @notice Issues a new credential by marking its hash as 'Valid'.
     * @dev Can only be called by the contract owner. Emits a CredentialStatusChanged event.
     * @param _hash The keccak256 hash of the Verifiable Credential JSON object.
     */
    function issueCredential(bytes32 _hash) public onlyOwner {
        // We check to make sure we aren't overwriting an existing valid credential.
        require(credentialStatuses[_hash] == uint8(Status.NotFound), "VCRegistry: Credential already exists");
        
        // Update the status of this hash to 'Valid'.
        credentialStatuses[_hash] = uint8(Status.Valid);
        
        // Emit an event to notify the outside world of this change.
        emit CredentialStatusChanged(_hash, uint8(Status.Valid));
    }

    /**
     * @notice Revokes an existing credential by marking its hash as 'Revoked'.
     * @dev Can only be called by the contract owner. Emits a CredentialStatusChanged event.
     * @param _hash The keccak256 hash of the Verifiable Credential JSON object.
     */
    function revokeCredential(bytes32 _hash) public onlyOwner {
        // Ensure the credential was actually valid before trying to revoke it.
        require(credentialStatuses[_hash] == uint8(Status.Valid), "VCRegistry: Credential is not valid");

        // Update the status to 'Revoked'.
        credentialStatuses[_hash] = uint8(Status.Revoked);
        
        // Emit the event.
        emit CredentialStatusChanged(_hash, uint8(Status.Revoked));
    }

    /**
     * @notice Gets the current status of a credential.
     * @dev This is a 'view' function, meaning it only reads data and costs no gas to call.
     * @param _hash The keccak256 hash of the Verifiable Credential JSON object.
     * @return The status of the credential (0 for NotFound, 1 for Valid, 2 for Revoked).
     */
    function getCredentialStatus(bytes32 _hash) public view returns (uint8) {
        return credentialStatuses[_hash];
    }
}
