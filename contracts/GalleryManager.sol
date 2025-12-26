// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CharacterManager.sol";

// Gallery contract - handles public characters and likes
// Simple stuff: add characters, like them, unlike them
contract GalleryManager {
    CharacterManager public characterManager;
    
    // How many likes each character has
    mapping(uint256 => uint256) public characterLikes;
    
    // Track who liked what (so you can't like twice)
    mapping(address => mapping(uint256 => bool)) public userLikedCharacter;
    
    // List of all public character IDs
    uint256[] public publicCharacterIds;
    
    // Quick check if character is in gallery
    mapping(uint256 => bool) public isInGallery;
    
    // Events for tracking what's happening
    event CharacterLiked(
        uint256 indexed characterId,
        address indexed liker,
        uint256 totalLikes
    );
    
    event CharacterUnliked(
        uint256 indexed characterId,
        address indexed unliker,
        uint256 totalLikes
    );
    
    event CharacterAddedToGallery(
        uint256 indexed characterId
    );
    
    event CharacterRemovedFromGallery(
        uint256 indexed characterId
    );

    constructor(address _characterManager) {
        characterManager = CharacterManager(_characterManager);
    }

    // Get all public characters - returns all IDs
    function getAllPublicCharacters() public view returns (uint256[] memory) {
        return publicCharacterIds;
    }

    // Get characters with pagination - useful for UI when there are many characters
    function getPublicCharactersPaginated(
        uint256 offset,
        uint256 limit
    ) public view returns (uint256[] memory) {
        uint256 total = publicCharacterIds.length;
        if (offset >= total) {
            return new uint256[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = publicCharacterIds[i];
        }
        
        return result;
    }

    // How many public characters we have
    function getPublicCharacterCount() public view returns (uint256) {
        return publicCharacterIds.length;
    }

    // Like a character - can't like twice!
    function likeCharacter(uint256 characterId) public {
        // Verify character exists and is public (getCharacter returns 11 values: 6 bytes32, string name, address owner, 2 uint256, bool)
        (,,,,, , , , , , bool isPublic) = characterManager.getCharacter(characterId);
        require(isPublic, "Character is not public");
        require(!userLikedCharacter[msg.sender][characterId], "Already liked");
        
        characterLikes[characterId]++;
        userLikedCharacter[msg.sender][characterId] = true;
        
        emit CharacterLiked(characterId, msg.sender, characterLikes[characterId]);
    }

    // Unlike a character - remove your like
    function unlikeCharacter(uint256 characterId) public {
        require(userLikedCharacter[msg.sender][characterId], "Not liked");
        
        characterLikes[characterId]--;
        userLikedCharacter[msg.sender][characterId] = false;
        
        emit CharacterUnliked(characterId, msg.sender, characterLikes[characterId]);
    }

    // Add character to gallery - only CharacterManager can call this
    function addToGallery(uint256 characterId) public {
        require(msg.sender == address(characterManager), "Only CharacterManager can call this");
        require(!isInGallery[characterId], "Already in gallery");
        
        publicCharacterIds.push(characterId);
        isInGallery[characterId] = true;
        
        emit CharacterAddedToGallery(characterId);
    }

    // Remove character from gallery - only CharacterManager can call this
    function removeFromGallery(uint256 characterId) public {
        require(msg.sender == address(characterManager), "Only CharacterManager can call this");
        require(isInGallery[characterId], "Not in gallery");
        
        // Remove from array
        uint256[] storage chars = publicCharacterIds;
        for (uint256 i = 0; i < chars.length; i++) {
            if (chars[i] == characterId) {
                chars[i] = chars[chars.length - 1];
                chars.pop();
                break;
            }
        }
        
        isInGallery[characterId] = false;
        
        emit CharacterRemovedFromGallery(characterId);
    }

    // Get how many likes a character has
    function getCharacterLikes(uint256 characterId) public view returns (uint256) {
        return characterLikes[characterId];
    }

    // Check if a user liked a specific character
    function hasUserLiked(address user, uint256 characterId) public view returns (bool) {
        return userLikedCharacter[user][characterId];
    }
}
