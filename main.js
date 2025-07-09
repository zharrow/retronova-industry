/**
 * ARCADE CONNECT - Main Script
 * Version minimaliste avec micro-interactions subtiles
 */

class ArcadeWebsite {
    constructor() {
        this.init();
    }

    init() {
        // Éléments DOM
        this.sections = document.querySelectorAll('.section');
        this.navDots = document.querySelectorAll('.nav-dot');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.contactForm = document.getElementById('contactForm');
        this.arcadeContainer = document.getElementById('arcadeContainer');
        
        // États
        this.currentSection = 0;
        this.isScrolling = false;
        
        // Initialisation
        this.setupGSAP();
        this.setupScrolling();
        this.setupNavigation();
        this.setupForm();
        this.initArcadeMachine();
        this.handleLoading();
    }

    setupGSAP() {
        gsap.registerPlugin(ScrollTrigger);
        
        // Configuration globale minimaliste
        gsap.defaults({
            ease: "power2.out",
            duration: 0.6
        });
    }

    setupScrolling() {
        // Scroll horizontal fluide
        let isScrolling = false;
        
        window.addEventListener('wheel', (e) => {
            if (isScrolling) return;
            
            const direction = e.deltaY > 0 ? 1 : -1;
            const nextSection = this.currentSection + direction;
            
            if (nextSection >= 0 && nextSection < this.sections.length) {
                isScrolling = true;
                this.scrollToSection(nextSection);
                
                setTimeout(() => {
                    isScrolling = false;
                }, 800);
            }
        }, { passive: true });

        // Touch support pour mobile
        let touchStartY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        window.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > 50) {
                const direction = diff > 0 ? 1 : -1;
                const nextSection = this.currentSection + direction;
                
                if (nextSection >= 0 && nextSection < this.sections.length) {
                    this.scrollToSection(nextSection);
                }
            }
        }, { passive: true });
    }

    scrollToSection(index) {
        this.currentSection = index;
        const targetSection = this.sections[index];
        
        // Animation de scroll native
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Mise à jour de la navigation
        this.updateNavigation();
    }

    updateNavigation() {
        this.navDots.forEach((dot, index) => {
            if (index === this.currentSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    setupNavigation() {
        // Navigation par points
        this.navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.scrollToSection(index);
            });
        });
        
        // Navigation clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                const next = Math.min(this.currentSection + 1, this.sections.length - 1);
                this.scrollToSection(next);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                const prev = Math.max(this.currentSection - 1, 0);
                this.scrollToSection(prev);
            }
        });
        
        // Smooth scroll pour les liens
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                
                // Trouver l'index de la section correspondante
                let targetIndex = -1;
                this.sections.forEach((section, index) => {
                    if (section.dataset.section === targetId) {
                        targetIndex = index;
                    }
                });
                
                if (targetIndex !== -1) {
                    this.scrollToSection(targetIndex);
                }
            });
        });
    }

    setupAnimations() {
        // Animation de rotation de la borne synchronisée avec le scroll
        if (this.arcadeMachine3D) {
            ScrollTrigger.create({
                trigger: ".main-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    // Rotation progressive de la borne
                    const rotation = self.progress * 360;
                    if (this.arcadeMachine3D && this.arcadeMachine3D.arcadeMachine) {
                        gsap.to(this.arcadeMachine3D.arcadeMachine.rotation, {
                            y: rotation * (Math.PI / 180),
                            duration: 0.1,
                            ease: "none"
                        });
                    }
                    
                    // Mise à jour de la section active
                    const currentIndex = Math.floor(self.progress * this.sections.length);
                    if (currentIndex !== this.currentSection && currentIndex < this.sections.length) {
                        this.currentSection = currentIndex;
                        this.updateNavigation();
                    }
                }
            });

            // Fade de la borne sur la dernière section
            gsap.to(this.arcadeContainer, {
                opacity: 0,
                scale: 0.8,
                scrollTrigger: {
                    trigger: "[data-section='contact']",
                    start: "top 70%",
                    end: "top 30%",
                    scrub: 1
                }
            });
        }

        // Animations d'entrée subtiles pour chaque section
        this.sections.forEach((section, index) => {
            const content = section.querySelector('.section-content');
            if (!content) return;
            
            // Animation initiale seulement pour les sections non visibles
            if (index > 0) {
                gsap.set(content, {
                    opacity: 0,
                    y: 20
                });
            }
            
            // Fade des sections autour de la borne
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => {
                    // Fade in de la section
                    gsap.to(section, {
                        opacity: 1,
                        duration: 0.6
                    });
                    
                    if (index > 0) {
                        gsap.to(content, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            delay: 0.1
                        });
                    }
                    
                    // Animations des éléments enfants
                    this.animateSectionElements(section);
                },
                onLeave: () => {
                    // Fade out de la section
                    gsap.to(section, {
                        opacity: 0.3,
                        duration: 0.6
                    });
                },
                onEnterBack: () => {
                    // Retour du fade
                    gsap.to(section, {
                        opacity: 1,
                        duration: 0.6
                    });
                },
                onLeaveBack: () => {
                    // Fade out en remontant
                    if (index > 0) {
                        gsap.to(section, {
                            opacity: 0.3,
                            duration: 0.6
                        });
                    }
                }
            });
        });
    }

    animateSectionElements(section) {
        // Animation des cards
        const cards = section.querySelectorAll('.access-card');
        if (cards.length > 0) {
            gsap.fromTo(cards,
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    delay: 0.3
                }
            );
        }
        
        // Animation des features
        const features = section.querySelectorAll('.feature-item');
        if (features.length > 0) {
            gsap.fromTo(features,
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    delay: 0.2
                }
            );
        }
    }

    initArcadeMachine() {
        // Initialisation de la borne 3D avec gestion d'erreur
        if (typeof THREE !== 'undefined' && window.ArcadeMachine3D) {
            try {
                this.arcadeMachine3D = new ArcadeMachine3D(this.arcadeContainer);
                
                // Setup des animations après l'initialisation
                setTimeout(() => {
                    this.setupAnimations();
                }, 100);
                
            } catch (error) {
                console.error('Erreur initialisation borne 3D:', error);
                this.createFallback();
            }
        } else {
            // Retry après un délai
            setTimeout(() => {
                if (window.ArcadeMachine3D) {
                    this.initArcadeMachine();
                } else {
                    this.createFallback();
                }
            }, 1000);
        }
    }

    createFallback() {
        // Fallback minimaliste
        const fallback = document.createElement('div');
        fallback.className = 'arcade-fallback';
        fallback.innerHTML = `
            <div class="arcade-icon">🎮</div>
        `;
        this.arcadeContainer.appendChild(fallback);
    }

    setupForm() {
        if (!this.contactForm) return;
        
        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const button = e.target.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            
            // État de chargement
            button.textContent = 'Envoi en cours...';
            button.disabled = true;
            
            // Simulation d'envoi
            await this.simulateFormSubmit();
            
            // Succès
            button.textContent = '✓ Message envoyé';
            button.style.backgroundColor = 'var(--accent-cyan)';
            
            // Reset après 3 secondes
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.backgroundColor = '';
                this.contactForm.reset();
            }, 3000);
        });
        
        // Focus effects subtils
        const inputs = this.contactForm.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = '';
            });
        });
    }

    simulateFormSubmit() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500);
        });
    }

    handleLoading() {
        // Masquer le loading une fois tout chargé
        window.addEventListener('load', () => {
            gsap.to(this.loadingOverlay, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    this.loadingOverlay.style.display = 'none';
                }
            });
            
            // Animation d'entrée pour le hero
            const heroContent = document.querySelector('.section:first-child .section-content');
            if (heroContent) {
                gsap.fromTo(heroContent,
                    { opacity: 0, y: 20 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.8, 
                        delay: 0.3 
                    }
                );
            }
        });
    }
}

// Styles additionnels pour le fallback
const fallbackStyles = `
<style>
.arcade-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
}

.arcade-icon {
    font-size: 4rem;
    opacity: 0.5;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
}

/* Button group */
.button-group {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
}

/* Form parent animation */
.form-group {
    transition: transform 0.2s ease;
}

/* Section visible state */
.section.visible .section-content {
    opacity: 1;
    transform: translateY(0);
}
</style>
`;

// Injection des styles
document.head.insertAdjacentHTML('beforeend', fallbackStyles);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.arcadeWebsite = new ArcadeWebsite();
});

// Optimisation des performances
document.addEventListener('visibilitychange', () => {
    if (window.arcadeWebsite && window.arcadeWebsite.arcadeMachine3D) {
        if (document.hidden) {
            window.arcadeWebsite.arcadeMachine3D.pauseAnimation?.();
        } else {
            window.arcadeWebsite.arcadeMachine3D.resumeAnimation?.();
        }
    }
});