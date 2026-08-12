/**
 * card.js
 * Format B: Builder ID Card Generator
 * Composites user photo (circular clip), name, stack, and a generated builder title
 * onto a branded card template.
 */

import { loadImage, smartCrop } from './image-utils.js';

// Card template asset path
const CARD_TEMPLATE_PATH = '/assets/card-template.png';
const LOGO_PATH = '/assets/logo.svg';

// Card output dimensions (optimized for X timeline display)
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 675;

// Photo placement
const PHOTO_CENTER_X = 200;
const PHOTO_CENTER_Y = 285;
const PHOTO_RADIUS = 110;

// Text placement
const TEXT_X = 370;
const NAME_Y = 240;
const STACK_Y = 295;
const TITLE_Y = 355;

// Cached assets
let cachedTemplate = null;
let cachedLogo = null;

/**
 * Pre-load card template and logo.
 */
export async function preloadCard() {
    const [template, logo] = await Promise.all([
        loadImage(CARD_TEMPLATE_PATH),
        loadImage(LOGO_PATH),
    ]);
    cachedTemplate = template;
    cachedLogo = logo;
}

/**
 * Generate a random fun builder title.
 * @returns {string}
 */
function generateBuilderTitle() {
    const adjectives = [
        'Pixel', 'Cloud', 'Data', 'Code', 'Neural', 'Quantum', 'Async',
        'Zero-Day', 'Stack', 'Binary', 'Crypto', 'Full-Moon', 'Turbo',
        'Hyper', 'Shadow', 'Neon', 'Cosmic', 'Stealth', 'Rogue', 'Prime',
    ];
    const nouns = [
        'Alchemist', 'Whisperer', 'Architect', 'Nomad', 'Wizard', 'Samurai',
        'Catalyst', 'Artisan', 'Pioneer', 'Voyager', 'Maverick', 'Sentinel',
        'Hacker', 'Monk', 'Sage', 'Phantom', 'Captain', 'Guru', 'Ninja',
    ];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
}

/**
 * Generate a Builder ID Card.
 *
 * @param {File} imageFile - User's uploaded photo
 * @param {string} name - User's name
 * @param {string} stack - User's stack/role
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function generateCard(imageFile, name, stack) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    // Ensure fonts are loaded before rendering text
    await document.fonts.load('bold 48px "Outfit"');
    await document.fonts.load('500 30px "Space Grotesk"');
    await document.fonts.load('italic 26px "Space Grotesk"');

    // 1. Draw background - gradient base (in case template doesn't cover fully)
    const bgGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGradient.addColorStop(0, '#0A4B25');
    bgGradient.addColorStop(1, '#063318');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // 2. Draw card template
    const template = cachedTemplate || await loadImage(CARD_TEMPLATE_PATH);
    ctx.drawImage(template, 0, 0, CARD_WIDTH, CARD_HEIGHT);

    // 3. Draw user photo with circular clip
    const photo = await loadImage(imageFile);
    const crop = smartCrop(photo, 1);

    // Photo border/glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(PHOTO_CENTER_X, PHOTO_CENTER_Y, PHOTO_RADIUS + 4, 0, Math.PI * 2);
    ctx.closePath();
    const borderGrad = ctx.createLinearGradient(
        PHOTO_CENTER_X - PHOTO_RADIUS, PHOTO_CENTER_Y - PHOTO_RADIUS,
        PHOTO_CENTER_X + PHOTO_RADIUS, PHOTO_CENTER_Y + PHOTO_RADIUS
    );
    borderGrad.addColorStop(0, '#FF0080');
    borderGrad.addColorStop(1, '#FEE101');
    ctx.fillStyle = borderGrad;
    ctx.fill();
    ctx.restore();

    // Photo clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(PHOTO_CENTER_X, PHOTO_CENTER_Y, PHOTO_RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        photo,
        crop.sx, crop.sy, crop.sw, crop.sh,
        PHOTO_CENTER_X - PHOTO_RADIUS,
        PHOTO_CENTER_Y - PHOTO_RADIUS,
        PHOTO_RADIUS * 2,
        PHOTO_RADIUS * 2
    );
    ctx.restore();

    // Draw "APPROVED" Stamp on the photo
    ctx.save();
    ctx.translate(PHOTO_CENTER_X + 80, PHOTO_CENTER_Y + 85);
    ctx.rotate(-Math.PI / 8); // Rotate slightly left
    
    // Stamp border
    ctx.strokeStyle = '#FF0080';
    ctx.lineWidth = 4;
    ctx.strokeRect(-60, -22, 120, 44);
    
    // Stamp inner border (double border effect)
    ctx.lineWidth = 1;
    ctx.strokeRect(-55, -17, 110, 34);
    
    // Stamp text
    ctx.fillStyle = '#FF0080';
    ctx.font = '900 22px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('APPROVED', 0, 2);
    ctx.restore();

    // 4. Draw "BUILDER ID" header label
    ctx.font = '600 18px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '4px';
    ctx.fillText('B U I L D E R   I D', TEXT_X, 180);

    // Decorative line under header
    const lineGrad = ctx.createLinearGradient(TEXT_X, 0, TEXT_X + 300, 0);
    lineGrad.addColorStop(0, '#FF0080');
    lineGrad.addColorStop(1, 'rgba(254, 225, 1, 0.3)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(TEXT_X, 195, 300, 2);

    // 5. Name
    ctx.font = 'bold 48px "Outfit", sans-serif';
    ctx.fillStyle = '#FEE101';
    ctx.letterSpacing = '0px';
    const displayName = name.trim() || 'Your Name';
    // Truncate if too long
    const truncatedName = truncateText(ctx, displayName, 500);
    ctx.fillText(truncatedName, TEXT_X, NAME_Y);

    // 6. Stack/Role
    ctx.font = '500 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    const displayStack = stack.trim() || 'Full-Stack Builder';
    const truncatedStack = truncateText(ctx, displayStack, 500);
    ctx.fillText(truncatedStack, TEXT_X, STACK_Y);

    // 7. Generated builder title
    const builderTitle = generateBuilderTitle();
    ctx.font = 'italic 26px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FF0080';
    ctx.fillText(`" ${builderTitle} "`, TEXT_X, TITLE_Y);

    // 8. Bottom branding bar
    ctx.fillStyle = 'rgba(2, 25, 10, 0.85)'; // Deep tropical dark green
    ctx.fillRect(0, CARD_HEIGHT - 70, CARD_WIDTH, 70);

    // Bottom divider line
    const divGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    divGrad.addColorStop(0, '#FF0080');
    divGrad.addColorStop(0.5, '#FEE101');
    divGrad.addColorStop(1, '#FF0080');
    ctx.fillStyle = divGrad;
    ctx.fillRect(0, CARD_HEIGHT - 70, CARD_WIDTH, 3);

    // Logo in bottom bar
    const logo = cachedLogo || await loadImage(LOGO_PATH);
    ctx.drawImage(logo, 30, CARD_HEIGHT - 58, 44, 44);

    // Event name
    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HH GOA 2026', 85, CARD_HEIGHT - 30);

    // Hashtag on the right
    ctx.font = '500 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FEE101';
    ctx.textAlign = 'right';
    ctx.fillText('#FrameInGoa', CARD_WIDTH - 30, CARD_HEIGHT - 30);
    ctx.textAlign = 'left'; // Reset

    // Date
    ctx.font = '400 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Lighter grey-white for readability
    ctx.fillText('August 2026 • Goa, India', 85, CARD_HEIGHT - 52);

    return canvas;
}

/**
 * Truncate text to fit within maxWidth, adding ellipsis if needed.
 */
function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
}
