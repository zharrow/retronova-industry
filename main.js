/**
 * ARCADE CONNECT - MAIN SCRIPT
 * Logique principale avec GSAP, ScrollTrigger et animations
 */

class ArcadeWebsite {
    constructor() {
        this.initGSAP();
        this.initElements();
        this.setupAnimations();
        this.bindEvents();
        this.handleLoading();
    }

    initGSAP() {
        // Enregistrement des plugins GSAP
        gsap.registerPlugin(ScrollTrigger);
        
        // Configuration globale GSAP
        gsap.defaults({
            ease: "power2.out",
            duration: 0.8
        });

        console.log('🎮 GSAP initialisé avec ScrollTrigger');
    }

    initElements() {
        // Éléments principaux
        this.sections = document.querySelectorAll('.section');
        this.arcadeContainer = document.getElementById('arcadeContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.contactForm = document.querySelector('.contact-form');
        
        // Éléments interactifs
        this.formInputs = document.querySelectorAll('.form-input');
        this.buttons = document.querySelectorAll('.btn');
        this.cards = document.querySelectorAll('.access-card');
        this.features = document.querySelectorAll('.feature-item');

        // Initialisation de la borne 3D
        this.arcadeMachine3D = null;
        
        // Détection mobile
        this.isMobile = this.detectMobile();
        
        // Configuration spécifique mobile
        if (this.isMobile) {
            this.setupMobileExperience();
        }

        console.log(`📋 ${this.sections.length} sections trouvées (Mobile: ${this.isMobile})`);
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth <= 768 
               || ('ontouchstart' in window);
    }

    setupMobileExperience() {
        // Ajout des indicateurs de navigation mobile
        this.createMobileIndicators();
        
        // Configuration du scroll mobile
        this.setupMobileScroll();
        
        // Optimisation des performances mobile
        this.optimizeMobilePerformance();
        
        console.log('📱 Expérience mobile configurée');
    }

    createMobileIndicators() {
        const indicator = document.createElement('div');
        indicator.className = 'mobile-section-indicator';
        
        this.sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'section-dot';
            dot.dataset.section = index;
            indicator.appendChild(dot);
            
            // Navigation au tap
            dot.addEventListener('click', () => {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: section,
                    ease: "power2.inOut"
                });
            });
        });
        
        document.body.appendChild(indicator);
        this.mobileIndicator = indicator;
    }

    setupMobileScroll() {
        // Mise à jour des indicateurs au scroll
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: () => {
                this.updateMobileIndicators();
            }
        });
        
        // Scroll snap sur mobile pour une meilleure UX
        if (this.isMobile) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    updateMobileIndicators() {
        if (!this.mobileIndicator) return;
        
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        this.sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const dot = this.mobileIndicator.querySelector(`[data-section="${index}"]`);
            
            if (scrollY >= sectionTop - windowHeight/2 && 
                scrollY < sectionTop + sectionHeight - windowHeight/2) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    optimizeMobilePerformance() {
        // Réduction de la fréquence des animations sur mobile
        if (this.isMobile) {
            gsap.globalTimeline.timeScale(0.8); // Ralentir légèrement les animations
            
            // Pause des animations quand la page n'est pas visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    gsap.globalTimeline.pause();
                } else {
                    gsap.globalTimeline.resume();
                }
            });
        }
    }

    setupAnimations() {
        this.setupArcadeMachineAnimation();
        this.setupSectionAnimations();
        this.setupInteractiveElements();
        this.setupParallaxEffects();
    }

    setupArcadeMachineAnimation() {
        if (!this.arcadeContainer) return;

        // Initialisation de la borne 3D Three.js
        this.initArcadeMachine3D();

        // Animation de rotation synchronisée avec le scroll
        ScrollTrigger.create({
            trigger: ".main-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                if (this.arcadeMachine3D) {
                    const rotation = self.progress * 360;
                    this.arcadeMachine3D.setRotation(rotation);
                }
            }
        });

        // Fondu et passage en arrière-plan vers la fin
        gsap.to(this.arcadeContainer, {
            opacity: 0,
            scale: 0.6,
            filter: "blur(5px)",
            visibility: "hidden",
            scrollTrigger: {
                trigger: "[data-section='contact']",
                start: "top 70%",
                end: "top 30%",
                scrub: 1,
                ease: "power2.out"
            }
        });

        // Modification du z-index et visibilité
        ScrollTrigger.create({
            trigger: "[data-section='contact']",
            start: "top 60%",
            onEnter: () => {
                this.arcadeContainer.style.zIndex = "1";
                this.arcadeContainer.style.pointerEvents = "none";
            },
            onLeaveBack: () => {
                this.arcadeContainer.style.zIndex = "10";
                this.arcadeContainer.style.pointerEvents = "auto";
                this.arcadeContainer.style.visibility = "visible";
            }
        });

        console.log('🕹️ Borne 3D Three.js configurée');
    }

    initArcadeMachine3D() {
        // Vérification que Three.js est disponible
        if (typeof THREE === 'undefined') {
            console.warn('⚠️ Three.js non disponible, utilisation du fallback');
            this.createFallbackMachine();
            return;
        }

        // Fonction d'initialisation avec retry
        const tryInit = (attempts = 0) => {
            if (window.ArcadeMachine3D && this.arcadeContainer) {
                try {
                    this.arcadeMachine3D = new ArcadeMachine3D(this.arcadeContainer);
                    console.log('🎮 Borne 3D Three.js initialisée avec succès');
                } catch (error) {
                    console.error('❌ Erreur lors de l\'initialisation de la borne 3D:', error);
                    this.createFallbackMachine();
                }
            } else if (attempts < 10) {
                // Retry pendant 1 seconde max
                setTimeout(() => tryInit(attempts + 1), 100);
            } else {
                console.warn('⚠️ ArcadeMachine3D non disponible après 1s, utilisation du fallback');
                this.createFallbackMachine();
            }
        };

        // Démarrer l'initialisation avec un petit délai
        setTimeout(() => tryInit(), 50);
    }

    createFallbackMachine() {
        // Fallback plus informatif
        const fallback = document.createElement('div');
        fallback.className = 'arcade-placeholder';
        
        // Déterminer la raison du fallback
        let reason = '3D Loading...';
        if (typeof THREE === 'undefined') {
            reason = 'Three.js<br>Loading...';
        } else if (!window.ArcadeMachine3D) {
            reason = 'Scripts<br>Loading...';
        } else {
            reason = 'Initializing<br>3D Scene...';
        }
        
        fallback.innerHTML = `
            <div class="arcade-content">
                🎮<br>
                ARCADE<br>
                <small>${reason}</small>
            </div>
        `;
        
        this.arcadeContainer.appendChild(fallback);
        
        // Essayer de nouveau dans 2 secondes si c'est juste un problème de timing
        setTimeout(() => {
            if (window.ArcadeMachine3D && typeof THREE !== 'undefined') {
                console.log('🔄 Retry initialisation de la borne 3D...');
                this.arcadeContainer.innerHTML = '';
                this.initArcadeMachine3D();
            }
        }, 2000);
        
        console.log('📦 Fallback arcade créé:', reason);
    }

    setupSectionAnimations() {
        this.sections.forEach((section, index) => {
            const content = section.querySelector('.section-content');
            if (!content) return;

            // Configuration différente pour la première section visible
            const isFirstSection = index === 0;
            const isSecondSection = index === 1;

            // Animation d'apparition adaptée mobile/desktop
            const animationConfig = this.isMobile ? {
                // Animation simplifiée sur mobile
                opacity: isFirstSection ? 1 : 0, // Première section déjà visible
                y: isFirstSection ? 0 : 30,
                scale: 1
            } : {
                // Animation complète sur desktop
                opacity: isFirstSection ? 1 : 0, // Première section déjà visible
                y: isFirstSection ? 0 : 60,
                scale: isFirstSection ? 1 : 0.95
            };

            // Pas d'animation pour la première section, elle est déjà visible
            if (isFirstSection) {
                gsap.set(content, { opacity: 1, y: 0, scale: 1 });
                return;
            }

            gsap.fromTo(content, 
                animationConfig,
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: this.isMobile ? 0.6 : 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: this.isMobile ? "top 85%" : "top 75%", // Déclenchement plus tard
                        end: this.isMobile ? "top 50%" : "top 30%",
                        toggleActions: "play none none reverse",
                        // Debug pour la deuxième section
                        onEnter: () => {
                            if (isSecondSection) {
                                console.log('🎯 Section Concept visible');
                            }
                        }
                    }
                }
            );

            // Animation des features avec délai adaptatif
            const sectionFeatures = section.querySelectorAll('.feature-item');
            if (sectionFeatures.length > 0) {
                gsap.fromTo(sectionFeatures,
                    {
                        opacity: 0,
                        y: this.isMobile ? 20 : 30,
                        scale: this.isMobile ? 1 : 0.9
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: this.isMobile ? 0.4 : 0.6,
                        stagger: this.isMobile ? 0.05 : 0.1,
                        ease: this.isMobile ? "power2.out" : "back.out(1.7)",
                        scrollTrigger: {
                            trigger: section,
                            start: this.isMobile ? "top 80%" : "top 65%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }

            // Animation des cards d'accès adaptée mobile
            const sectionCards = section.querySelectorAll('.access-card');
            if (sectionCards.length > 0) {
                const cardAnimation = this.isMobile ? {
                    // Animation simplifiée mobile
                    opacity: 0,
                    y: 30,
                    x: 0,
                    rotateY: 0
                } : {
                    // Animation complète desktop
                    opacity: 0,
                    x: index % 2 === 0 ? -50 : 50,
                    rotateY: index % 2 === 0 ? -10 : 10
                };

                gsap.fromTo(sectionCards,
                    cardAnimation,
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        rotateY: 0,
                        duration: this.isMobile ? 0.5 : 0.8,
                        stagger: this.isMobile ? 0.1 : 0.15,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section,
                            start: this.isMobile ? "top 80%" : "top 65%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }
        });

        console.log(`📄 Animations des sections configurées (Mobile: ${this.isMobile}, Première section fixe)`);
    }

    setupInteractiveElements() {
        // Animations des formulaires
        this.formInputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                gsap.to(e.target, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                // Effet de curseur si disponible
                if (window.arcadeCursor) {
                    window.arcadeCursor.setCursorStyle('gaming');
                }
            });
            
            input.addEventListener('blur', (e) => {
                gsap.to(e.target, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                if (window.arcadeCursor) {
                    window.arcadeCursor.setCursorStyle('default');
                }
            });
        });

        // Hover effects boutons
        this.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            // Effet de clic
            btn.addEventListener('click', () => {
                gsap.to(btn, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            });
        });

        console.log('🎯 Éléments interactifs configurés');
    }

    setupParallaxEffects() {
        // Parallax subtil sur les titres
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.fromTo(title,
                { y: 0 },
                {
                    y: -50,
                    scrollTrigger: {
                        trigger: title,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }
                }
            );
        });

        // Parallax sur les icônes de features
        gsap.utils.toArray('.feature-icon').forEach(icon => {
            gsap.fromTo(icon,
                { rotateY: 0 },
                {
                    rotateY: 360,
                    scrollTrigger: {
                        trigger: icon,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 2
                    }
                }
            );
        });

        console.log('🌊 Effets parallax configurés');
    }

    bindEvents() {
        // Gestion du formulaire
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(e);
            });
        }

        // Gestion du redimensionnement
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });

        // Navigation fluide pour les ancres
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: target,
                        ease: "power2.inOut"
                    });
                }
            });
        });

        console.log('🔗 Événements liés');
    }

    handleFormSubmission(e) {
        const submitBtn = e.target.querySelector('.btn-primary');
        if (!submitBtn) return;

        // Animation de soumission
        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });

        // Curseur en mode loading
        if (window.arcadeCursor) {
            window.arcadeCursor.setLoadingState();
        }
        
        submitBtn.innerHTML = 'Connexion en cours... ⚡';
        submitBtn.disabled = true;
        
        // Simulation d'envoi
        setTimeout(() => {
            submitBtn.innerHTML = 'Message envoyé ! ✨';
            
            gsap.fromTo(submitBtn, 
                { backgroundColor: '#8b5cf6' },
                { backgroundColor: '#10b981', duration: 0.5 }
            );

            if (window.arcadeCursor) {
                window.arcadeCursor.setSuccessState();
            }
            
            setTimeout(() => {
                submitBtn.innerHTML = 'Lancer la connexion 🚀';
                submitBtn.disabled = false;
                gsap.to(submitBtn, { backgroundColor: '#8b5cf6', duration: 0.5 });
            }, 2000);
        }, 1500);

        console.log('📧 Formulaire soumis avec animation');
    }

    handleLoading() {
        window.addEventListener('load', () => {
            // Animation de disparition du loading
            gsap.to(this.loadingOverlay, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => {
                    this.loadingOverlay.style.display = 'none';
                }
            });

            // Animation d'entrée pour la première section seulement
            const firstSectionContent = document.querySelector('.section:first-child .section-content');
            if (firstSectionContent) {
                gsap.fromTo(firstSectionContent, 
                    { opacity: 0, y: 30 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.8, 
                        ease: "power2.out", 
                        delay: 0.3 
                    }
                );
            }

            console.log('🚀 Site chargé et première section animée');
        });
    }

    // Méthodes publiques pour contrôler les animations
    pauseAnimations() {
        gsap.globalTimeline.pause();
        ScrollTrigger.getAll().forEach(trigger => trigger.disable());
    }

    resumeAnimations() {
        gsap.globalTimeline.resume();
        ScrollTrigger.getAll().forEach(trigger => trigger.enable());
    }

    refreshScrollTrigger() {
        ScrollTrigger.refresh();
    }
}

// Initialisation du site
document.addEventListener('DOMContentLoaded', () => {
    window.arcadeWebsite = new ArcadeWebsite();
    console.log('🎮 Arcade Connect - Website initialisé');
});

// Debug helpers (seulement en développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('keydown', (e) => {
        // Ctrl + D pour debug ScrollTrigger
        if (e.ctrlKey && e.key === 'd') {
            ScrollTrigger.getAll().forEach(trigger => {
                console.log(trigger);
            });
        }
        
        // Ctrl + R pour refresh ScrollTrigger
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            ScrollTrigger.refresh();
            console.log('🔄 ScrollTrigger refreshed');
        }
    });
}