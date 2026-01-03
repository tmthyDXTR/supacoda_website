// Geometric Background Animation with Parallax
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('geometric-background');
    if (canvas) {
        // ========== CONFIGURATION ==========
        const CONFIG = {
            // Logo Settings
            logoWidthPercent: 0.6,          // Logo width as % of viewport (0.1 to 1.0)
            
            // Particle Settings
            particleCount: 400,             // Number of particles (100-1000)
            particleSize: 1,                // Size of each particle in pixels
            particleOpacity: 1,          // Opacity of particles (0.0 to 1.0)
            particleColor: '#ffffff',       // Color of particles (hex or rgb)
            
            // 3D Depth Settings (for grid mode)
            depthLayers: 5,                 // Number of depth planes (1-5)
            depthSizeMin: 0.5,              // Size multiplier for furthest layer (e.g., 0.5 = 50% of base size)
            depthSizeMax: 3,                // Size multiplier for closest layer (e.g., 3 = 300% of base size)
            depthOpacityMin: 0.3,           // Opacity multiplier for furthest layer (0.0-1.0)
            depthOpacityMax: 1.0,           // Opacity multiplier for closest layer (0.0-1.0)
            farPointOpacity: 0.1,           // Opacity for far points (0.0-1.0) - override depthOpacityMin
            nearPointOpacity: .4,          // Opacity for near points (0.0-1.0) - override depthOpacityMax
            depthOffsetMax: 5,              // Max pixel offset for depth separation
            
            // Parallax Settings (mouse-based depth movement in grid mode only)
            enableParallax: true,           // Enable parallax mouse tracking
            parallaxMaxOffset: 30,          // Maximum parallax movement in pixels
            parallaxMinMovement: 0.2,       // Movement multiplier for furthest layer
            parallaxMaxMovement: 7.0,       // Movement multiplier for closest layer
            parallaxSmoothness: 0.08,       // How smoothly parallax follows mouse (0.01-0.2)
            
            // Sampling Settings
            svgResolutionScale: 2.0,        // SVG sampling resolution multiplier (0.5-2.0, higher=more detail)
            samplingStep: 1,                // Pixel sampling step for edge detection (1=precise)
            outlineMargin: 5,               // Minimum distance between points on outline (pixels)
            
            // Animation Settings
            idleTimeout: 1000,              // Ms before entering idle mode (500-5000)
            idleEaseSpeed: 0.05,            // Speed particles move to logo (0.01=slow, 0.1=fast)
            activeEaseSpeed: 0.15,          // Speed particles move to grid (0.01=slow, 0.1=fast)
            
            // Grid Settings (for dispersed state)
            gridColumns: 30,                // Number of grid columns
            gridRows: 17,                   // Number of grid rows
            
            // Connection Lines
            enableLines: true,              // Show connection lines between particles
            lineOpacity: .4,              // Base opacity of lines (0.0 to 1.0)
            lineWidth: 0.5,                 // Width of connection lines
            idleLineDistance: 25,           // Max distance to connect in idle mode
            activeLineDistance: 100,        // Max distance to connect in active mode
            
            // Initial State
            startInIdleMode: false,         // Start with logo formed (true) or dispersed (false)
            initialIdleDelay: 500           // Ms before initial idle mode activates
        };
        // ===================================
        
        // Detect current page - only allow logo formation on Index/Home page
        const currentPage = document.body.getAttribute('data-page');
        const isIndexPage = currentPage === 'index';
        const enableLogoMode = isIndexPage; // Only enable logo on Index page
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let prevMouseX = mouseX;
        let prevMouseY = mouseY;
        let parallaxOffsetX = 0;
        let parallaxOffsetY = 0;
        let isIdle = isIndexPage; // Start idle only on Index page
        let idleTimer = null;
        let logoPoints = [];
        let gridPoints = [];
        
        // Dynamic particle color based on theme
        let currentParticleColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000';
        
        // Listen for theme changes
        window.addEventListener('themechange', function(e) {
            currentParticleColor = e.detail.particleColor;
        });
        
        // Resize canvas
        function resizeCanvas() {
            // Use visualViewport for mobile compatibility, fallback to window dimensions
            const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
            const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            
            // Get actual navbar height
            const header = document.querySelector('header');
            const navbarHeight = header ? header.offsetHeight : 0;
            
            canvas.width = vw;
            canvas.height = vh - navbarHeight;
            // Also set CSS dimensions to ensure proper sizing
            canvas.style.width = vw + 'px';
            canvas.style.height = (vh - navbarHeight) + 'px';
            // Position canvas below navbar
            canvas.style.top = navbarHeight + 'px';
            
            generateLogoPoints();
            generateGridPoints();
            // Update particle targets after resize
            particles.forEach((p, i) => {
                p.logoTarget = logoPoints[i % logoPoints.length];
                p.gridTarget = gridPoints[i % gridPoints.length];
            });
        }
        
        // Sample points from SVG path using a temporary canvas
        function generateLogoPoints() {
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 457 69.5">
                <path fill="white" d="M187.6,56.1c-6.4-2.1-7.5-9.4-6.1-15s2.8-5.4,5.7-6.4,5.6-1.6,8.6-1.6h8.4c0-3.2.6-8.5-3.5-8.9s-6,0-6.3,3.3l-.3,3.3h-11.5c-.8-6,1.2-12.7,7.5-14.9s10.1-1.8,15.3-1,3.7.7,5.4,1.5c3.5,1.6,5.8,4.7,6.4,8.5s.5,6.1.5,9.3v10.1c0,.6.3,1.6.7,2l3.1.2v8.6c-2.7,1.8-8,2-11.2,1s-2.7-1.5-3.7-2.7c-4.9,4.2-13.2,4.5-18.9,2.6ZM204.3,47.3v-7c-3.7.3-9.1-1.3-10,3s.2,3.9,1.9,4.7c2.6,1.2,5.5.7,8-.7Z"/>
                <path fill="white" d="M398,0v55.5h-21.8c-3.5,0-6.8-.6-10.1-1.6-4.1-1.4-7.3-4.5-8.4-8.7-1.4-4.9-1.7-10-.9-15.1s1.7-6.3,3.6-9c3.7-5,9.4-6.2,15.3-6.2h8.8V0l11.7-2.8h1ZM377.1,44.7c2.5.2,4.8.2,7.4,0v-19.7c-5.3.1-12.2-1.4-14,5.3s-.5,4.8-.4,7.2c.2,3.9,2.8,6.9,6.9,7.2Z"/>
                <path fill="white" d="M417.1,50.2c-1-3.5-1-7,.2-10.3,2-5.6,9.3-6.7,14.5-6.8h7.8c.1-2.6.5-7.9-2.6-8.6s-3.1-.3-4.6,0c-2.7.5-2.8,4.1-2.7,6.4h-11.6c-1-6.1,1.1-13,7.7-15.1s8.8-1.6,13.3-1.1,4.7.7,6.9,1.7c4.9,2.2,6.9,6.7,6.9,11.9v15.6c0,.9.4,2.1,1.1,2.6h2.9v8.8c-3.6,2.1-12.2,2.4-14.8-2-4.5,4.4-13.2,4.6-18.8,2.8s-5.1-2.9-6-6ZM439.6,47.3v-7.1c-2.3,0-4.4,0-6.4.1s-3.6,2-3.6,4.1,1,3.4,3.1,3.9,4.8.1,6.9-1.1Z"/>
                <path fill="white" d="M254.4,40.6c0,7.1,9.7,6.6,14.3,5.4l6.6-1.6v9.8c-6.6,2.4-13.7,3.2-20.7,2.3s-10-3.3-12.1-8.2-1.6-5.5-1.6-8.4v-9.1c0-2.3.4-4.6,1.1-6.8,1.1-3.6,3.7-6.2,7.2-7.6,6.1-2.4,12.9-2.5,19.1-.4s8.4,9.2,7.8,15.1l-12,2.9v-6c-.2-1.8-1.4-3.2-3.2-3.4s-3-.4-4.4.3-2.2,2.3-2.2,3.9v11.8Z"/>
                <path fill="white" d="M307.1,55.4c-7.1-2.3-9.9-9.2-9.8-16v-8.9c.1-2.6.8-5.2,1.9-7.5,1.6-3.4,4.4-5.7,7.9-6.9s8.8-1.9,13.4-1.1,3.5.6,5.3,1.2c4.5,1.6,7.8,5.2,8.7,10.1s1.1,12.9,0,19.2c-.9,4.5-3.9,8-8,9.6-6.2,2.3-12.9,2.4-19.2.4ZM321.1,44.9c.5-1.3.7-2.7.7-4.1v-12c0-1.7-1-3.3-2.4-4-2.2-1-7.3-1.1-8.1,2.3s-.5,1.8-.5,2.6v12.5c0,1.1.4,2.4,1.1,3.2,2.4,2.7,8.1,2.3,9.2-.5Z"/>
                <path fill="white" d="M142.1,54.9h-9.3v11.3c-1.8.7-3.5,1.1-5.3,1.5l-8.1,1.8V14.1c7.4-.1,14.6-.2,21.9,0s7.1.6,10.4,1.8c4.2,1.6,7.2,4.8,8.3,9.1s1.7,12.5-.2,18.5-5.8,9.4-11.4,10.6-4,.7-6.2.7ZM146.1,41.5c1.9-4.4,2-9.3-.3-13.4s-9.1-2.9-13-3.1v19.8c4.6-.1,10.6,1.3,13.3-3.3Z"/>
                <path fill="white" d="M94.2,15.8l.2,39.5c-3.8.4-7.4.4-11.1.1l-1.3-4.1c-1.5,1.5-2.5,2.8-4.2,3.6-4.4,2.1-9.3,2.5-13.9.9s-6.1-6-6.1-10.6V15.8h13.1v26.2c.4,1.6.7,3.3,2.2,4.1s3.9.7,5.6,0,2.4-2.1,2.6-3.9V15.8h13Z"/>
                <path fill="white" d="M34.7,48.7c-1.8,6.1-8.2,7.6-13.8,7.9s-9.8,0-14.5-1.4S-.1,50.1.5,45.8l11.4-2.7.4,2.1c.8,3.7,6.4,3.5,9.1,2.5s1.2-1,1.4-1.9c.2-1.6-.5-3-2.2-3.5l-12.7-3.3C.8,37.1-.4,29.1,1.3,23s7.8-8,13.4-8.3,13.3-.1,17.2,4.1,2.7,4.9,2.6,7.9l-6.2,1.7-5.5,1.3-.2-2.5c-.1-1.6-1.2-2.8-2.8-3.2s-4.1-.5-5.9.6-1.4,1.7-1.3,2.7.4,2.2,1.5,2.6c5.2,1.7,10.7,2.5,15.4,4.5s6.7,9.1,5.1,14.5Z"/>
            </svg>`;
            
            // Create an offscreen canvas to render the SVG
            const offCanvas = document.createElement('canvas');
            // Scale to configured percentage of viewport width for display
            const targetWidth = window.innerWidth * CONFIG.logoWidthPercent;
            const scale = targetWidth / 457; // 457 is the SVG viewBox width
            // Apply resolution multiplier for sampling (independent of display size)
            const logoWidth = Math.round(457 * scale * CONFIG.svgResolutionScale);
            const logoHeight = Math.round(69.5 * scale * CONFIG.svgResolutionScale);
            offCanvas.width = logoWidth;
            offCanvas.height = logoHeight;
            const offCtx = offCanvas.getContext('2d');
            
            // Render SVG to image, then sample pixels
            const img = new Image();
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                offCtx.drawImage(img, 0, 0, logoWidth, logoHeight);
                const imageData = offCtx.getImageData(0, 0, logoWidth, logoHeight);
                const data = imageData.data;
                
                const allEdgePoints = [];
                // Display size (without resolution multiplier)
                const displayWidth = window.innerWidth * CONFIG.logoWidthPercent;
                const displayHeight = 69.5 * (displayWidth / 457);
                const offsetX = (canvas.width - displayWidth) / 2;
                const offsetY = (canvas.height - displayHeight) / 2;
                const scaleToDisplay = displayWidth / logoWidth;
                
                // First pass: find all edge pixels
                const step = CONFIG.samplingStep;
                for (let y = 0; y < logoHeight; y += step) {
                    for (let x = 0; x < logoWidth; x += step) {
                        const i = (y * logoWidth + x) * 4;
                        // Check if pixel is white (alpha > 0)
                        if (data[i + 3] > 128) {
                            // Check if it's an edge pixel (has a transparent neighbor)
                            let isEdge = false;
                            const checkOffsets = [
                                [-1, 0], [1, 0], [0, -1], [0, 1],
                                [-1, -1], [1, -1], [-1, 1], [1, 1]
                            ];
                            
                            for (let [dx, dy] of checkOffsets) {
                                const nx = x + dx;
                                const ny = y + dy;
                                if (nx >= 0 && nx < logoWidth && ny >= 0 && ny < logoHeight) {
                                    const ni = (ny * logoWidth + nx) * 4;
                                    if (data[ni + 3] <= 128) {
                                        isEdge = true;
                                        break;
                                    }
                                } else {
                                    isEdge = true;
                                    break;
                                }
                            }
                            
                            if (isEdge) {
                                allEdgePoints.push({
                                    x: offsetX + (x * scaleToDisplay),
                                    y: offsetY + (y * scaleToDisplay)
                                });
                            }
                        }
                    }
                }
                
                // Second pass: filter points to maintain minimum margin distance
                logoPoints = [];
                const margin = CONFIG.outlineMargin;
                const marginSq = margin * margin;
                
                for (const point of allEdgePoints) {
                    let tooClose = false;
                    for (const existing of logoPoints) {
                        const dx = point.x - existing.x;
                        const dy = point.y - existing.y;
                        if (dx * dx + dy * dy < marginSq) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) {
                        logoPoints.push(point);
                    }
                }
                
                // Shuffle points for visual variety
                logoPoints = logoPoints.sort(() => Math.random() - 0.5);
                
                // Create or update particles to match logo points
                // If particles don't exist yet, create them
                if (particles.length === 0) {
                    for (let i = 0; i < logoPoints.length; i++) {
                        const p = new Particle(i);
                        p.logoTarget = logoPoints[i];
                        p.gridTarget = gridPoints[i % gridPoints.length];
                        particles.push(p);
                    }
                } else {
                    // Update existing particle targets
                    particles.forEach((p, i) => {
                        p.logoTarget = logoPoints[i % logoPoints.length];
                    });
                }
                
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
        
        // Generate a static grid for dispersed state
        function generateGridPoints() {
            gridPoints = [];
            const cols = CONFIG.gridColumns;
            const rows = CONFIG.gridRows;
            const spacingX = canvas.width / (cols + 1);
            const spacingY = canvas.height / (rows + 1);
            
            // Add randomization to grid positions for more organic feel
            const randomness = 0; // pixels of random offset
            
            for (let row = 1; row <= rows; row++) {
                for (let col = 1; col <= cols; col++) {
                    gridPoints.push({
                        x: col * spacingX + (Math.random() - 0.5) * randomness,
                        y: row * spacingY + (Math.random() - 0.5) * randomness
                    });
                }
            }
            
            // Shuffle grid points
            gridPoints = gridPoints.sort(() => Math.random() - 0.5);
        }
        
        // Mouse tracking with idle detection and parallax calculation
        window.addEventListener('mousemove', (e) => {
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Only allow idle mode on Index page
            if (enableLogoMode) {
                isIdle = false;
                
                clearTimeout(idleTimer);
                idleTimer = setTimeout(() => {
                    isIdle = true;
                }, CONFIG.idleTimeout);
            }
        });
        
        // Touch tracking for mobile devices
        let touchActive = false;
        window.addEventListener('touchstart', (e) => {
            touchActive = true;
            const touch = e.touches[0];
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            mouseX = touch.clientX;
            mouseY = touch.clientY;
            
            if (enableLogoMode) {
                isIdle = false;
                clearTimeout(idleTimer);
            }
        });
        
        window.addEventListener('touchmove', (e) => {
            if (touchActive) {
                const touch = e.touches[0];
                prevMouseX = mouseX;
                prevMouseY = mouseY;
                mouseX = touch.clientX;
                mouseY = touch.clientY;
                
                if (enableLogoMode) {
                    isIdle = false;
                    clearTimeout(idleTimer);
                }
            }
        });
        
        window.addEventListener('touchend', () => {
            touchActive = false;
            if (enableLogoMode) {
                idleTimer = setTimeout(() => {
                    isIdle = true;
                }, CONFIG.idleTimeout);
            }
        });
        
        // ========== PARTICLE CLASS ==========
        class Particle {
            constructor(index) {
                this.index = index;
                
                // Initial random position
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                
                // Base properties (used in logo/idle mode)
                this.baseSize = CONFIG.particleSize;
                this.baseOpacity = CONFIG.particleOpacity;
                
                // Current animated properties
                this.size = this.baseSize;
                this.opacity = this.baseOpacity;
                
                // Target positions for animation
                this.logoTarget = null;  // Position in logo outline
                this.gridTarget = null;  // Position in dispersed grid
                
                // === DEPTH LAYER ASSIGNMENT (for 3D effect in grid mode) ===
                // Random depth: 0 = furthest back, depthLayers-1 = closest front
                this.depthLayer = Math.floor(Math.random() * CONFIG.depthLayers);
                const layerRatio = this.depthLayer / Math.max(1, CONFIG.depthLayers - 1);
                
                // Depth size: interpolate between min (far) and max (near)
                this.depthSize = this.baseSize * (CONFIG.depthSizeMin + layerRatio * (CONFIG.depthSizeMax - CONFIG.depthSizeMin));
                
                // Depth opacity: multiply base opacity by depth multiplier
                const depthOpacityMultiplier = CONFIG.farPointOpacity + layerRatio * (CONFIG.nearPointOpacity - CONFIG.farPointOpacity);
                this.depthOpacity = this.baseOpacity * depthOpacityMultiplier;
                
                // Parallax intensity: closer particles move more with mouse
                this.parallaxMultiplier = CONFIG.parallaxMinMovement + layerRatio * (CONFIG.parallaxMaxMovement - CONFIG.parallaxMinMovement);
                
                // Random offset: prevents particles from overlapping at same grid position
                this.depthOffsetX = (Math.random() - 0.5) * CONFIG.depthOffsetMax * (1 - layerRatio);
                this.depthOffsetY = (Math.random() - 0.5) * CONFIG.depthOffsetMax * (1 - layerRatio);
            }
            
            update(isIdle) {
                // Choose target: logo outline when idle, grid when active
                let target = isIdle ? this.logoTarget : this.gridTarget;
                
                if (target) {
                    let targetX = target.x;
                    let targetY = target.y;
                    
                    // === GRID MODE: Apply depth effects ===
                    if (!isIdle) {
                        // Add depth separation offset
                        targetX += this.depthOffsetX;
                        targetY += this.depthOffsetY;
                        
                        // Add parallax movement (opposite to mouse direction)
                        if (CONFIG.enableParallax) {
                            const parallaxX = -parallaxOffsetX * this.parallaxMultiplier * CONFIG.parallaxMaxOffset;
                            const parallaxY = -parallaxOffsetY * this.parallaxMultiplier * CONFIG.parallaxMaxOffset;
                            targetX += parallaxX;
                            targetY += parallaxY;
                        }
                    }
                    
                    // Smooth easing animation towards target
                    const dx = targetX - this.x;
                    const dy = targetY - this.y;
                    const ease = isIdle ? CONFIG.idleEaseSpeed : CONFIG.activeEaseSpeed;
                    this.x += dx * ease;
                    this.y += dy * ease;
                }
                
                // === ANIMATE SIZE & OPACITY ===
                const targetSize = isIdle ? this.baseSize : this.depthSize;
                const targetOpacity = isIdle ? this.baseOpacity : this.depthOpacity;
                
                // Smooth transition (5% per frame)
                this.size += (targetSize - this.size) * 0.05;
                this.opacity += (targetOpacity - this.opacity) * 0.05;
                
                // Clamp opacity to prevent values outside [0, 1]
                this.opacity = Math.max(0, Math.min(1, this.opacity));
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = currentParticleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Also listen to visualViewport resize for mobile browsers
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', resizeCanvas);
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update parallax offset based on mouse movement
            if (CONFIG.enableParallax) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const targetOffsetX = (mouseX - centerX) / centerX;
                const targetOffsetY = (mouseY - centerY) / centerY;
                
                // Smoothly interpolate parallax offset
                parallaxOffsetX += (targetOffsetX - parallaxOffsetX) * CONFIG.parallaxSmoothness;
                parallaxOffsetY += (targetOffsetY - parallaxOffsetY) * CONFIG.parallaxSmoothness;
            }
            
            particles.forEach(particle => {
                particle.update(isIdle);
                particle.draw();
            });
            
            // Connect nearby particles with subtle lines
            if (CONFIG.enableLines) {
                // Dynamic line color based on theme
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const baseLineOpacity = CONFIG.lineOpacity;
                ctx.strokeStyle = isDark 
                    ? `rgba(255, 255, 255, ${baseLineOpacity})` 
                    : `rgba(0, 0, 0, ${baseLineOpacity})`;
                ctx.lineWidth = CONFIG.lineWidth;
                
                const maxDistance = isIdle ? CONFIG.idleLineDistance : CONFIG.activeLineDistance;
            
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < maxDistance) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            // Fade lines based on distance, using configured opacity as base
                            const fadeMultiplier = (maxDistance - distance) / maxDistance;
                            ctx.globalAlpha = fadeMultiplier * baseLineOpacity;
                            ctx.stroke();
                        }
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        // Start with configured initial state (only on Index page)
        if (enableLogoMode && CONFIG.startInIdleMode) {
            setTimeout(() => { isIdle = true; }, CONFIG.initialIdleDelay);
        }
        animate();
    }
    
    // Image Lightbox functionality
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const projectImages = document.querySelectorAll('.project-images img');

    // Open lightbox when clicking on project images
    projectImages.forEach(img => {
        img.addEventListener('click', function() {
            lightbox.style.display = 'block';
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
        });
    });

    // Close lightbox when clicking the X button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            lightbox.style.display = 'none';
        });
    }

    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }

    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            lightbox.style.display = 'none';
        }
    });

    // ========== THEME TOGGLE ==========
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    // Update particle color based on theme
    function updateParticleColor() {
        const theme = html.getAttribute('data-theme');
        const color = theme === 'dark' ? '#ffffff' : '#000000';
        // Update CSS variable for particle color
        document.documentElement.style.setProperty('--particle-color', color);
        // Dispatch custom event for canvas to pick up
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme, particleColor: color } }));
    }
    
    // Initial color setup
    updateParticleColor();
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateParticleColor();
        });
    }
});
