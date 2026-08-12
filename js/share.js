/**
 * share.js
 * Download and Share-to-X utilities.
 */

/**
 * Download the canvas as a PNG file.
 * Falls back to data URL for iOS Safari where toBlob can be unreliable.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export function downloadImage(canvas, filename = 'hh-goa-2026.png') {
    try {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    // Fallback for browsers where toBlob returns null
                    downloadViaDataURL(canvas, filename);
                    return;
                }
                const url = URL.createObjectURL(blob);
                triggerDownload(url, filename);
                // Clean up after a delay to allow the download to start
                setTimeout(() => URL.revokeObjectURL(url), 5000);
            },
            'image/png'
        );
    } catch {
        downloadViaDataURL(canvas, filename);
    }
}

/**
 * Fallback download using data URL (for iOS Safari compatibility).
 */
function downloadViaDataURL(canvas, filename) {
    const dataURL = canvas.toDataURL('image/png');
    triggerDownload(dataURL, filename);
}

/**
 * Programmatically trigger a file download.
 */
function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Share to X (Twitter).
 * Downloads the image first, then opens a pre-filled tweet intent.
 * X Web Intents don't support image attachment, so we instruct the user.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {'frame' | 'card'} format
 * @returns {{ downloaded: boolean }}
 */
export function shareToX(canvas, format = 'frame') {
    // Step 1: Download the image first
    const filename = format === 'card'
        ? 'hh-goa-2026-builder-id.png'
        : 'hh-goa-2026-frame.png';
    downloadImage(canvas, filename);

    // Step 2: Open X tweet intent with pre-filled caption
    const captions = {
        frame: `Just got my HH Goa 2026 builder frame! 🏖️🚀\n\nSee you in Goa! 🌴\n\n#FrameInGoa`,
        card: `My HH Goa 2026 Builder ID is ready! 🪪⚡\n\nCatch me at HH Goa 2026! 🌊\n\n#FrameInGoa`,
    };

    const text = encodeURIComponent(captions[format] || captions.frame);
    const tweetURL = `https://twitter.com/intent/tweet?text=${text}`;

    // Small delay to let the download start before opening the new tab
    setTimeout(() => {
        window.open(tweetURL, '_blank', 'noopener,noreferrer');
    }, 300);

    return { downloaded: true };
}
