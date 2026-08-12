/**
 * image-utils.js
 * Shared image loading, HEIC conversion, and smart cropping utilities.
 */

import heic2any from 'heic2any';

/**
 * Load an image from a File/Blob or URL string.
 * Automatically converts HEIC files to JPEG.
 * @param {File|Blob|string} source - Image file, blob, or URL
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(source) {
    let file = source;

    // Handle HEIC from iPhones
    if (file instanceof File || file instanceof Blob) {
        const isHeic =
            file.type === 'image/heic' ||
            file.type === 'image/heif' ||
            (file.name && /\.heic$/i.test(file.name)) ||
            (file.name && /\.heif$/i.test(file.name));

        if (isHeic) {
            try {
                const converted = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.92,
                });
                // heic2any can return an array of blobs for multi-frame HEIC
                file = Array.isArray(converted) ? converted[0] : converted;
            } catch (err) {
                console.warn('HEIC conversion failed, attempting direct load:', err);
                // Fall through and try to load directly
            }
        }
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Revoke the object URL to free memory
            if (img.src.startsWith('blob:')) {
                URL.revokeObjectURL(img.src);
            }
            resolve(img);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        if (file instanceof Blob || file instanceof File) {
            img.src = URL.createObjectURL(file);
        } else {
            img.src = file; // URL string for static assets
        }
    });
}

/**
 * Smart crop: calculate the source rectangle to crop an image to a target aspect ratio.
 * Biases portrait crops toward the upper third (where faces usually are).
 *
 * @param {HTMLImageElement} img - The loaded image
 * @param {number} targetRatio - Target width/height ratio (1 for square, 16/9 for landscape)
 * @returns {{ sx: number, sy: number, sw: number, sh: number }}
 */
export function smartCrop(img, targetRatio = 1) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const currentRatio = w / h;

    let sx, sy, sw, sh;

    if (currentRatio > targetRatio) {
        // Source is wider than target: crop sides, keep full height
        sh = h;
        sw = h * targetRatio;
        sx = (w - sw) / 2; // Center horizontally
        sy = 0;
    } else if (currentRatio < targetRatio) {
        // Source is taller than target: crop top/bottom
        sw = w;
        sh = w / targetRatio;
        sx = 0;
        // Bias toward upper third for portrait photos (faces tend to be in the top third)
        sy = Math.min((h - sh) / 3, h - sh);
    } else {
        // Already the right ratio
        sx = 0;
        sy = 0;
        sw = w;
        sh = h;
    }

    return { sx, sy, sw, sh };
}

/**
 * Create a thumbnail data URL from a File.
 * @param {File} file
 * @param {number} maxSize
 * @returns {Promise<string>}
 */
export async function createThumbnail(file, maxSize = 128) {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scale = maxSize / Math.max(img.naturalWidth, img.naturalHeight);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
}
