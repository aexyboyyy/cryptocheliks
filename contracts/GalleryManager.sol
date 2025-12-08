// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CharacterManager.sol";

/**
 * @title GalleryManager
 * @dev Manages the public gallery of characters and likes
 */
contract GalleryManager {
    CharacterManager public characterManager;
    
    // Mapping from character ID to like count
    mapping(uint256 => uint256) public characterLikes;
    
    // Mapping from user to characters they liked (to prevent double-liking)
    mapping(address => mapping(uint256 => bool)) public userLikedCharacter;
    
    // Array of all public character IDs
    uint256[] public publicCharacterIds;
    
    // Mapping to check if character is in gallery
    mapping(uint256 => bool) public isInGallery;
    
    // Events
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

    /**
     * @dev Get all public character IDs
     * @return Array of character IDs
     */
    function getAllPublicCharacters() public view returns (uint256[] memory) {
        return publicCharacterIds;
    }

    /**
     * @dev Get public characters with pagination
     * @param offset Starting index
     * @param limit Number of characters to return
     * @return Array of character IDs
     */
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

    /**
     * @dev Get total number of public characters
     * @return Total count
     */
    function getPublicCharacterCount() public view returns (uint256) {
        return publicCharacterIds.length;
    }

    /**
     * @dev Like a character
     * @param characterId Character ID to like
     */
    function likeCharacter(uint256 characterId) public {
        // Verify character exists and is public
        (,, , , , , , , , , bool isPublic) = characterManager.getCharacter(characterId);
        require(isPublic, "Character is not public");
        require(!userLikedCharacter[msg.sender][characterId], "Already liked");
        
        characterLikes[characterId]++;
        userLikedCharacter[msg.sender][characterId] = true;
        
        emit CharacterLiked(characterId, msg.sender, characterLikes[characterId]);
    }

    /**
     * @dev Unlike a character
     * @param characterId Character ID to unlike
     */
    function unlikeCharacter(uint256 characterId) public {
        require(userLikedCharacter[msg.sender][characterId], "Not liked");
        
        characterLikes[characterId]--;
        userLikedCharacter[msg.sender][characterId] = false;
        
        emit CharacterUnliked(characterId, msg.sender, characterLikes[characterId]);
    }

    /**
     * @dev Add character to gallery (called when character is made public)
     * @param characterId Character ID
     */
    function addToGallery(uint256 characterId) public {
        require(msg.sender == address(characterManager), "Only CharacterManager can call this");
        require(!isInGallery[characterId], "Already in gallery");
        
        publicCharacterIds.push(characterId);
        isInGallery[characterId] = true;
        
        emit CharacterAddedToGallery(characterId);
    }

    /**
     * @dev Remove character from gallery (called when character is made private)
     * @param characterId Character ID
     */
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

    /**
     * @dev Get character like count
     * @param characterId Character ID
     * @return Like count
     */
    function getCharacterLikes(uint256 characterId) public view returns (uint256) {
        return characterLikes[characterId];
    }

    /**
     * @dev Check if user liked a character
     * @param user User address
     * @param characterId Character ID
     * @return Whether user liked the character
     */
    function hasUserLiked(address user, uint256 characterId) public view returns (bool) {
        return userLikedCharacter[user][characterId];
    }
}
