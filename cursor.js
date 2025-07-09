/**
 * ARCADE CONNECT - CUSTOM CURSOR
 * Curseur fluide minimaliste avec effet liquide
 */

class FluidCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.cursorFluid = null;
        this.cursorRing = null;
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
        
        // Anneau externe (optionnel pour plus de visibilité)
        this.cursorRing = document.createElement('div');
        this.cursorRing.className = 'cursor-ring';
        this.cursorRing.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 25px;
            height: 25px;
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.3s ease;
        `;
        
        this.cursor.appendChild(this.cursorFluid);
        this.cursor.appendChild(this.cursorRing);
        this.cursor.appendChild(this.cursorDot);
        document.body.appendChild(this.cursor);
        
        // Position initiale au centre
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.currentX = this.mouseX;
        this.currentY = this.mouseY;
        
        // Masquer au début
        this.cursor.style.opacity = '0';
    }

    bindEvents() {
        // Mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Afficher le curseur quand la souris bouge
            if (this.cursor.style.opacity === '0') {
                this.cursor.style.opacity = '1';
            }
        });

        // États du curseur
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            this.cursor.classList.add('click');
            if (this.cursorRing) {
                this.cursorRing.style.transform = 'translate(-50%, -50%) scale(0.8)';
            }
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            this.cursor.classList.remove('click');
            if (this.cursorRing) {
                this.cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });

        // Hover sur éléments interactifs - ajouter plus d'éléments
        const interactiveSelectors = [
            'a', 'button', '.btn', '.access-card', '.feature-item', 
            '.form-input', 'input', 'textarea', '.nav-dot',
            '[role="button"]', '[onclick]', 'label'
        ];

        // Fonction pour ajouter les événements hover
        const addHoverEvents = (element) => {
            element.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.cursor.classList.add('hover');
                if (this.cursorRing) {
                    this.cursorRing.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                    this.cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
                }
            });

            element.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.cursor.classList.remove('hover');
                if (this.cursorRing) {
                    this.cursorRing.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    this.cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });
        };

        // Appliquer à tous les éléments existants
        interactiveSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                addHoverEvents(element);
            });
        });

        // Observer pour les nouveaux éléments
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        interactiveSelectors.forEach(selector => {
                            if (node.matches && node.matches(selector)) {
                                addHoverEvents(node);
                            }
                            if (node.querySelectorAll) {
                                node.querySelectorAll(selector).forEach(element => {
                                    addHoverEvents(element);
                                });
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Masquer/Afficher le curseur
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
        });
        
        // Masquer sur les iframes (vidéos)
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.addEventListener('mouseenter', () => {
                this.cursor.style.opacity = '0';
            });
            iframe.addEventListener('mouseleave', () => {
                this.cursor.style.opacity = '1';
            });
        });
    }

    animate() {
        // Animation fluide avec lerp
        this.currentX += (this.mouseX - this.currentX) * 0.2;
        this.currentY += (this.mouseY - this.currentY) * 0.2;

        // Position du curseur
        if (this.cursor) {
            this.cursor.style.left = this.currentX + 'px';
            this.cursor.style.top = this.currentY + 'px';
        }

        // Effet de déformation fluide basé sur la vitesse
        const deltaX = this.mouseX - this.currentX;
        const deltaY = this.mouseY - this.currentY;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Déformation subtile du fluide uniquement si en mouvement
        if (this.cursorFluid && velocity > 1 && !this.isHovering) {
            const scaleX = 1 + Math.min(velocity * 0.008, 0.5);
            const scaleY = 1 - Math.min(velocity * 0.005, 0.3);
            const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            
            this.cursorFluid.style.transform = `
                translate(-50%, -50%) 
                rotate(${rotation}deg)
                scaleX(${scaleX}) 
                scaleY(${scaleY})
            `;
        } else if (this.cursorFluid && !this.isHovering && !this.isClicking) {
            // Réinitialisation progressive
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
            // Force le rendu initial
            this.cursor.style.left = this.currentX + 'px';
            this.cursor.style.top = this.currentY + 'px';
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🖱️ Initialisation du curseur fluide...');
    window.fluidCursor = new FluidCursor();
});

// Masquer le curseur pendant le chargement
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.fluidCursor) {
            window.fluidCursor.show();
            console.log('✅ Curseur fluide activé');
        }
    }, 100); // Petit délai pour s'assurer que tout est chargé
});