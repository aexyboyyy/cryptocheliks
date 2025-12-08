// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Forward declaration
interface IGalleryManager {
    function addToGallery(uint256 characterId) external;
    function removeFromGallery(uint256 characterId) external;
}

/**
 * @title CharacterManager
 * @dev Manages character creation, editing, and storage
 * Note: In production, character parts should be encrypted using FHEVM
 * For now, we store them as uint32, but the structure supports FHE encryption
 */
contract CharacterManager {
    // Character structure
    // In production with FHEVM, these would be euint32 (encrypted uint32)
    struct Character {
        uint32 head;       // Head ID (should be encrypted with FHE in production)
        uint32 eyes;       // Eyes ID (should be encrypted with FHE in production)
        uint32 mouth;      // Mouth ID (should be encrypted with FHE in production)
        uint32 body;       // Body ID (should be encrypted with FHE in production)
        uint32 hat;        // Hat ID (should be encrypted with FHE in production)
        uint32 accessory;  // Accessory ID (should be encrypted with FHE in production)
        string name;       // Character name (public)
        address owner;     // Character owner
        uint256 createdAt; // Creation timestamp
        uint256 updatedAt; // Last update timestamp
        bool isPublic;     // Whether character is public
    }

    // Mapping from character ID to Character
    mapping(uint256 => Character) public characters;
    
    // Mapping from owner to their character IDs
    mapping(address => uint256[]) public ownerCharacters;
    
    // Total character count
    uint256 public totalCharacters;
    
    // Character ID counter
    uint256 private _characterIdCounter;

    // Events
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

    /**
     * @dev Create a new character
     * @param name Character name
     * @param head Head ID (uint32 for now, should be euint32 with FHE)
     * @param eyes Eyes ID
     * @param mouth Mouth ID
     * @param body Body ID
     * @param hat Hat ID
     * @param accessory Accessory ID
     * @param isPublic Whether to publish to gallery
     * @return characterId The ID of the created character
     */
    function createCharacter(
        string memory name,
        uint32 head,
        uint32 eyes,
        uint32 mouth,
        uint32 body,
        uint32 hat,
        uint32 accessory,
        bool isPublic
    ) public returns (uint256) {
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name length");
        
        uint256 characterId = _characterIdCounter++;
        
        characters[characterId] = Character({
            head: head,
            eyes: eyes,
            mouth: mouth,
            body: body,
            hat: hat,
            accessory: accessory,
            name: name,
            owner: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isPublic: isPublic
        });
        
        ownerCharacters[msg.sender].push(characterId);
        totalCharacters++;
        
        // Add to gallery if public
        if (isPublic && galleryManager != address(0)) {
            IGalleryManager(galleryManager).addToGallery(characterId);
        }
        
        emit CharacterCreated(characterId, msg.sender, name, isPublic);
        
        return characterId;
    }

    /**
     * @dev Update character parts
     * @param characterId Character ID to update
     * @param head New head ID
     * @param eyes New eyes ID
     * @param mouth New mouth ID
     * @param body New body ID
     * @param hat New hat ID
     * @param accessory New accessory ID
     */
    function updateCharacter(
        uint256 characterId,
        uint32 head,
        uint32 eyes,
        uint32 mouth,
        uint32 body,
        uint32 hat,
        uint32 accessory
    ) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        require(characters[characterId].owner != address(0), "Character does not exist");
        
        characters[characterId].head = head;
        characters[characterId].eyes = eyes;
        characters[characterId].mouth = mouth;
        characters[characterId].body = body;
        characters[characterId].hat = hat;
        characters[characterId].accessory = accessory;
        characters[characterId].updatedAt = block.timestamp;
        
        emit CharacterUpdated(characterId, msg.sender);
    }

    /**
     * @dev Change character name
     * @param characterId Character ID
     * @param newName New character name
     */
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

    /**
     * @dev Delete a character
     * @param characterId Character ID to delete
     */
    function deleteCharacter(uint256 characterId) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        
        // Check if character was public and remove from gallery before deleting
        bool wasPublic = characters[characterId].isPublic;
        if (wasPublic && galleryManager != address(0)) {
            IGalleryManager(galleryManager).removeFromGallery(characterId);
        }
        
        // Remove from owner's list
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

    // Gallery manager address
    address public galleryManager;

    /**
     * @dev Set gallery manager address
     * @param _galleryManager Gallery manager contract address
     */
    function setGalleryManager(address _galleryManager) public {
        require(galleryManager == address(0), "Gallery manager already set");
        galleryManager = _galleryManager;
    }

    /**
     * @dev Toggle character public visibility
     * @param characterId Character ID
     * @param isPublic New visibility status
     */
    function setCharacterVisibility(
        uint256 characterId,
        bool isPublic
    ) public {
        require(characters[characterId].owner == msg.sender, "Not the owner");
        
        bool wasPublic = characters[characterId].isPublic;
        characters[characterId].isPublic = isPublic;
        characters[characterId].updatedAt = block.timestamp;
        
        // Notify gallery manager if visibility changed
        if (galleryManager != address(0)) {
            if (isPublic && !wasPublic) {
                IGalleryManager(galleryManager).addToGallery(characterId);
            } else if (!isPublic && wasPublic) {
                IGalleryManager(galleryManager).removeFromGallery(characterId);
            }
        }
    }

    /**
     * @dev Get character data
     * @param characterId Character ID
     * @return head Head ID
     * @return eyes Eyes ID
     * @return mouth Mouth ID
     * @return body Body ID
     * @return hat Hat ID
     * @return accessory Accessory ID
     * @return name Character name
     * @return owner Character owner
     * @return createdAt Creation timestamp
     * @return updatedAt Last update timestamp
     * @return isPublic Visibility status
     */
    function getCharacter(uint256 characterId) public view returns (
        uint32 head,
        uint32 eyes,
        uint32 mouth,
        uint32 body,
        uint32 hat,
        uint32 accessory,
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
            char.head,
            char.eyes,
            char.mouth,
            char.body,
            char.hat,
            char.accessory,
            char.name,
            char.owner,
            char.createdAt,
            char.updatedAt,
            char.isPublic
        );
    }

    /**
     * @dev Get owner's character IDs
     * @param owner Address of the owner
     * @return Array of character IDs
     */
    function getOwnerCharacters(address owner) public view returns (uint256[] memory) {
        return ownerCharacters[owner];
    }

    /**
     * @dev Get character public info (name, owner, timestamps) without encrypted parts
     * @param characterId Character ID
     * @return name Character name
     * @return owner Character owner
     * @return createdAt Creation timestamp
     * @return updatedAt Last update timestamp
     * @return isPublic Visibility status
     */
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
}

