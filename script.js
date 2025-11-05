const characterSets = {
    mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+-=[]{}()<>?!',
    latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    cyrillic: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    numbers: '0123456789',
    symbols: '@#$%&*+-=[]{}()<>?!~/',
    custom: ''
};

let currentFile = null;
let currentMode = 'image';
let videoAnimationFrame = null;
let isProcessing = false;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const workspace = document.getElementById('workspace');
const controls = document.getElementById('controls');
const previewSection = document.getElementById('previewSection');
const asciiOutput = document.getElementById('asciiOutput');
const previewInfo = document.getElementById('previewInfo');
const originalCanvas = document.getElementById('originalCanvas');
const videoPlayer = document.getElementById('videoPlayer');
const videoCanvas = document.getElementById('videoCanvas');

const pixelSizeSlider = document.getElementById('pixelSize');
const fontSizeSlider = document.getElementById('fontSize');
const spacingSlider = document.getElementById('spacing');
const lineHeightSlider = document.getElementById('lineHeight');
const opacitySlider = document.getElementById('opacity');
const contrastSlider = document.getElementById('contrast');
const blurSlider = document.getElementById('blur');
const brightnessSlider = document.getElementById('brightness');
const charsetTypeSelect = document.getElementById('charsetType');
const colorModeSelect = document.getElementById('colorMode');
const customCharsetInput = document.getElementById('customCharset');
const customCharsetGroup = document.getElementById('customCharsetGroup');
const downloadBtn = document.getElementById('downloadBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const resetBtn = document.getElementById('resetBtn');

const pixelSizeValue = document.getElementById('pixelSizeValue');
const fontSizeValue = document.getElementById('fontSizeValue');
const spacingValue = document.getElementById('spacingValue');
const lineHeightValue = document.getElementById('lineHeightValue');
const opacityValue = document.getElementById('opacityValue');
const contrastValue = document.getElementById('contrastValue');
const blurValue = document.getElementById('blurValue');
const brightnessValue = document.getElementById('brightnessValue');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const debouncedUpdate = debounce(() => updatePixelation(), 100);

pixelSizeSlider.addEventListener('input', (e) => {
    pixelSizeValue.textContent = e.target.value;
    debouncedUpdate();
});

fontSizeSlider.addEventListener('input', (e) => {
    fontSizeValue.textContent = e.target.value;
    updateStyles();
});

spacingSlider.addEventListener('input', (e) => {
    spacingValue.textContent = e.target.value;
    updateStyles();
});

lineHeightSlider.addEventListener('input', (e) => {
    lineHeightValue.textContent = e.target.value;
    updateStyles();
});

opacitySlider.addEventListener('input', (e) => {
    opacityValue.textContent = e.target.value;
    updateStyles();
});

contrastSlider.addEventListener('input', (e) => {
    contrastValue.textContent = e.target.value;
    debouncedUpdate();
});

blurSlider.addEventListener('input', (e) => {
    blurValue.textContent = e.target.value;
    updateStyles();
});

brightnessSlider.addEventListener('input', (e) => {
    brightnessValue.textContent = e.target.value;
    debouncedUpdate();
});

charsetTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customCharsetGroup.style.display = 'block';
    } else {
        customCharsetGroup.style.display = 'none';
    }
    debouncedUpdate();
});

colorModeSelect.addEventListener('change', debouncedUpdate);
customCharsetInput.addEventListener('input', debouncedUpdate);

downloadBtn.addEventListener('click', downloadText);
downloadImageBtn.addEventListener('click', downloadImage);
resetBtn.addEventListener('click', resetApp);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    currentFile = file;
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
        currentMode = 'image';
        processImage(file);
    } else if (fileType.startsWith('video/')) {
        currentMode = 'video';
        processVideo(file);
    } else {
        alert('Unsupported file type. Please upload an image or video.');
    }
}

function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            drawImageToCanvas(img);
            convertToPixelArt();
            showPreview(file);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function processVideo(file) {
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    videoPlayer.load();
    
    videoPlayer.onloadeddata = () => {
        drawVideoFrame();
        convertToPixelArt();
        showPreview(file);
        startVideoProcessing();
    };
}

function drawImageToCanvas(img) {
    const pixelSize = parseInt(pixelSizeSlider.value);
    const aspectRatio = img.height / img.width;
    const width = Math.min(img.width, 800);
    const height = Math.floor(width * aspectRatio);
    
    const cols = Math.floor(width / pixelSize);
    const rows = Math.floor(height / pixelSize);
    
    originalCanvas.width = cols * pixelSize;
    originalCanvas.height = rows * pixelSize;
    
    const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);
}

function drawVideoFrame() {
    if (!videoPlayer.videoWidth) return;
    
    const pixelSize = parseInt(pixelSizeSlider.value);
    const aspectRatio = videoPlayer.videoHeight / videoPlayer.videoWidth;
    const width = Math.min(videoPlayer.videoWidth, 800);
    const height = Math.floor(width * aspectRatio);
    
    const cols = Math.floor(width / pixelSize);
    const rows = Math.floor(height / pixelSize);
    
    videoCanvas.width = cols * pixelSize;
    videoCanvas.height = rows * pixelSize;
    
    const ctx = videoCanvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(videoPlayer, 0, 0, videoCanvas.width, videoCanvas.height);
}

function startVideoProcessing() {
    if (videoAnimationFrame) {
        cancelAnimationFrame(videoAnimationFrame);
    }
    
    videoPlayer.play();
    
    function processFrame() {
        if (!videoPlayer.paused && !videoPlayer.ended && !isProcessing) {
            drawVideoFrame();
            convertToPixelArt();
        }
        videoAnimationFrame = requestAnimationFrame(processFrame);
    }
    
    processFrame();
}

function convertToPixelArt() {
    if (isProcessing) return;
    isProcessing = true;

    const canvas = currentMode === 'image' ? originalCanvas : videoCanvas;
    if (!canvas.width || !canvas.height) {
        isProcessing = false;
        return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pixelSize = parseInt(pixelSizeSlider.value);
    const contrast = parseFloat(contrastSlider.value);
    const brightness = parseFloat(brightnessSlider.value);
    const colorMode = colorModeSelect.value;
    
    const cols = Math.floor(canvas.width / pixelSize);
    const rows = Math.floor(canvas.height / pixelSize);
    
    let charset = characterSets[charsetTypeSelect.value];
    if (charsetTypeSelect.value === 'custom' && customCharsetInput.value) {
        charset = customCharsetInput.value;
    }
    if (!charset || charset.length === 0) {
        charset = characterSets.mixed;
    }
    
    let html = '';
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = x * pixelSize;
            const py = y * pixelSize;
            
            const centerX = px + Math.floor(pixelSize / 2);
            const centerY = py + Math.floor(pixelSize / 2);
            
            try {
                const imageData = ctx.getImageData(centerX, centerY, 1, 1);
                const data = imageData.data;
                
                let r = data[0];
                let g = data[1];
                let b = data[2];
                const a = data[3];
                
                if (a < 50) {
                    html += ' ';
                    continue;
                }
                
                r = Math.min(255, Math.max(0, ((r - 128) * contrast + 128) * brightness));
                g = Math.min(255, Math.max(0, ((g - 128) * contrast + 128) * brightness));
                b = Math.min(255, Math.max(0, ((b - 128) * contrast + 128) * brightness));
                
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                
                const shouldShow = luminance > 0.1;
                if (!shouldShow) {
                    html += ' ';
                    continue;
                }
                
                const char = charset[Math.floor(Math.random() * charset.length)];
                
                if (colorMode === 'colored') {
                    html += `<span style="color: rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})">${char}</span>`;
                } else if (colorMode === 'greyscale') {
                    const grey = Math.floor((r + g + b) / 3);
                    html += `<span style="color: rgb(${grey}, ${grey}, ${grey})">${char}</span>`;
                } else {
                    const opacity = 0.3 + (luminance * 0.7);
                    html += `<span style="opacity: ${opacity}">${char}</span>`;
                }
            } catch (e) {
                html += ' ';
            }
        }
        html += '\n';
    }
    
    asciiOutput.innerHTML = html;
    isProcessing = false;
}

function updatePixelation() {
    if (!currentFile) return;
    
    if (currentMode === 'image') {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                drawImageToCanvas(img);
                convertToPixelArt();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(currentFile);
    } else {
        drawVideoFrame();
        convertToPixelArt();
    }
}

function updateStyles() {
    const fontSize = fontSizeSlider.value + 'px';
    const lineHeight = lineHeightSlider.value + 'px';
    const spacing = spacingSlider.value + 'px';
    const opacity = opacitySlider.value;
    const blur = blurSlider.value + 'px';
    
    asciiOutput.style.fontSize = fontSize;
    asciiOutput.style.lineHeight = lineHeight;
    asciiOutput.style.letterSpacing = spacing;
    asciiOutput.style.opacity = opacity;
    asciiOutput.style.filter = blur > 0 ? `blur(${blur})` : 'none';
}

function showPreview(file) {
    workspace.classList.add('active');
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    previewInfo.textContent = `${file.name} | ${fileSize} MB | ${currentMode.toUpperCase()}`;
    
    updateStyles();
}

function downloadText() {
    const text = asciiOutput.innerText;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelart_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadImage() {
    const tempCanvas = document.createElement('canvas');
    const padding = 40;
    
    const lines = asciiOutput.innerText.split('\n');
    const fontSize = parseInt(fontSizeSlider.value);
    const lineHeight = parseInt(lineHeightSlider.value);
    
    const maxWidth = Math.max(...lines.map(line => line.length)) * fontSize;
    const height = lines.length * lineHeight;
    
    tempCanvas.width = maxWidth + padding * 2;
    tempCanvas.height = height + padding * 2;
    
    const ctx = tempCanvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.fillStyle = '#e0e0e0';
    ctx.textBaseline = 'top';
    
    lines.forEach((line, i) => {
        ctx.fillText(line, padding, padding + (i * lineHeight));
    });
    
    tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixelart_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function resetApp() {
    if (videoAnimationFrame) {
        cancelAnimationFrame(videoAnimationFrame);
        videoAnimationFrame = null;
    }
    
    if (videoPlayer.src) {
        videoPlayer.pause();
        URL.revokeObjectURL(videoPlayer.src);
        videoPlayer.src = '';
    }
    
    currentFile = null;
    currentMode = 'image';
    isProcessing = false;
    fileInput.value = '';
    asciiOutput.innerHTML = '';
    workspace.classList.remove('active');
    
    pixelSizeSlider.value = 8;
    pixelSizeValue.textContent = '8';
    fontSizeSlider.value = 8;
    fontSizeValue.textContent = '8';
    spacingSlider.value = 0;
    spacingValue.textContent = '0';
    lineHeightSlider.value = 8;
    lineHeightValue.textContent = '8';
    opacitySlider.value = 0.9;
    opacityValue.textContent = '0.9';
    contrastSlider.value = 1;
    contrastValue.textContent = '1';
    blurSlider.value = 0;
    blurValue.textContent = '0';
    brightnessSlider.value = 1;
    brightnessValue.textContent = '1';
    charsetTypeSelect.value = 'mixed';
    colorModeSelect.value = 'mono';
    customCharsetGroup.style.display = 'none';
    customCharsetInput.value = '';
}

console.log('%c PIXEL ART CONVERTER ', 'background: #e0e0e0; color: #000; font-size: 16px; font-weight: bold; padding: 8px;');
console.log('%c ProtectX 2025 ', 'background: #000; color: #e0e0e0; font-size: 12px; padding: 5px;');
