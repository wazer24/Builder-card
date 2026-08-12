# HH Goa 2026 — Builder Frame & ID Card Generator

A lightweight and blazing-fast web application that lets attendees of **HH Goa 2026** generate branded Profile Picture (PFP) frames or personalized Builder ID cards. Upload your photo, customize your details, and instantly get your generated image to share on 𝕏!

## ✨ Features

- **🖼️ PFP Frame Generator:** Seamlessly apply the official HH Goa 2026 overlay to your profile pictures.
- **🪪 Builder ID Card:** Create a custom ID card with your photo, name, and tech stack/role.
- **📱 Format Support:** Upload `.jpg`, `.png`, `.webp`, and even iOS `.heic` / `.heif` images (auto-converted automatically).
- **⚡ Instant Processing:** Entirely client-side generation using HTML5 Canvas for maximum privacy and speed.
- **🚀 One-Click Share:** Easily download your generated image or prepare it to be shared directly on 𝕏 with `#FrameInGoa`.

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Image Processing:** HTML5 Canvas API, `heic2any`
- **Build Tool:** [Vite](https://vitejs.dev/)

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wazer24/Builder-card.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Builder-card
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server with Vite:
```bash
npm run dev
```
Your application will be running at `http://localhost:5173/` (or another port provided by Vite).

## 📜 Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run preview`: Previews the production build locally.

## 🌴 Made for HH Goa 2026
Show off your builder spirit. See you in Goa! #FrameInGoa