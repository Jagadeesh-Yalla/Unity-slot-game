# Lucky Reels: Premium Slot Machine Engine

[![Unity 2022.3.15](https://img.shields.io/badge/Unity-2022.3.15--LTS-black?logo=unity&logoColor=white)](https://unity.com/)
[![C# Native](https://img.shields.io/badge/Language-C%23-blue?logo=c-sharp)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![React 19](https://img.shields.io/badge/UI-React%2019-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Styling-Tailwind%204-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, mobile-responsive slot machine engine built with Unity (C#) and modernized for the web using React and TypeScript. This project showcases advanced game logic, staggered animation system, and a robust payout manager.

---

## 🔗 Live Implementation
**[View Live Demo](https://vercel.com/yalla-jagadeesh-s-projects/unity-slot-game)**

---

## 📸 Visual Showcase

| Main Gameplay | Win Celebration | Mobile Interface |
| :---: | :---: | :---: |
| ![Gameplay GIF Placeholder](https://via.placeholder.com/400x225?text=Smooth+Spinning+Showcase) | ![Win GIF Placeholder](https://via.placeholder.com/400x225?text=Jackpot+Celebration+Effect) | ![Mobile Screen Placeholder](https://via.placeholder.com/400x225?text=Fully+Responsive+Layout) |

---

## 🚀 Key Features

- **🎮 Core Mechanics**: 
    - 3-Reel system with staggered, asynchronous stop logic (Left to Right).
    - Dynamic symbol pool including standard (Cherries, Lemon, Seven, Diamond) and Bonus (Crown).
    - Infinite looping reel animation using relative positioning.
- **💰 Advanced Payout System**:
    - **Win Streaks**: Exponential payout bonuses for consecutive wins.
    - **Free Spins**: 3-Bonus symbol trigger granting 5 additional spins.
    - **Scaling Multipliers**: Ranging from 2x (Cherries) up to 50x (Jackpot Crown).
- **🕹️ UX & Interaction**:
    - **Auto-Spin**: Automated game loop with safety constraints.
    - **Screen Shake**: Procedural camera shake for high-value wins.
    - **Sound Engine**: Custom Web Audio API implementation for spin, stop, win, and coin SFX.
- **💾 Persistence**: Automatic Save/Load system using `PlayerPrefs` (Unity) and `localStorage` (Web).
- **📱 Responsive UI**: Sleek, indigo-themed interface designed for both Desktop and Mobile viewpoints.

---

## 🏛️ Architecture Overview

The project follows strict **Object-Oriented Programming (OOP)** principles to ensure scalability and maintainability.

### ASCII Class Diagram
```text
      +-------------------+          +-------------------+
      |   SlotManager     | <------> |   PlayerPrefs     |
      | (Game State/Loop) |          |  (Save System)    |
      +---------+---------+          +-------------------+
                |
        +-------+-------+-----------------+
        |               |                 |
+-------v-------+ +-----v-------+ +-------v-------+
| ReelController| |PayoutManager| |   UIManager   |
| (Animation)   | | (Calculation)| | (Visuals/SFX) |
+---------------+ +-------------+ +---------------+
```

### Class Responsibilities:
1.  **SlotManager**: The "Brain". Orchestrates spin sequences, checks outcomes, and manages the Coroutine lifecycle.
2.  **ReelController**: Handles the physics-less animation of reels, ensuring smooth transitions and "snapping" to symbol centers.
3.  **PayoutManager**: Decoupled logic for calculating winnings based on bet size, symbol ID, and current win streak.
4.  **UIManager**: Manages Text/Image updates, particle triggers (`Framer Motion`), and Audio Context handling.

---

## 🛠️ Tech Stack

- **Game Engine**: Unity 2022.3 (LTS)
- **Web Framework**: React 19 (Vite)
- **Animation**: Motion (Framer Motion)
- **Styling**: Tailwind CSS 4.0
- **Language**: TypeScript / C#
- **Icons**: Lucide React

---

## ⚙️ Setup Instructions

### Unity Project:
1. Create a `Canvas` and set `UI Scale Mode` to `Scale With Screen Size`.
2. Attach `SlotManager.cs` to a main Controller object.
3. Assign the 3 `ReelController` instances to the managers array.
4. Drag UI Text elements to the `UIManager` inspector slots.
5. Create a `Vertical Layout Group` for each reel container for symbol tiling.

### Web (React) Version:
```bash
# Clone the repository
git clone https://github.com/Jagadeesh-Yalla/unity-slot-game.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🧠 What I Learned

- **Asynchronous Flow**: Mastering `IEnumerator` and `async/await` patterns to synchronize visual reel stops with logical win checks.
- **Procedural Polish**: Implementing screen shake and particle systems without external asset dependencies.
- **State De-coupling**: Designing a payout system that exists independently of the UI, allowing for easy updates to game balancing.
- **Audio Context**: Utilizing the Web Audio API to generate synthetic "casino-grade" sounds purely through code.

---

## 📄 License
Distributed under the MIT License. See `LICENSE.md` for more information.

---
*Created as part of Game Development Portfolio 2026.*
