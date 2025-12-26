# 🦎 Cryptocheliks

**Create Your Own Unique Pixel Character with Fully Homomorphic Encryption!**

Welcome to Cryptocheliks! 🎨 A decentralized application where you can build your **one-of-a-kind** pixel character by mixing and matching different parts. Your character's data is encrypted using cutting-edge **Fully Homomorphic Encryption (FHE)** technology from Zama, ensuring complete privacy while storing everything on the blockchain.

## ✨ What is Cryptocheliks?

Cryptocheliks is a fun and creative DApp where you can:

- 🎭 **Express Yourself** - Create unlimited characters, each with its own unique style and personality!
- 🔒 **Privacy First** - Your character's visual parts are encrypted and stored securely on-chain using Zama FHEVM technology
- 🌟 **Share & Shine** - Show off your creations in the public gallery and let others like your amazing characters!
- ✏️ **Edit Anytime** - Change your character's look whenever you want, or create brand new ones!
- 🗑️ **Delete if Needed** - Don't like a character anymore? Just delete it!

## 🎮 How to Play

1. **Connect Your Wallet** - Link your MetaMask or any Web3 wallet to get started!
2. **Create Your Character** - Use the sliders to customize every part of your pixel character (head, eyes, mouth, body, hat, accessory)!
3. **Name It** - Give your character a cool name (1-50 characters) and choose if you want it to be public!
4. **Show It Off** - Browse the gallery, like your favorites, and see what others have created!
5. **Manage Characters** - View all your characters, edit them, change visibility, or delete them from the "My Characters" page!

## 🚀 Key Features

### 🎨 Unlimited Creativity
- Create as many characters as you want
- Mix and match different parts to your heart's content
- Each character has 6 customizable parts with multiple options

### 🔐 Fully Homomorphic Encryption
- Powered by **Zama FHEVM** - the first fully homomorphic encryption on Ethereum
- Your character's visual parts are encrypted before being stored on-chain
- Only you can decrypt and view your private characters
- Public characters can be viewed by everyone, but their encrypted values remain private

### 💚 Social Features
- Public gallery showcasing all public characters
- Like system to show appreciation for awesome creations
- See how many likes each character has received

### ✏️ Full Control
- Edit character parts anytime
- Change character names
- Toggle visibility (public/private)
- Delete characters you no longer want

## 🎨 Character Parts

Mix and match these options to create your perfect character:

- **Head**: 4 different skin tones (0-3)
- **Eyes**: 4 expressions - normal, happy, wink, surprised (0-3)
- **Mouth**: 4 styles - neutral, smile, big smile, mustache (0-3)
- **Body**: 6 different colors (0-5)
- **Hat**: 5 styles - none, cap, top hat, beanie, crown (0-4)
- **Accessory**: 4 options - none, glasses, sunglasses, monocle (0-3)

## 🛠️ For Developers

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- A **Web3 wallet** (MetaMask recommended)
- **Sepolia ETH** for gas fees (get it from a [Sepolia faucet](https://sepoliafaucet.com/))
- **WalletConnect Project ID** (get it from [WalletConnect Cloud](https://cloud.walletconnect.com/))

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cryptocheliks

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# RPC Provider
SEPOLIA_RPC_URL=https://sepolia.drpc.org

# Private key for contract deployment (only needed for deployment)
PRIVATE_KEY=your_private_key_here

# Deployed Contract Addresses
NEXT_PUBLIC_CHARACTER_MANAGER_ADDRESS=0x892324719831df4CC0d3c4eAc5B4aBe1f17CAdea
NEXT_PUBLIC_GALLERY_MANAGER_ADDRESS=0xb5Bb348751f50AAd00628bD532d8cc74A4694d2F

# FHEVM Configuration
NEXT_PUBLIC_FHEVM_NETWORK=sepolia

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Contract Deployment

To deploy the smart contracts to Sepolia testnet:

```bash
# Make sure your .env.local has PRIVATE_KEY and SEPOLIA_RPC_URL set
npm run deploy:sepolia
```

This will:
1. Compile the contracts
2. Deploy CharacterManager
3. Deploy GalleryManager (linked to CharacterManager)
4. Link the contracts together
5. Print the deployment addresses

**Important:** After deployment, update your `.env.local` file with the new contract addresses!

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run compile` - Compile smart contracts with Hardhat
- `npm run deploy:sepolia` - Deploy contracts to Sepolia testnet

### Project Structure

```
cryptocheliks/
├── app/                    # Next.js 14 App Router pages
│   ├── page.tsx           # Home page
│   ├── gallery/           # Public gallery page
│   ├── create/            # Character creation page
│   ├── my-characters/     # User's characters management
│   ├── edit/[id]/         # Edit character page
│   └── about/             # About page
├── components/            # React components
│   ├── CharacterBuilder.tsx    # Character customization UI
│   ├── CharacterRenderer.tsx   # Character visualization
│   ├── CharacterCard.tsx       # Character card component
│   └── CharacterLikes.tsx      # Like button component
├── contracts/             # Solidity smart contracts
│   ├── CharacterManager.sol    # Main contract for character management
│   └── GalleryManager.sol      # Gallery and likes management
├── hooks/                 # Custom React hooks
│   ├── useCharacter.ts    # Character data fetching
│   ├── useGallery.ts      # Gallery data and likes
│   └── useFHEVM.ts        # FHEVM integration
├── lib/                   # Library code
│   └── fheEncryption.ts   # FHE encryption/decryption utilities
├── utils/                 # Utility functions
│   └── address.ts         # Address normalization and validation
└── scripts/               # Deployment scripts
    └── deploy-simple.js   # Contract deployment script
```

## 🔒 Security & Privacy

### Fully Homomorphic Encryption (FHE)

This project uses **Zama FHEVM**, which brings fully homomorphic encryption to Ethereum:

- Character parts are encrypted **client-side** before being sent to the blockchain
- Encrypted data is stored as `bytes32` FHE handles on-chain
- Original values are stored locally in browser `localStorage` for rendering
- Only the character owner has access to decrypt their private characters
- Public characters can be viewed by everyone, but encrypted values remain secure

### Best Practices

- **Never share your private key** - Keep it secure!
- **Always verify contract addresses** before interacting
- **Check the network** - Make sure you're on Sepolia testnet
- **Verify transactions** on [Sepolia Etherscan](https://sepolia.etherscan.io/)

## 🌐 Deployment

### Vercel Deployment

The easiest way to deploy the frontend:

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy! 🚀

**Important:** Make sure to add these environment variables in Vercel:
- `NEXT_PUBLIC_CHARACTER_MANAGER_ADDRESS`
- `NEXT_PUBLIC_GALLERY_MANAGER_ADDRESS`
- `NEXT_PUBLIC_FHEVM_NETWORK`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Contract Verification

After deploying contracts, verify them on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]
```

## 🐛 Troubleshooting

### Common Issues

**"Wallet not connected"**
- Make sure your wallet is connected to Sepolia testnet
- Refresh the page and reconnect your wallet

**"Insufficient funds"**
- Get Sepolia ETH from a faucet: [sepoliafaucet.com](https://sepoliafaucet.com/)

**"Contract address not found"**
- Verify your environment variables are set correctly
- Check that contract addresses are valid Ethereum addresses

**"Character not showing in gallery"**
- Make sure the character was created with `isPublic: true`
- Check that contracts are properly linked (CharacterManager → GalleryManager)
- Refresh the page or wait a few seconds for the blockchain to sync

**"Transaction failed"**
- Check you have enough Sepolia ETH for gas
- Verify the contract addresses are correct
- Check browser console for detailed error messages

**"FHE encryption failed"**
- Make sure `NEXT_PUBLIC_FHEVM_NETWORK` is set to "sepolia"
- Check browser console for encryption errors
- Try refreshing the page

## 📚 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi, Viem, ConnectKit
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: Zama FHEVM Relayer SDK
- **Smart Contracts**: Solidity 0.8.20
- **Development**: Hardhat

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning or building your own applications!

## 👤 Author

**bibfully**

- Discord: **bibfully**

## 🙏 Acknowledgments

- [Zama](https://zama.ai) - For amazing FHEVM technology that makes private blockchain data possible
- [ConnectKit](https://docs.family.co/connectkit) - For seamless wallet connection UX
- [Hardhat](https://hardhat.org) - For excellent smart contract development tools
- [Wagmi](https://wagmi.sh) - For great React hooks for Ethereum

---

**Built with ❤️ using Zama FHEVM**

**Have fun creating your encrypted pixel characters! 🎨✨**
