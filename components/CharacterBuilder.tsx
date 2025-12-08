"use client";

import { CharacterRenderer } from "./CharacterRenderer";

interface CharacterBuilderProps {
  parts: {
    head: number;
    eyes: number;
    mouth: number;
    body: number;
    hat: number;
    accessory: number;
  };
  onPartsChange: (parts: {
    head: number;
    eyes: number;
    mouth: number;
    body: number;
    hat: number;
    accessory: number;
  }) => void;
}

const PARTS_OPTIONS = {
  head: { name: "Head", max: 4 },
  eyes: { name: "Eyes", max: 4 },
  mouth: { name: "Mouth", max: 4 },
  body: { name: "Body", max: 6 },
  hat: { name: "Hat", max: 5 },
  accessory: { name: "Accessory", max: 4 },
};

export function CharacterBuilder({ parts, onPartsChange }: CharacterBuilderProps) {
  const updatePart = (partName: keyof typeof parts, value: number) => {
    onPartsChange({
      ...parts,
      [partName]: value,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Preview */}
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4 text-center">Preview</h3>
        <div className="bg-white/10 rounded-lg p-4">
          <CharacterRenderer
            head={parts.head}
            eyes={parts.eyes}
            mouth={parts.mouth}
            body={parts.body}
            hat={parts.hat}
            accessory={parts.accessory}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold mb-4">Customize Your Character</h3>
        
        {Object.entries(PARTS_OPTIONS).map(([key, { name, max }]) => (
          <div key={key} className="bg-white/5 rounded-lg p-4">
            <label className="block text-white font-medium mb-2">{name}</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={max - 1}
                value={parts[key as keyof typeof parts]}
                onChange={(e) => updatePart(key as keyof typeof parts, parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-semibold w-8 text-center">
                {parts[key as keyof typeof parts]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





