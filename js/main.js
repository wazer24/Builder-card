/**
 * main.js
 * Entry point — wires up all UI interactions.
 */

import { createThumbnail } from './image-utils.js';
import { preloadCard, generateCard } from './card.js';
import { downloadImage, shareToX } from './share.js';

// ─── State ───────────────────────────────────────────────────

let currentCanvas = null;   // The generated canvas
let currentFormat = 'card';
let cardPhotoFile = null;    // Stored file for Format B (needed when "Generate" is clicked)

// ─── DOM References ──────────────────────────────────────────

// Card
const fileInputCard = document.getElementById('file-input-card');
const uploadZoneCard = document.getElementById('upload-zone-card');
const loadingCard = document.getElementById('loading-card');
const uploadContentCard = document.getElementById('upload-content-card');
const uploadPreviewCard = document.getElementById('upload-preview-card');
const uploadThumbCard = document.getElementById('upload-thumb-card');
const changePhotoCard = document.getElementById('change-photo-card');
const cardFields = document.getElementById('card-fields');
const fieldName = document.getElementById('field-name');
const fieldStack = document.getElementById('field-stack');
const btnGenerateCard = document.getElementById('btn-generate-card');

// Result
const resultSection = document.getElementById('result-section');
const resultHeading = document.querySelector('.result__heading');
const resultCanvasWrap = document.getElementById('result-canvas-wrap');
const btnDownload = document.getElementById('btn-download');
const btnShare = document.getElementById('btn-share');
const shareHint = document.getElementById('share-hint');
const btnNew = document.getElementById('btn-new');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// ─── Initialization ──────────────────────────────────────────

async function init() {
    // Pre-load card assets in the background
    preloadCard().catch(console.warn);

    // Card: show fields on file select
    fileInputCard.addEventListener('change', handleCardUpload);
    changePhotoCard.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputCard.click();
    });
    btnGenerateCard.addEventListener('click', handleCardGenerate);

    // Drag and drop for upload zone
    setupDragDrop(uploadZoneCard, fileInputCard);

    // Result actions
    btnDownload.addEventListener('click', handleDownload);
    btnShare.addEventListener('click', handleShare);
    btnNew.addEventListener('click', handleNew);
}

// ─── Format B: Card Upload & Generate ────────────────────────

async function handleCardUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    cardPhotoFile = file;

    // Show loading briefly
    uploadContentCard.classList.add('hidden');
    uploadPreviewCard.classList.add('hidden');
    loadingCard.classList.remove('hidden');

    try {
        // Create thumbnail for preview
        const thumbUrl = await createThumbnail(file);
        uploadThumbCard.src = thumbUrl;

        // Show preview and fields
        loadingCard.classList.add('hidden');
        uploadPreviewCard.classList.remove('hidden');
        cardFields.classList.remove('hidden');

        // Disable the main file input click zone (user uses "Change photo" instead)
        fileInputCard.style.pointerEvents = 'none';

        // Focus the name field
        setTimeout(() => fieldName.focus(), 200);
    } catch (err) {
        console.error('Card photo load failed:', err);
        showToast('Could not load that photo. Try another.');
        loadingCard.classList.add('hidden');
        uploadContentCard.classList.remove('hidden');
    }

    fileInputCard.value = '';
}

async function handleCardGenerate() {
    if (!cardPhotoFile) {
        showToast('Upload a photo first!');
        return;
    }

    const name = fieldName.value.trim();
    const stack = fieldStack.value.trim();

    if (!name) {
        showToast('Please enter your name.');
        fieldName.focus();
        return;
    }

    // Show loading state on the button
    btnGenerateCard.disabled = true;
    const originalText = btnGenerateCard.innerHTML;
    btnGenerateCard.innerHTML = '<div class="spinner" style="width:24px;height:24px;border-width:2px;"></div> Generating...';

    try {
        currentCanvas = await generateCard(cardPhotoFile, name, stack);
        currentFormat = 'card';
        showResult('Your Builder ID Card');
    } catch (err) {
        console.error('Card generation failed:', err);
        showToast('Generation failed. Try again.');
    } finally {
        btnGenerateCard.disabled = false;
        btnGenerateCard.innerHTML = originalText;
    }
}

// ─── Result Display ──────────────────────────────────────────

function showResult(heading) {
    // Clear previous canvas
    resultCanvasWrap.innerHTML = '';
    resultHeading.textContent = heading;

    // Append the new canvas
    if (currentCanvas) {
        resultCanvasWrap.appendChild(currentCanvas);
    }

    // Show result section
    resultSection.classList.remove('hidden');
    shareHint.hidden = true;

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideResult() {
    resultSection.classList.add('hidden');
    resultCanvasWrap.innerHTML = '';
    shareHint.hidden = true;
    currentCanvas = null;
}

// ─── Actions ─────────────────────────────────────────────────

function handleDownload() {
    if (!currentCanvas) return;
    const filename = 'hh-goa-2026-builder-id.png';
    downloadImage(currentCanvas, filename);
    showToast('Image downloaded! 🎉');
}

function handleShare() {
    if (!currentCanvas) return;
    shareToX(currentCanvas, currentFormat);
    shareHint.hidden = false;
}

function handleNew() {
    hideResult();

    // Reset card state
    cardPhotoFile = null;
    cardFields.classList.add('hidden');
    uploadPreviewCard.classList.add('hidden');
    uploadContentCard.classList.remove('hidden');
    fileInputCard.style.pointerEvents = '';
    fieldName.value = '';
    fieldStack.value = '';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Drag & Drop ─────────────────────────────────────────────

function setupDragDrop(zone, fileInput) {
    ['dragenter', 'dragover'].forEach((evt) => {
        zone.addEventListener(evt, (e) => {
            e.preventDefault();
            zone.classList.add('upload-zone--dragover');
        });
    });

    ['dragleave', 'drop'].forEach((evt) => {
        zone.addEventListener(evt, (e) => {
            e.preventDefault();
            zone.classList.remove('upload-zone--dragover');
        });
    });

    zone.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files?.length > 0) {
            // Create a new change event to reuse existing handlers
            const dt = new DataTransfer();
            dt.items.add(files[0]);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
}

// ─── Toast ───────────────────────────────────────────────────

let toastTimeout = null;

function showToast(message, duration = 3000) {
    if (toastTimeout) clearTimeout(toastTimeout);

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add('toast--visible');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('toast--visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
}

// ─── Start ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
