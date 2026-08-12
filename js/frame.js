/**
 * frame.js
 * Format A: PFP Frame Overlay Generator
 * Crops user photo to square, composites the branded frame overlay on top.
 */

import { loadImage, smartCrop } from './image-utils.js';

// Frame overlay asset path (relative to project root)
const FRAME_OVERLAY_PATH = '/assets/frame-overlay.png';

// Output size in pixels (standard for X/Twitter profile photos)
const OUTPUT_SIZE = 1080;

// Cache the frame overlay image so it only loads once
let cachedFrame = null;

/**
 * Pre-load the frame overlay image.
 * Call this on app init to avoid delay during generation.
 */
export async function preloadFrame() {
    if (!cachedFrame) {
        cachedFrame = await loadImage(FRAME_OVERLAY_PATH);
    }
    return cachedFrame;
}

/**
 * Generate a PFP frame from a user-uploaded photo.
 *
 * @param {File} imageFile - The user's uploaded photo
 * @returns {Promise<HTMLCanvasElement>} - Canvas with the final composited frame
 */
export async function generateFrame(imageFile) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    // 1. Load user photo
    const photo = await loadImage(imageFile);

    // 2. Smart crop to 1:1 square
    const crop = smartCrop(photo, 1);

    // 3. Draw the cropped photo filling the entire canvas
    ctx.drawImage(
        photo,
        crop.sx, crop.sy, crop.sw, crop.sh, // Source rectangle
        0, 0, OUTPUT_SIZE, OUTPUT_SIZE       // Destination rectangle
    );

    // 4. Overlay the branded frame
    const frame = cachedFrame || await preloadFrame();
    ctx.drawImage(frame, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    return canvas;
}
