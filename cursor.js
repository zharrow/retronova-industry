/**
 * ARCADE CONNECT - CUSTOM CURSOR
 * Curseur fluide minimaliste avec effet liquide
 */

class FluidCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.cursorFluid = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isHovering = false;
        this.isClicking = false;
        
        this.init();
    }

    init() {
        // Vérification mobile
        if (this.isMobile()) {
            return;
        }

        this.createCursor();
        this.bindEvents();
        this.animate();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth <= 768 
               || ('ontouchstart' in window);
    }

    createCursor() {
        // Conteneur principal du curseur
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor';
        
        // Point central
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'cursor-dot';
        
        // Effet fluide
        this.cursorFluid = document.createElement('div');
        this.cursorFluid.className = 'cursor-fluid';
        
        this.cursor.appendChild(this.cursorDot);
        this.cursor.appendChild(this.cursorFluid);
        document.body.appendChild(this.cursor);
    }

    bindEvents() {
        // Mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // États du curseur
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            this.cursor.classList.add('click');
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            this.cursor.classList.remove('click');
        });

        // Hover sur éléments interactifs
        const interactiveElements = [
            'a', 'button', '.btn', '.access-card', '.feature-item', 
            '.form-input', 'input', 'textarea', '.nav-dot'
        ];

        interactiveElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.addEventListener('mouseenter', () => {
                    this.isHovering = true;
                    this.cursor.classList.add('hover');
                });

                element.addEventListener('mouseleave', () => {
                    this.isHovering = false;
                    this.cursor.classList.remove('hover');
                });
            });
        });

        // Masquer/Afficher le curseur
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
        });
    }

    animate() {
        // Animation fluide avec lerp
        this.currentX += (this.mouseX - this.currentX) * 0.15;
        this.currentY += (this.mouseY - this.currentY) * 0.15;

        // Position du curseur
        this.cursor.style.left = this.currentX + 'px';
        this.cursor.style.top = this.currentY + 'px';

        // Effet de déformation fluide basé sur la vitesse
        const deltaX = this.mouseX - this.currentX;
        const deltaY = this.mouseY - this.currentY;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Déformation subtile
        const scaleX = 1 + Math.min(velocity * 0.003, 0.3);
        const scaleY = 1 - Math.min(velocity * 0.002, 0.2);
        const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        if (this.cursorFluid && velocity > 2) {
            this.cursorFluid.style.transform = `
                translate(-50%, -50%) 
                rotate(${rotation}deg)
                scaleX(${scaleX}) 
                scaleY(${scaleY})
            `;
        } else if (this.cursorFluid) {
            this.cursorFluid.style.transform = 'translate(-50%, -50%) scale(1)';
        }

        requestAnimationFrame(() => this.animate());
    }

    // Méthodes publiques
    hide() {
        if (this.cursor) {
            this.cursor.style.opacity = '0';
        }
    }

    show() {
        if (this.cursor) {
            this.cursor.style.opacity = '1';
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.fluidCursor = new FluidCursor();
});

// Masquer le curseur pendant le chargement
window.addEventListener('load', () => {
    if (window.fluidCursor) {
        window.fluidCursor.show();
    }
});