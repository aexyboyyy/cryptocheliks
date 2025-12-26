// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Gallery contract interface - we call it to add/remove characters from public gallery
interface IGalleryManager {
    function addToGallery(uint256 characterId) external;
    function removeFromGallery(uint256 characterId) external;
}

// Character manager - stores pixel characters with FHE encryption
// All visual parts are encrypted, only the name is public
contract CharacterManager {
    // Character structure - all parts encrypted with FHE
    struct Character {
        bytes32 encryptedHead;      // Encrypted head (you can't see what it actually is until decrypted)
        bytes32 encryptedEyes;      // Encrypted eyes
        bytes32 encryptedMouth;     // Encrypted mouth
        bytes32 encryptedBody;      // Encrypted body
        bytes32 encryptedHat;       // Encrypted hat (yes, even hats get encrypted!)
        bytes32 encryptedAccessory; // Encrypted accessory
        string name;                // Character name - this is public, no need to encrypt
        address owner;              // Who owns this character
        uint256 createdAt;          // When it was created
        uint256 updatedAt;          // Last update timestamp
        bool isPublic;              // Public or private
    }

    // Storage for all characters by ID
    mapping(uint256 => Character) public characters;
    
    // List of character IDs for each owner
    mapping(address => uint256[]) public ownerCharacters;
    
    // Total number of characters created
    uint256 public totalCharacters;
    
    // Counter for generating new character IDs
    uint256 private _characterIdCounter;

    // Events for tracking what's happening
    event CharacterCreated(
        uint256 indexed characterId,
        address indexed owner,
        string name,
        bool isPublic
    );
    
    event CharacterUpdated(
        uint256 indexed characterId,
        address indexed owner
    );
    
    event CharacterDeleted(
        uint256 indexed characterId,
        address indexed owner
    );
    
    event CharacterNameChanged(
        uint256 indexed characterId,
        string newName
    );

    // Create a new character - all parts must already be encrypted with FHE
    // We only accept encrypted data, no plaintext!
    function createCharacter(
        string memory name,
        bytes32 encryptedHead,
        bytes32 encryptedEyes,
        bytes32 encryptedMouth,
        bytes32 encryptedBody,
        bytes32 encryptedHat,
        bytes32 encryptedAccessory,
        bool isPublic
    ) public returns (uint256) {
        // Check that name is valid (not empty, not too long)
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name length");
        // All parts must be encrypted, empty hashes are not allowed
        require(encryptedHead != bytes32(0), "FHE encrypted head cannot be empty");
        require(encryptedEyes != bytes32(0), "FHE encrypted eyes cannot be empty");
        require(encryptedMouth != bytes32(0), "FHE encrypted mouth cannot be empty");
        require(encryptedBody != bytes32(0), "FHE encrypted body cannot be empty");
        require(encryptedHat != bytes32(0), "FHE encrypted hat cannot be empty");
        require(encryptedAccessory != bytes32(0), "FHE encrypted accessory cannot be empty");
        
        // Generate new character ID
        uint256 characterId = _characterIdCounter++;
        
        // Save character with all encrypted parts
        characters[characterId] = Character({
            encryptedHead: encryptedHead,
            encryptedEyes: encryptedEyes,
            encryptedMouth: encryptedMouth,
            encryptedBody: encryptedBody,
            encryptedHat: encryptedHat,
            encryptedAccessory: encryptedAccessory,
            name: name,
            owner: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isPublic: isPublic
        });
        
        // Add to owner's character list
        ownerCharacters[msg.sender].push(characterId);
        totalCharacters++;
        
        // If public, add to gallery immediately
        if (isPublic && galleryManager != address(0)) {
            IGalleryManager(galleryManager).addToGallery(characterId);
        }
        
        emit CharacterCreated(characterId, msg.sender, name, isPublic);
        
        return characterId;
    }

    // Update character parts - only owner can do this
    // All parts must be encrypted via FHE before calling
    function updateCharacter(
        uint256 characterId,
        bytes32 encryptedHead,
        bytes32 encryptedEyes,
        bytes32 encryptedMouth,
        bytes32 encryptedBody,
        bytes32 encryptedHat,
        bytes32 encryptedAccessory
    ) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        require(characters[characterId].owner != address(0), "Character does not exist");
        require(encryptedHead != bytes32(0), "FHE encrypted head cannot be empty");
        require(encryptedEyes != bytes32(0), "FHE encrypted eyes cannot be empty");
        require(encryptedMouth != bytes32(0), "FHE encrypted mouth cannot be empty");
        require(encryptedBody != bytes32(0), "FHE encrypted body cannot be empty");
        require(encryptedHat != bytes32(0), "FHE encrypted hat cannot be empty");
        require(encryptedAccessory != bytes32(0), "FHE encrypted accessory cannot be empty");
        
        characters[characterId].encryptedHead = encryptedHead;
        characters[characterId].encryptedEyes = encryptedEyes;
        characters[characterId].encryptedMouth = encryptedMouth;
        characters[characterId].encryptedBody = encryptedBody;
        characters[characterId].encryptedHat = encryptedHat;
        characters[characterId].encryptedAccessory = encryptedAccessory;
        characters[characterId].updatedAt = block.timestamp;
        
        emit CharacterUpdated(characterId, msg.sender);
    }

    // Change character name - simple, names are public anyway
    function changeCharacterName(
        uint256 characterId,
        string memory newName
    ) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        require(bytes(newName).length > 0 && bytes(newName).length <= 50, "Invalid name length");
        
        characters[characterId].name = newName;
        characters[characterId].updatedAt = block.timestamp;
        
        emit CharacterNameChanged(characterId, newName);
    }

    // Delete character - if it was public, remove from gallery first
    function deleteCharacter(uint256 characterId) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        
        bool wasPublic = characters[characterId].isPublic;
        if (wasPublic && galleryManager != address(0)) {
            IGalleryManager(galleryManager).removeFromGallery(characterId);
        }
        
        // Remove from owner's character list (swap with last element and pop)
        uint256[] storage ownerChars = ownerCharacters[msg.sender];
        for (uint256 i = 0; i < ownerChars.length; i++) {
            if (ownerChars[i] == characterId) {
                ownerChars[i] = ownerChars[ownerChars.length - 1];
                ownerChars.pop();
                break;
            }
        }
        
        delete characters[characterId];
        totalCharacters--;
        
        emit CharacterDeleted(characterId, msg.sender);
    }

    // Gallery contract address - set once during deployment
    address public galleryManager;

    // Set gallery address (can only be set once)
    function setGalleryManager(address _galleryManager) public {
        require(galleryManager == address(0), "Gallery manager already set");
        galleryManager = _galleryManager;
    }

    // Toggle character visibility - make it public or private
    function setCharacterVisibility(
        uint256 characterId,
        bool isPublic
    ) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        
        bool wasPublic = characters[characterId].isPublic;
        characters[characterId].isPublic = isPublic;
        characters[characterId].updatedAt = block.timestamp;
        
        // Update gallery if visibility changed
        if (galleryManager != address(0)) {
            if (isPublic && !wasPublic) {
                IGalleryManager(galleryManager).addToGallery(characterId);
            } else if (!isPublic && wasPublic) {
                IGalleryManager(galleryManager).removeFromGallery(characterId);
            }
        }
    }

    // Get full character data including encrypted parts
    // Only accessible by owner or if character is public
    function getCharacter(uint256 characterId) public view returns (
        bytes32 encryptedHead,
        bytes32 encryptedEyes,
        bytes32 encryptedMouth,
        bytes32 encryptedBody,
        bytes32 encryptedHat,
        bytes32 encryptedAccessory,
        string memory name,
        address owner,
        uint256 createdAt,
        uint256 updatedAt,
        bool isPublic
    ) {
        Character storage char = characters[characterId];
        require(char.owner != address(0), "Character does not exist");
        require(char.owner == msg.sender || char.isPublic, "Character is private");
        
        return (
            char.encryptedHead,
            char.encryptedEyes,
            char.encryptedMouth,
            char.encryptedBody,
            char.encryptedHat,
            char.encryptedAccessory,
            char.name,
            char.owner,
            char.createdAt,
            char.updatedAt,
            char.isPublic
        );
    }

    // Get all character IDs owned by an address
    function getOwnerCharacters(address owner) public view returns (uint256[] memory) {
        return ownerCharacters[owner];
    }

    // Get public info only (no encrypted parts) - for gallery listings
    function getCharacterPublicInfo(uint256 characterId) public view returns (
        string memory name,
        address owner,
        uint256 createdAt,
        uint256 updatedAt,
        bool isPublic
    ) {
        Character storage char = characters[characterId];
        require(char.owner != address(0), "Character does not exist");
        require(char.isPublic, "Character is not public");
        
        return (
            char.name,
            char.owner,
            char.createdAt,
            char.updatedAt,
            char.isPublic
        );
    }
    
    // Get just the encrypted parts - useful if you only need the handles
    function getEncryptedCharacterParts(uint256 characterId) public view returns (
        bytes32 encryptedHead,
        bytes32 encryptedEyes,
        bytes32 encryptedMouth,
        bytes32 encryptedBody,
        bytes32 encryptedHat,
        bytes32 encryptedAccessory
    ) {
        Character storage char = characters[characterId];
        require(char.owner != address(0), "Character does not exist");
        require(char.owner == msg.sender || char.isPublic, "Character is private");
        
        return (
            char.encryptedHead,
            char.encryptedEyes,
            char.encryptedMouth,
            char.encryptedBody,
            char.encryptedHat,
            char.encryptedAccessory
        );
    }
}

