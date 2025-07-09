/**
 * ARCADE CONNECT - CUSTOM CURSOR
 * Curseur personnalisé rétro-futuriste avec effets interactifs
 */

class ArcadeCursor {
    constructor() {
        this.init();
        this.bindEvents();
    }

    init() {
        // Sélection des éléments du curseur
        this.cursorDot = document.querySelector('.cursor-dot');
        this.cursorOutline = document.querySelector('.cursor-outline');
        
        // Position initiale
        this.mouseX = 0;
        this.mouseY = 0;
        this.outlineX = 0;
        this.outlineY = 0;
        
        // État du curseur
        this.isHovering = false;
        this.isClicking = false;
        
        // Vérification mobile
        this.isMobile = this.checkMobile();
        
        if (this.isMobile) {
            this.disableCursor();
            return;
        }
        
        // Animation du curseur
        this.animateCursor();
        
        console.log('🎯 Curseur personnalisé initialisé');
    }

    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth <= 768;
    }

    disableCursor() {
        document.body.style.cursor = 'auto';
        if (this.cursorDot) this.cursorDot.style.display = 'none';
        if (this.cursorOutline) this.cursorOutline.style.display = 'none';
    }

    bindEvents() {
        if (this.isMobile) return;

        // Mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Animation du point central (plus rapide)
            if (this.cursorDot) {
                this.cursorDot.style.left = (this.mouseX - 4) + 'px';
                this.cursorDot.style.top = (this.mouseY - 4) + 'px';
            }
        });

        // Événements de clic
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            this.updateCursorState();
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            this.updateCursorState();
        });

        // Hover sur éléments interactifs
        this.bindHoverEvents();
    }

    bindHoverEvents() {
        const interactiveElements = [
            'a', 'button', '.btn', '.access-card', '.feature-item', 
            '.form-input', 'input', 'textarea', '[data-cursor="hover"]'
        ];

        interactiveElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.addEventListener('mouseenter', () => {
                    this.isHovering = true;
                    this.updateCursorState();
                });

                element.addEventListener('mouseleave', () => {
                    this.isHovering = false;
                    this.updateCursorState();
                });
            });
        });

        // Curseur spécial pour la borne d'arcade
        const arcadeMachine = document.querySelector('.arcade-machine-container');
        if (arcadeMachine) {
            arcadeMachine.addEventListener('mouseenter', () => {
                this.setCursorStyle('gaming');
            });

            arcadeMachine.addEventListener('mouseleave', () => {
                this.setCursorStyle('default');
            });
        }
    }

    updateCursorState() {
        if (!this.cursorDot || !this.cursorOutline) return;

        // Suppression des classes d'état
        document.body.classList.remove('cursor-hover', 'cursor-click');

        // Application des nouvelles classes
        if (this.isClicking) {
            document.body.classList.add('cursor-click');
        } else if (this.isHovering) {
            document.body.classList.add('cursor-hover');
        }
    }

    setCursorStyle(style) {
        if (!this.cursorDot || !this.cursorOutline) return;

        switch (style) {
            case 'gaming':
                this.cursorDot.style.background = '#fbbf24'; // Jaune gaming
                this.cursorOutline.style.borderColor = '#fbbf24';
                this.cursorOutline.style.transform = 'scale(1.3)';
                break;
            
            case 'loading':
                this.cursorDot.style.background = '#8b5cf6';
                this.cursorOutline.style.borderColor = '#8b5cf6';
                this.cursorOutline.style.animation = 'spin 1s linear infinite';
                break;
            
            case 'success':
                this.cursorDot.style.background = '#10b981';
                this.cursorOutline.style.borderColor = '#10b981';
                break;
            
            default:
                this.cursorDot.style.background = '#06b6d4';
                this.cursorOutline.style.borderColor = '#8b5cf6';
                this.cursorOutline.style.transform = 'scale(1)';
                this.cursorOutline.style.animation = 'none';
                break;
        }
    }

    animateCursor() {
        if (this.isMobile) return;

        // Animation fluide du contour (plus lent, effet de traînée)
        this.outlineX += (this.mouseX - this.outlineX) * 0.2;
        this.outlineY += (this.mouseY - this.outlineY) * 0.2;

        if (this.cursorOutline) {
            this.cursorOutline.style.left = (this.outlineX - 15) + 'px';
            this.cursorOutline.style.top = (this.outlineY - 15) + 'px';
        }

        requestAnimationFrame(() => this.animateCursor());
    }

    // Méthodes publiques pour contrôler le curseur
    hide() {
        if (this.cursorDot) this.cursorDot.style.opacity = '0';
        if (this.cursorOutline) this.cursorOutline.style.opacity = '0';
    }

    show() {
        if (this.cursorDot) this.cursorDot.style.opacity = '1';
        if (this.cursorOutline) this.cursorOutline.style.opacity = '0.7';
    }

    setLoadingState() {
        this.setCursorStyle('loading');
    }

    setSuccessState() {
        this.setCursorStyle('success');
        setTimeout(() => this.setCursorStyle('default'), 2000);
    }
}

// Initialisation du curseur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.arcadeCursor = new ArcadeCursor();
});

// Gestion des événements de visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (window.arcadeCursor) {
        if (document.hidden) {
            window.arcadeCursor.hide();
        } else {
            window.arcadeCursor.show();
        }
    }
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArcadeCursor;
}