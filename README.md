# 🦎 Cryptocheliks

**Create Your Own Unique Pixel Character!**

Welcome to Cryptocheliks! 🎨 Build your **one-of-a-kind** pixel character by mixing and matching different parts! Choose from various heads, eyes, mouths, bodies, hats, and accessories to create something truly special.

## ✨ What is Cryptocheliks?

Cryptocheliks is a fun and creative DApp where you can:

- 🎭 **Express yourself** - Create as many characters as you want, each with its own unique style and personality!
- 🔒 **Privacy first** - Your character's details are encrypted and stored securely on the blockchain using cutting-edge FHE technology from Zama.
- 🌟 **Share & shine** - Show off your creations in the public gallery and let others like your amazing characters!
- ✏️ **Edit anytime** - Change your character's look whenever you want, or create brand new ones!

## 🎮 How to Play

1️⃣ **Connect your wallet** - Link your MetaMask or any Web3 wallet to get started!

2️⃣ **Create your character** - Use the sliders to customize every part of your pixel character!

3️⃣ **Name it** - Give your character a cool name and make it public to share with everyone!

4️⃣ **Show it off** - Browse the gallery, like your favorites, and see what others have created!

## 🚀 Cool Features

- 🎨 **Unlimited Creativity** - Create as many characters as you want! Mix and match to your heart's content.
- 🔐 **Super Secure** - Powered by Zama FHEVM - your data stays encrypted and private!
- 💚 **Like & Share** - Show your love for awesome characters with likes!
- ✏️ **Edit Anytime** - Changed your mind? No problem! Edit your characters whenever you want.
- 🗑️ **Delete if Needed** - Don't like a character anymore? Just delete it!

## 🛠️ For Developers

### Quick Start

```bash
# Clone the repo
git clone <repository-url>
cd cryptocheliks

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Compile contracts
npm run compile

# Start development server
npm run dev
```

### What You'll Need

- Node.js 18+ 
- A Web3 wallet (MetaMask recommended)
- Some Sepolia ETH for gas fees (get it from a faucet!)

### Environment Variables

Create a `.env` file:

```env
SEPOLIA_RPC_URL=https://sepolia.drpc.org
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_CHARACTER_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_GALLERY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_FHEVM_NETWORK=sepolia
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Deploy Contracts

```bash
npm run deploy:sepolia
```

After deployment, update your `.env` file with the new contract addresses!

### Deploy Frontend

The easiest way is to use Vercel:

1. Push your code to GitHub
2. Import the repo in Vercel
3. Add your environment variables
4. Deploy! 🚀

## 📁 Project Structure

```
cryptocheliks/
├── contracts/          # Smart contracts
├── scripts/            # Deployment scripts
├── app/                # Next.js pages
├── components/         # React components
├── hooks/              # Custom hooks
└── utils/              # Utilities
```

## 🎨 Character Parts

Mix and match these options:

- **Head**: 4 skin tones
- **Eyes**: 4 expressions (normal, happy, wink, surprised)
- **Mouth**: 4 styles (neutral, smile, big smile, mustache)
- **Body**: 6 colors
- **Hat**: 5 styles (none, cap, top hat, beanie, crown)
- **Accessory**: 4 options (none, glasses, sunglasses, monocle)

## 🔒 Security

- Character data is encrypted using FHEVM technology
- Your private key stays private - never share it!
- Always verify contract addresses before interacting

## 🐛 Having Issues?

- Make sure your wallet is connected to Sepolia network
- Check that you have Sepolia ETH for gas
- Verify your environment variables are set correctly
- Check the browser console for any errors

## 👤 Author

**bibfully**

Reach out on Discord: **bibfully**

## 📝 License

MIT License

## 🙏 Thanks

- [Zama](https://zama.ai) for amazing FHEVM technology
- [ConnectKit](https://docs.family.co/connectkit) for wallet connection

---

**Built with ❤️ using Zama FHEVM**

**Have fun creating! 🎨✨**
