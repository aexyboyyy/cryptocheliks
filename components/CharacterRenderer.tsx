"use client";

interface CharacterRendererProps {
  head: number;
  eyes: number;
  mouth: number;
  body: number;
  hat: number;
  accessory: number;
}

// Character parts definitions
const HEADS = [
  { id: 0, color: "#FFDBAC", shape: "round" },
  { id: 1, color: "#F4C2A1", shape: "round" },
  { id: 2, color: "#D4A574", shape: "round" },
  { id: 3, color: "#8B4513", shape: "round" },
];

const EYES = [
  { id: 0, type: "normal", color: "#000000" },
  { id: 1, type: "happy", color: "#000000" },
  { id: 2, type: "wink", color: "#000000" },
  { id: 3, type: "surprised", color: "#000000" },
];

const MOUTHS = [
  { id: 0, type: "neutral" },
  { id: 1, type: "smile" },
  { id: 2, type: "big-smile" },
  { id: 3, type: "mustache" },
];

const BODIES = [
  { id: 0, color: "#FF6B6B", shape: "square" },
  { id: 1, color: "#4ECDC4", shape: "square" },
  { id: 2, color: "#45B7D1", shape: "square" },
  { id: 3, color: "#FFA07A", shape: "square" },
  { id: 4, color: "#98D8C8", shape: "square" },
  { id: 5, color: "#F7DC6F", shape: "square" },
];

const HATS = [
  { id: 0, type: "none" },
  { id: 1, type: "cap", color: "#FF0000" },
  { id: 2, type: "tophat", color: "#000000" },
  { id: 3, type: "beanie", color: "#0066FF" },
  { id: 4, type: "crown", color: "#FFD700" },
];

const ACCESSORIES = [
  { id: 0, type: "none" },
  { id: 1, type: "glasses", color: "#000000" },
  { id: 2, type: "sunglasses", color: "#1a1a1a" },
  { id: 3, type: "monocle", color: "#000000" },
];

export function CharacterRenderer({
  head,
  eyes,
  mouth,
  body,
  hat,
  accessory,
}: CharacterRendererProps) {
  const headData = HEADS[head % HEADS.length] || HEADS[0];
  const eyesData = EYES[eyes % EYES.length] || EYES[0];
  const mouthData = MOUTHS[mouth % MOUTHS.length] || MOUTHS[0];
  const bodyData = BODIES[body % BODIES.length] || BODIES[0];
  const hatData = HATS[hat % HATS.length] || HATS[0];
  const accessoryData = ACCESSORIES[accessory % ACCESSORIES.length] || ACCESSORIES[0];

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: "200px", height: "200px" }}>
        <svg
          viewBox="0 0 100 100"
          className="pixel-art"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Body */}
          <rect
            x="30"
            y="50"
            width="40"
            height="40"
            fill={bodyData.color}
            stroke="#000"
            strokeWidth="1"
          />

          {/* Head */}
          <circle
            cx="50"
            cy="35"
            r="20"
            fill={headData.color}
            stroke="#000"
            strokeWidth="1"
          />

          {/* Hat */}
          {hatData.type !== "none" && (
            <>
              {hatData.type === "cap" && (
                <>
                  <rect x="35" y="15" width="30" height="8" fill={hatData.color} stroke="#000" strokeWidth="1" />
                  <ellipse cx="50" cy="23" rx="15" ry="5" fill={hatData.color} stroke="#000" strokeWidth="1" />
                </>
              )}
              {hatData.type === "tophat" && (
                <>
                  <rect x="40" y="10" width="20" height="15" fill={hatData.color} stroke="#000" strokeWidth="1" />
                  <ellipse cx="50" cy="25" rx="18" ry="3" fill={hatData.color} stroke="#000" strokeWidth="1" />
                </>
              )}
              {hatData.type === "beanie" && (
                <>
                  <ellipse cx="50" cy="18" rx="18" ry="8" fill={hatData.color} stroke="#000" strokeWidth="1" />
                  <rect x="32" y="18" width="36" height="5" fill={hatData.color} stroke="#000" strokeWidth="1" />
                </>
              )}
              {hatData.type === "crown" && (
                <>
                  <polygon
                    points="50,10 45,20 40,15 35,20 30,15 25,20 20,15 15,20 10,15 5,20 50,25"
                    fill={hatData.color}
                    stroke="#000"
                    strokeWidth="1"
                  />
                </>
              )}
            </>
          )}

          {/* Accessories */}
          {accessoryData.type === "glasses" && (
            <>
              <rect x="35" y="30" width="12" height="8" fill="none" stroke={accessoryData.color} strokeWidth="2" />
              <rect x="53" y="30" width="12" height="8" fill="none" stroke={accessoryData.color} strokeWidth="2" />
              <line x1="47" y1="34" x2="53" y2="34" stroke={accessoryData.color} strokeWidth="2" />
            </>
          )}
          {accessoryData.type === "sunglasses" && (
            <>
              <rect x="35" y="30" width="12" height="8" fill="#1a1a1a" stroke="#000" strokeWidth="1" />
              <rect x="53" y="30" width="12" height="8" fill="#1a1a1a" stroke="#000" strokeWidth="1" />
              <line x1="47" y1="34" x2="53" y2="34" stroke="#000" strokeWidth="2" />
            </>
          )}
          {accessoryData.type === "monocle" && (
            <circle cx="45" cy="34" r="6" fill="none" stroke={accessoryData.color} strokeWidth="2" />
          )}

          {/* Eyes */}
          {eyesData.type === "normal" && (
            <>
              <circle cx="42" cy="32" r="2" fill={eyesData.color} />
              <circle cx="58" cy="32" r="2" fill={eyesData.color} />
            </>
          )}
          {eyesData.type === "happy" && (
            <>
              <path d="M 40 32 Q 42 34 44 32" stroke={eyesData.color} strokeWidth="1.5" fill="none" />
              <path d="M 56 32 Q 58 34 60 32" stroke={eyesData.color} strokeWidth="1.5" fill="none" />
            </>
          )}
          {eyesData.type === "wink" && (
            <>
              <path d="M 40 32 Q 42 34 44 32" stroke={eyesData.color} strokeWidth="1.5" fill="none" />
              <circle cx="58" cy="32" r="2" fill={eyesData.color} />
            </>
          )}
          {eyesData.type === "surprised" && (
            <>
              <circle cx="42" cy="32" r="3" fill={eyesData.color} />
              <circle cx="58" cy="32" r="3" fill={eyesData.color} />
            </>
          )}

          {/* Mouth */}
          {mouthData.type === "neutral" && (
            <line x1="45" y1="42" x2="55" y2="42" stroke="#000" strokeWidth="1.5" />
          )}
          {mouthData.type === "smile" && (
            <path d="M 45 42 Q 50 46 55 42" stroke="#000" strokeWidth="1.5" fill="none" />
          )}
          {mouthData.type === "big-smile" && (
            <path d="M 43 42 Q 50 48 57 42" stroke="#000" strokeWidth="2" fill="none" />
          )}
          {mouthData.type === "mustache" && (
            <path d="M 45 42 Q 50 44 55 42" stroke="#000" strokeWidth="2" fill="none" />
          )}
        </svg>
      </div>
    </div>
  );
}





