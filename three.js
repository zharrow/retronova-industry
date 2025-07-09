/**
 * ARCADE CONNECT - THREE.JS 3D MACHINE
 * Version minimaliste avec design monochrome et accents subtils
 */

class ArcadeMachine3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arcadeMachine = null;
        this.animationId = null;
        
        this.init();
        this.createMinimalArcade();
        this.setupLighting();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 6);

        // Renderer avec antialiasing
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    createMinimalArcade() {
        this.arcadeMachine = new THREE.Group();

        // Couleurs monochromes
        const colors = {
            base: 0x1a1a1a,      // Noir profond
            accent: 0x8b5cf6,    // Violet accent (utilisé avec parcimonie)
            screen: 0x0a0a0a,    // Noir écran
            metal: 0x2a2a2a,    // Gris métallique
            light: 0xfafafa     // Blanc cassé
        };

        // === CABINET PRINCIPAL ===
        const cabinetGeometry = new THREE.BoxGeometry(2, 4, 1.5, 4, 4, 4);
        
        // Modification subtile des vertices pour forme organique
        const vertices = cabinetGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const y = vertices[i + 1];
            if (y > 1) {
                vertices[i + 2] -= (y - 1) * 0.1; // Légère inclinaison
            }
        }
        cabinetGeometry.computeVertexNormals();

        const cabinetMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.base,
            metalness: 0.3,
            roughness: 0.7,
            clearcoat: 0.1,
            clearcoatRoughness: 0.8
        });

        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
        cabinet.position.y = -0.5;
        cabinet.castShadow = true;
        cabinet.receiveShadow = true;

        // === ÉCRAN ===
        const screenGroup = new THREE.Group();
        
        // Écran principal
        const screenGeometry = new THREE.PlaneGeometry(1.4, 1.0);
        const screenMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.screen,
            metalness: 0.1,
            roughness: 0.1,
            emissive: colors.accent,
            emissiveIntensity: 0.02 // Très subtil glow violet
        });
        
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 0.3, 0.76);

        // Cadre de l'écran - minimaliste
        const frameGeometry = new THREE.BoxGeometry(1.6, 1.2, 0.1);
        const frameMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.metal,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 0.3, 0.75);
        
        // Découpe pour l'écran
        const hole = new THREE.BoxGeometry(1.4, 1.0, 0.2);
        const frameCSG = new THREE.Mesh(frameGeometry);
        const holeCSG = new THREE.Mesh(hole);
        holeCSG.position.copy(frame.position);

        screenGroup.add(screen);
        screenGroup.add(frame);

        // === CONTRÔLES MINIMALISTES ===
        const controlsGroup = new THREE.Group();
        
        // Panel de contrôle
        const panelGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.6);
        const panelMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.metal,
            metalness: 0.5,
            roughness: 0.6
        });
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, -1.2, 0.4);
        panel.rotation.x = -0.2;

        // Joystick simplifié
        const joystickBase = new THREE.CylinderGeometry(0.08, 0.1, 0.05);
        const joystickStick = new THREE.CylinderGeometry(0.04, 0.04, 0.2);
        const joystickMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.base,
            metalness: 0.7,
            roughness: 0.3
        });

        const jBase = new THREE.Mesh(joystickBase, joystickMaterial);
        const jStick = new THREE.Mesh(joystickStick, joystickMaterial);
        jBase.position.set(-0.4, -1.15, 0.7);
        jStick.position.set(-0.4, -1.05, 0.7);

        // Boutons minimalistes
        const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.03);
        const buttonPositions = [
            [0.2, -1.15, 0.7],
            [0.35, -1.05, 0.7],
            [0.5, -1.15, 0.7],
            [0.65, -1.05, 0.7]
        ];

        buttonPositions.forEach((pos, index) => {
            const material = new THREE.MeshPhysicalMaterial({
                color: index === 0 ? colors.accent : colors.base, // Un seul bouton accent
                metalness: 0.8,
                roughness: 0.2,
                emissive: index === 0 ? colors.accent : 0x000000,
                emissiveIntensity: index === 0 ? 0.1 : 0
            });
            const button = new THREE.Mesh(buttonGeometry, material);
            button.position.set(...pos);
            controlsGroup.add(button);
        });

        controlsGroup.add(panel);
        controlsGroup.add(jBase);
        controlsGroup.add(jStick);

        // === DÉTAILS SUBTILS ===
        
        // Lignes de néon très subtiles
        const neonGeometry = new THREE.BoxGeometry(0.02, 3, 0.02);
        const neonMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.accent,
            emissive: colors.accent,
            emissiveIntensity: 0.3,
            metalness: 0.9,
            roughness: 0.1
        });

        const leftNeon = new THREE.Mesh(neonGeometry, neonMaterial);
        leftNeon.position.set(-1.05, 0, 0.76);
        
        const rightNeon = new THREE.Mesh(neonGeometry, neonMaterial);
        rightNeon.position.set(1.05, 0, 0.76);

        // Base
        const baseGeometry = new THREE.BoxGeometry(2.2, 0.3, 1.8);
        const baseMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.base,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -2.5, 0);
        base.castShadow = true;

        // Assemblage
        this.arcadeMachine.add(cabinet);
        this.arcadeMachine.add(screenGroup);
        this.arcadeMachine.add(controlsGroup);
        this.arcadeMachine.add(leftNeon);
        this.arcadeMachine.add(rightNeon);
        this.arcadeMachine.add(base);

        // Position initiale avec légère rotation
        this.arcadeMachine.rotation.y = -0.2;
        
        this.scene.add(this.arcadeMachine);
    }

    setupLighting() {
        // Éclairage minimaliste
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Lumière principale douce
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        this.scene.add(mainLight);

        // Accent light subtil
        const accentLight = new THREE.PointLight(0x8b5cf6, 0.2, 10);
        accentLight.position.set(0, 0, 3);
        this.scene.add(accentLight);

        // Rim light pour les contours
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(-5, 5, -5);
        this.scene.add(rimLight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Pas de rotation automatique - contrôlée par le scroll
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Méthodes publiques pour le contrôle externe
    setRotation(angle) {
        if (this.arcadeMachine) {
            gsap.to(this.arcadeMachine.rotation, {
                y: angle * (Math.PI / 180),
                duration: 1,
                ease: "power2.inOut"
            });
        }
    }

    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resumeAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    destroy() {
        this.pauseAnimation();
        this.renderer.dispose();
        this.scene.clear();
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Export
window.ArcadeMachine3D = ArcadeMachine3D;