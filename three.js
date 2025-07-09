/**
 * ARCADE CONNECT - THREE.JS 3D MACHINE
 * Borne d'arcade 3D interactive avec écran vidéo cliquable
 */

// Vérification de Three.js au chargement du script
if (typeof THREE === 'undefined') {
    console.error('❌ Three.js n\'est pas chargé !');
} else {
    console.log('✅ Three.js chargé avec succès, version:', THREE.REVISION);
}

class ArcadeMachine3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arcadeMachine = null;
        this.screen = null;
        this.video = null;
        this.videoTexture = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // États
        this.isVideoLoaded = false;
        this.isHovering = false;
        this.rotationSpeed = 0;
        this.isMobile = this.detectMobile();
        this.isLowPowerDevice = this.detectLowPowerDevice();
        
        this.init();
        this.createArcadeMachine();
        this.setupVideo();
        this.setupLighting();
        this.setupControls();
        this.animate();
        
        console.log(`🎮 Borne d'arcade 3D initialisée (Mobile: ${this.isMobile})`);
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth <= 768 
               || ('ontouchstart' in window);
    }

    detectLowPowerDevice() {
        // Détection approximative des devices moins puissants
        return this.isMobile && (
            navigator.hardwareConcurrency <= 4 ||
            /iPhone [56789]|iPad.*OS [6789]|Android [456]/i.test(navigator.userAgent)
        );
    }

    init() {
        // Scène
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent

        // Caméra adaptée mobile
        const fov = this.isMobile ? 60 : 50; // FOV plus large sur mobile
        this.camera = new THREE.PerspectiveCamera(
            fov, 
            this.container.offsetWidth / this.container.offsetHeight, 
            0.1, 
            1000
        );
        
        // Position caméra adaptée mobile
        if (this.isMobile) {
            this.camera.position.set(0, 0, 4); // Plus proche sur mobile
        } else {
            this.camera.position.set(0, 0, 5);
        }

        // Renderer optimisé pour mobile
        const rendererSettings = {
            alpha: true,
            antialias: !this.isLowPowerDevice, // Pas d'antialiasing sur devices faibles
            powerPreference: this.isMobile ? "default" : "high-performance"
        };

        this.renderer = new THREE.WebGLRenderer(rendererSettings);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        
        // Pixel ratio adaptatif
        const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 2) : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        
        // Shadows conditionnelles (performance)
        if (!this.isLowPowerDevice) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Tone mapping simplifié sur mobile
        this.renderer.toneMapping = this.isMobile ? THREE.LinearToneMapping : THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Nettoyage du container et ajout du canvas
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        
        console.log(`📱 Renderer configuré (Mobile: ${this.isMobile}, Low Power: ${this.isLowPowerDevice})`);
    }

    createArcadeMachine() {
        this.arcadeMachine = new THREE.Group();

        // Échelle adaptée mobile
        const scale = this.isMobile ? 0.8 : 1;
        this.arcadeMachine.scale.setScalar(scale);

        // === BASE AVEC COURBES RÉALISTES ===
        this.createRealisticBase();
        
        // === CABINET PRINCIPAL AVEC DÉTAILS ===
        this.createMainCabinet();
        
        // === ÉCRAN AVEC CADRE DÉTAILLÉ ===
        this.createDetailedScreen();
        
        // === PANNEAU DE CONTRÔLES RÉALISTE ===
        this.createControlPanel();
        
        // === MARQUEE (PARTIE SUPÉRIEURE) ===
        this.createMarquee();
        
        // === DÉTAILS RÉALISTES ===
        this.addRealisticDetails();

        this.scene.add(this.arcadeMachine);
        
        console.log(`🎮 Borne réaliste créée (Mobile: ${this.isMobile})`);
    }

    createRealisticBase() {
        // Base principale avec chanfreins
        const baseShape = new THREE.Shape();
        const width = 2.2, depth = 1.8, radius = 0.1;
        
        // Forme arrondie pour la base
        baseShape.moveTo(-width/2 + radius, -depth/2);
        baseShape.lineTo(width/2 - radius, -depth/2);
        baseShape.quadraticCurveTo(width/2, -depth/2, width/2, -depth/2 + radius);
        baseShape.lineTo(width/2, depth/2 - radius);
        baseShape.quadraticCurveTo(width/2, depth/2, width/2 - radius, depth/2);
        baseShape.lineTo(-width/2 + radius, depth/2);
        baseShape.quadraticCurveTo(-width/2, depth/2, -width/2, depth/2 - radius);
        baseShape.lineTo(-width/2, -depth/2 + radius);
        baseShape.quadraticCurveTo(-width/2, -depth/2, -width/2 + radius, -depth/2);

        const extrudeSettings = {
            depth: 0.3,
            bevelEnabled: true,
            bevelSegments: 8,
            bevelSize: 0.02,
            bevelThickness: 0.02
        };

        const baseGeometry = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
        const baseMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a2e,
            metalness: 0.8,
            roughness: 0.3,
            envMapIntensity: 1,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2
        });

        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -2.5, 0);
        base.rotation.x = -Math.PI / 2;
        if (!this.isLowPowerDevice) base.castShadow = true;
        
        // Ajout de pieds en caoutchouc
        this.addRubberFeet(base);
        
        this.arcadeMachine.add(base);
    }

    addRubberFeet(base) {
        const footGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.04, 12);
        const footMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a2a,
            roughness: 0.9,
            metalness: 0.1
        });

        const positions = [
            [-0.9, -2.68, -0.7],
            [0.9, -2.68, -0.7],
            [-0.9, -2.68, 0.7],
            [0.9, -2.68, 0.7]
        ];

        positions.forEach(pos => {
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(...pos);
            base.add(foot);
        });
    }

    createMainCabinet() {
        // Cabinet principal avec forme organique
        const cabinetGroup = new THREE.Group();
        
        // Corps principal avec courbes
        const segments = this.isMobile ? 16 : 32;
        const cabinetGeometry = new THREE.BoxGeometry(2, 4, 1.5, segments, segments, segments);
        
        // Modification des vertices pour créer des courbes organiques
        const vertices = cabinetGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            // Courbure subtile vers l'arrière en haut
            if (y > 1) {
                vertices[i + 2] = z - (y - 1) * 0.15;
            }
            
            // Légère courbure des côtés
            if (Math.abs(x) > 0.8) {
                vertices[i] = x * (1 + Math.abs(y) * 0.02);
            }
        }
        cabinetGeometry.attributes.position.needsUpdate = true;
        cabinetGeometry.computeVertexNormals();

        const cabinetMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x16213e,
            metalness: 0.2,
            roughness: 0.4,
            envMapIntensity: 0.8,
            clearcoat: 0.1,
            clearcoatRoughness: 0.3
        });

        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
        cabinet.position.y = -0.5;
        if (!this.isLowPowerDevice) cabinet.castShadow = true;
        
        // Ajout de jointures et détails
        this.addCabinetDetails(cabinetGroup);
        
        cabinetGroup.add(cabinet);
        this.arcadeMachine.add(cabinetGroup);
    }

    addCabinetDetails(cabinetGroup) {
        // Grilles de ventilation latérales
        this.addVentilationGrilles(cabinetGroup);
        
        // Jointures entre panneaux
        this.addPanelJoints(cabinetGroup);
        
        // Vis et fixations
        this.addScrewsAndFixtures(cabinetGroup);
    }

    addVentilationGrilles(parent) {
        const grilleGeometry = new THREE.PlaneGeometry(0.3, 1.5, 1, 20);
        const grilleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a0a,
            metalness: 0.8,
            roughness: 0.4,
            transparent: true,
            opacity: 0.7
        });

        // Création d'un pattern de grille
        const vertices = grilleGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const y = vertices[i + 1];
            const row = Math.floor((y + 0.75) * 13.33);
            if (row % 2 === 0) {
                vertices[i + 2] = -0.02; // Creux pour la grille
            }
        }
        grilleGeometry.attributes.position.needsUpdate = true;
        grilleGeometry.computeVertexNormals();

        // Grille gauche
        const leftGrille = new THREE.Mesh(grilleGeometry, grilleMaterial);
        leftGrille.position.set(-1.01, 0.5, 0);
        leftGrille.rotation.y = Math.PI / 2;
        parent.add(leftGrille);

        // Grille droite
        const rightGrille = leftGrille.clone();
        rightGrille.position.x = 1.01;
        parent.add(rightGrille);
    }

    addPanelJoints(parent) {
        // Jointures verticales
        const jointGeometry = new THREE.BoxGeometry(0.02, 4, 0.02);
        const jointMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x3a3a3a,
            metalness: 0.9,
            roughness: 0.1
        });

        const positions = [
            [-0.99, -0.5, 0.76],
            [0.99, -0.5, 0.76],
            [-0.99, -0.5, -0.76],
            [0.99, -0.5, -0.76]
        ];

        positions.forEach(pos => {
            const joint = new THREE.Mesh(jointGeometry, jointMaterial);
            joint.position.set(...pos);
            parent.add(joint);
        });
    }

    addScrewsAndFixtures(parent) {
        const screwGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8);
        const screwMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x666666,
            metalness: 1,
            roughness: 0.2
        });

        // Pattern de vis sur les côtés
        const screwPositions = [
            // Côté gauche
            [-1.02, 1.5, 0], [-1.02, 0.5, 0], [-1.02, -0.5, 0], [-1.02, -1.5, 0],
            // Côté droit
            [1.02, 1.5, 0], [1.02, 0.5, 0], [1.02, -0.5, 0], [1.02, -1.5, 0]
        ];

        screwPositions.forEach(pos => {
            const screw = new THREE.Mesh(screwGeometry, screwMaterial);
            screw.position.set(...pos);
            screw.rotation.z = Math.PI / 2;
            parent.add(screw);
        });
    }

    createDetailedScreen() {
        const screenGroup = new THREE.Group();

        // Écran avec bordures arrondies
        const screenGeometry = new THREE.PlaneGeometry(1.4, 1.0, 1, 1);
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        
        this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
        this.screen.position.set(0, 0.3, 0.76);
        this.screen.name = 'screen';

        // Cadre d'écran plus réaliste avec chanfreins
        const frameShape = new THREE.Shape();
        const fw = 1.6, fh = 1.2, fr = 0.08;
        
        // Forme arrondie pour le cadre
        frameShape.moveTo(-fw/2 + fr, -fh/2);
        frameShape.lineTo(fw/2 - fr, -fh/2);
        frameShape.quadraticCurveTo(fw/2, -fh/2, fw/2, -fh/2 + fr);
        frameShape.lineTo(fw/2, fh/2 - fr);
        frameShape.quadraticCurveTo(fw/2, fh/2, fw/2 - fr, fh/2);
        frameShape.lineTo(-fw/2 + fr, fh/2);
        frameShape.quadraticCurveTo(-fw/2, fh/2, -fw/2, fh/2 - fr);
        frameShape.lineTo(-fw/2, -fh/2 + fr);
        frameShape.quadraticCurveTo(-fw/2, -fh/2, -fw/2 + fr, -fh/2);

        // Trou pour l'écran
        const holeShape = new THREE.Shape();
        const hw = 1.42, hh = 1.02, hr = 0.02;
        holeShape.moveTo(-hw/2 + hr, -hh/2);
        holeShape.lineTo(hw/2 - hr, -hh/2);
        holeShape.quadraticCurveTo(hw/2, -hh/2, hw/2, -hh/2 + hr);
        holeShape.lineTo(hw/2, hh/2 - hr);
        holeShape.quadraticCurveTo(hw/2, hh/2, hw/2 - hr, hh/2);
        holeShape.lineTo(-hw/2 + hr, hh/2);
        holeShape.quadraticCurveTo(-hw/2, hh/2, -hw/2, hh/2 - hr);
        holeShape.lineTo(-hw/2, -hh/2 + hr);
        holeShape.quadraticCurveTo(-hw/2, -hh/2, -hw/2 + hr, -hh/2);
        
        frameShape.holes.push(holeShape);

        const frameExtrudeSettings = {
            depth: 0.08,
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.01,
            bevelThickness: 0.01
        };

        const frameGeometry = new THREE.ExtrudeGeometry(frameShape, frameExtrudeSettings);
        const frameMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x8b5cf6,
            emissiveIntensity: this.isMobile ? 0.05 : 0.1,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1
        });

        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 0.3, 0.72);

        // Reflet sur l'écran
        const reflectionGeometry = new THREE.PlaneGeometry(1.35, 0.95);
        const reflectionMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05,
            metalness: 1,
            roughness: 0
        });
        const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
        reflection.position.set(0.1, 0.35, 0.77);

        screenGroup.add(this.screen);
        screenGroup.add(frame);
        screenGroup.add(reflection);
        this.arcadeMachine.add(screenGroup);
    }

    createControlPanel() {
        const controlGroup = new THREE.Group();
        
        // Panneau de contrôle avec forme ergonomique
        const panelGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.8, 16, 8, 16);
        
        // Modification pour forme ergonomique
        const vertices = panelGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Courbure ergonomique
            if (z > 0) {
                vertices[i + 1] += Math.sin(Math.abs(x) / 0.9) * 0.05;
            }
        }
        panelGeometry.attributes.position.needsUpdate = true;
        panelGeometry.computeVertexNormals();

        const panelMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a3e,
            metalness: 0.3,
            roughness: 0.6,
            clearcoat: 0.2
        });

        const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        controlPanel.position.set(0, -1.2, 0.4);
        controlPanel.rotation.x = -0.3;

        // Ajout des contrôles détaillés
        if (!this.isLowPowerDevice) {
            this.addDetailedControls(controlGroup);
        }

        controlGroup.add(controlPanel);
        this.arcadeMachine.add(controlGroup);
    }

    addDetailedControls(parent) {
        // Joystick principal avec base réaliste
        const joystickBase = new THREE.CylinderGeometry(0.15, 0.18, 0.08, 16);
        const joystickBaseMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.3
        });
        const joyBase = new THREE.Mesh(joystickBase, joystickBaseMaterial);
        joyBase.position.set(-0.5, -1.16, 0.8);

        const joystickGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 12);
        const joystickMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff4757,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x331111,
            emissiveIntensity: 0.1
        });
        const joystick = new THREE.Mesh(joystickGeometry, joystickMaterial);
        joystick.position.set(-0.5, -1.0, 0.8);

        // Boutons d'action plus réalistes
        const buttonColors = [0x06b6d4, 0xfbbf24, 0x10b981, 0x8b5cf6];
        const buttonPositions = [
            [0.2, -1.1, 0.75],
            [0.4, -0.9, 0.75],
            [0.6, -1.1, 0.75],
            [0.8, -0.9, 0.75]
        ];

        buttonPositions.forEach((pos, index) => {
            // Base du bouton
            const buttonBaseGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
            const buttonBaseMat = new THREE.MeshPhysicalMaterial({
                color: 0x2a2a2a,
                metalness: 0.8,
                roughness: 0.2
            });
            const buttonBase = new THREE.Mesh(buttonBaseGeom, buttonBaseMat);
            buttonBase.position.set(pos[0], pos[1] - 0.01, pos[2]);

            // Bouton principal
            const buttonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16);
            const buttonMaterial = new THREE.MeshPhysicalMaterial({
                color: buttonColors[index],
                metalness: 0.7,
                roughness: 0.2,
                emissive: buttonColors[index],
                emissiveIntensity: 0.2,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1
            });
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(...pos);

            parent.add(buttonBase);
            parent.add(button);
        });

        parent.add(joyBase);
        parent.add(joystick);
    }

    createMarquee() {
        const marqueeGroup = new THREE.Group();
        
        // Partie supérieure (marquee) avec courbes
        const marqueeGeometry = new THREE.BoxGeometry(2.2, 0.6, 0.8, 16, 8, 16);
        
        // Modification pour forme arrondie
        const vertices = marqueeGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            
            // Arrondi sur le dessus
            if (y > 0.2) {
                const factor = (y - 0.2) / 0.1;
                vertices[i] = x * (1 - factor * 0.1);
                vertices[i + 2] *= (1 - factor * 0.05);
            }
        }
        marqueeGeometry.attributes.position.needsUpdate = true;
        marqueeGeometry.computeVertexNormals();

        const marqueeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x8b5cf6,
            emissiveIntensity: this.isMobile ? 0.1 : 0.2,
            clearcoat: 0.5
        });

        const marquee = new THREE.Mesh(marqueeGeometry, marqueeMaterial);
        marquee.position.set(0, 1.8, 0);

        // Logo ARCADE en relief
        this.addArcadeLogo(marqueeGroup);

        marqueeGroup.add(marquee);
        this.arcadeMachine.add(marqueeGroup);
    }

    addArcadeLogo(parent) {
        // Texte ARCADE en géométrie 3D
        const logoGroup = new THREE.Group();
        
        // Simulation de lettres avec des formes simples
        const letterMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x4444ff,
            emissiveIntensity: 0.3
        });

        // Lettres simplifiées (rectangles stylisés)
        const letterPositions = [-0.4, -0.2, 0, 0.2, 0.4];
        letterPositions.forEach((x, index) => {
            const letterGeom = new THREE.BoxGeometry(0.12, 0.15, 0.02);
            const letter = new THREE.Mesh(letterGeom, letterMaterial);
            letter.position.set(x, 1.85, 0.42);
            logoGroup.add(letter);
        });

        parent.add(logoGroup);
    }

    addRealisticDetails() {
        // Haut-parleurs plus réalistes
        this.addRealisticSpeakers();
        
        // Câbles et connecteurs
        this.addCablesAndConnectors();
        
        // Éléments lumineux
        this.addLightElements();
    }

    addRealisticSpeakers() {
        const speakerGroup = new THREE.Group();

        // Base du haut-parleur
        const speakerHousing = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
        const speakerHousingMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.1,
            roughness: 0.8
        });

        // Grille du haut-parleur
        const speakerGrille = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32);
        const speakerGrilleMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a0a,
            metalness: 0.8,
            roughness: 0.4,
            transparent: true,
            opacity: 0.8
        });

        const positions = [
            [-0.6, 1.2, 0.76],
            [0.6, 1.2, 0.76]
        ];

        positions.forEach(pos => {
            const housing = new THREE.Mesh(speakerHousing, speakerHousingMat);
            housing.position.set(...pos);
            housing.rotation.z = Math.PI / 2;

            const grille = new THREE.Mesh(speakerGrille, speakerGrilleMat);
            grille.position.set(pos[0], pos[1], pos[2] + 0.02);
            grille.rotation.z = Math.PI / 2;

            speakerGroup.add(housing);
            speakerGroup.add(grille);
        });

        this.arcadeMachine.add(speakerGroup);
    }

    addCablesAndConnectors() {
        // Câble d'alimentation
        const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const cableMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.1
        });

        const powerCable = new THREE.Mesh(cableGeometry, cableMaterial);
        powerCable.position.set(0.8, -2.3, -0.7);
        powerCable.rotation.x = Math.PI / 4;

        // Connecteur
        const connectorGeom = new THREE.BoxGeometry(0.08, 0.05, 0.12);
        const connectorMat = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.2
        });
        const connector = new THREE.Mesh(connectorGeom, connectorMat);
        connector.position.set(0.9, -2.4, -0.6);

        this.arcadeMachine.add(powerCable);
        this.arcadeMachine.add(connector);
    }

    addLightElements() {
        // Néons latéraux plus réalistes
        const neonGeometry = new THREE.CylinderGeometry(0.025, 0.025, 2.8, 12);
        const neonMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x06b6d4,
            emissive: 0x06b6d4,
            emissiveIntensity: this.isMobile ? 0.4 : 0.6,
            transparent: true,
            opacity: 0.9,
            transmission: 0.5,
            thickness: 0.05
        });

        const leftNeon = new THREE.Mesh(neonGeometry, neonMaterial);
        leftNeon.position.set(-1.12, 0, 0.76);

        const rightNeon = new THREE.Mesh(neonGeometry, neonMaterial);
        rightNeon.position.set(1.12, 0, 0.76);

        // Support des néons
        const supportGeom = new THREE.BoxGeometry(0.04, 0.04, 0.1);
        const supportMat = new THREE.MeshPhysicalMaterial({
            color: 0x666666,
            metalness: 0.9,
            roughness: 0.1
        });

        [-1, 0, 1].forEach(y => {
            const leftSupport = new THREE.Mesh(supportGeom, supportMat);
            leftSupport.position.set(-1.12, y, 0.71);
            const rightSupport = new THREE.Mesh(supportGeom, supportMat);
            rightSupport.position.set(1.12, y, 0.71);
            
            this.arcadeMachine.add(leftSupport);
            this.arcadeMachine.add(rightSupport);
        });

        this.arcadeMachine.add(leftNeon);
        this.arcadeMachine.add(rightNeon);
    }

    addControlButtons() {
        // Joystick principal
        const joystickGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.3);
        const joystickMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff4757,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xff4757,
            emissiveIntensity: 0.1
        });
        const joystick = new THREE.Mesh(joystickGeometry, joystickMaterial);
        joystick.position.set(-0.5, -1.0, 0.7);
        this.arcadeMachine.add(joystick);

        // Boutons d'action
        const buttonColors = [0x06b6d4, 0xfbbf24, 0x10b981, 0x8b5cf6];
        const buttonPositions = [
            [0.2, -1.0, 0.7],
            [0.4, -0.8, 0.7],
            [0.6, -1.0, 0.7],
            [0.8, -0.8, 0.7]
        ];

        buttonPositions.forEach((pos, index) => {
            const buttonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.08);
            const buttonMaterial = new THREE.MeshPhysicalMaterial({
                color: buttonColors[index],
                metalness: 0.8,
                roughness: 0.2,
                emissive: buttonColors[index],
                emissiveIntensity: 0.3
            });
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(...pos);
            this.arcadeMachine.add(button);
        });
    }

    addDecorativeElements() {
        // Néons latéraux
        const neonGeometry = new THREE.BoxGeometry(0.05, 3, 0.05);
        const neonMaterial = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            emissive: 0x06b6d4,
            emissiveIntensity: 0.8
        });

        const leftNeon = new THREE.Mesh(neonGeometry, neonMaterial);
        leftNeon.position.set(-1.1, 0, 0.76);
        this.arcadeMachine.add(leftNeon);

        const rightNeon = new THREE.Mesh(neonGeometry, neonMaterial);
        rightNeon.position.set(1.1, 0, 0.76);
        this.arcadeMachine.add(rightNeon);

        // Logo "ARCADE" sur le dessus
        const logoGeometry = new THREE.BoxGeometry(1.2, 0.2, 0.4);
        const logoMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.3
        });
        const logo = new THREE.Mesh(logoGeometry, logoMaterial);
        logo.position.set(0, 1.8, 0);
        this.arcadeMachine.add(logo);

        // Haut-parleurs
        const speakerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1);
        const speakerMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.1,
            roughness: 0.9
        });

        const leftSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
        leftSpeaker.position.set(-0.6, 1.2, 0.76);
        leftSpeaker.rotation.z = Math.PI / 2;
        this.arcadeMachine.add(leftSpeaker);

        const rightSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
        rightSpeaker.position.set(0.6, 1.2, 0.76);
        rightSpeaker.rotation.z = Math.PI / 2;
        this.arcadeMachine.add(rightSpeaker);
    }

    setupVideo() {
        // Création de l'élément vidéo
        this.video = document.createElement('video');
        this.video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'; // Vidéo de demo
        this.video.crossOrigin = 'anonymous';
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.style.display = 'none';
        document.body.appendChild(this.video);

        // Texture vidéo
        this.videoTexture = new THREE.VideoTexture(this.video);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;

        // Application au matériau de l'écran
        this.screen.material = new THREE.MeshBasicMaterial({
            map: this.videoTexture,
            side: THREE.DoubleSide
        });

        // Démarrage de la vidéo
        this.video.addEventListener('loadeddata', () => {
            this.isVideoLoaded = true;
            this.video.play();
            console.log('🎬 Vidéo chargée et lecture démarrée');
        });

        this.video.load();
    }

    setupLighting() {
        // Lumière ambiante douce
        const ambientIntensity = this.isMobile ? 0.6 : 0.4;
        const ambientLight = new THREE.AmbientLight(0x404080, ambientIntensity);
        this.scene.add(ambientLight);

        // Lumière directionnelle principale (soleil artificiel)
        const directionalLight = new THREE.DirectionalLight(0xffffff, this.isMobile ? 0.8 : 1.0);
        directionalLight.position.set(4, 8, 6);
        
        if (!this.isLowPowerDevice) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = this.isMobile ? 1024 : 2048;
            directionalLight.shadow.mapSize.height = this.isMobile ? 1024 : 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 20;
            directionalLight.shadow.camera.left = -8;
            directionalLight.shadow.camera.right = 8;
            directionalLight.shadow.camera.top = 8;
            directionalLight.shadow.camera.bottom = -8;
            directionalLight.shadow.bias = -0.0001;
        }
        this.scene.add(directionalLight);

        // Éclairage d'ambiance rétro (si performance le permet)
        if (!this.isLowPowerDevice) {
            // Lumière violette depuis la gauche
            const purpleLight = new THREE.PointLight(0x8b5cf6, 0.6, 12);
            purpleLight.position.set(-4, 3, 4);
            this.scene.add(purpleLight);

            // Lumière cyan depuis la droite
            const cyanLight = new THREE.PointLight(0x06b6d4, 0.6, 12);
            cyanLight.position.set(4, 3, 4);
            this.scene.add(cyanLight);

            // Lumière d'accent jaune depuis le haut
            const accentLight = new THREE.PointLight(0xfbbf24, 0.3, 8);
            accentLight.position.set(0, 6, 2);
            this.scene.add(accentLight);
        }

        // Éclairage de l'écran (toujours présent)
        const screenLight = new THREE.PointLight(0x06b6d4, 0.4, 6);
        screenLight.position.set(0, 0.3, 1);
        this.scene.add(screenLight);

        // Lumière des néons (si non mobile)
        if (!this.isMobile) {
            this.addNeonLighting();
        }

        // Lumière du sol pour les reflets
        const floorLight = new THREE.PointLight(0x4040ff, 0.2, 10);
        floorLight.position.set(0, -3, 0);
        this.scene.add(floorLight);
        
        console.log(`💡 Éclairage réaliste configuré (${this.isLowPowerDevice ? 'Performance' : 'Qualité'})`);
    }

    addNeonLighting() {
        // Lumières pour les néons latéraux
        const leftNeonLight = new THREE.PointLight(0x06b6d4, 0.5, 4);
        leftNeonLight.position.set(-1.2, 0, 1);
        this.scene.add(leftNeonLight);

        const rightNeonLight = new THREE.PointLight(0x06b6d4, 0.5, 4);
        rightNeonLight.position.set(1.2, 0, 1);
        this.scene.add(rightNeonLight);

        // Lumière du marquee
        const marqueeLight = new THREE.PointLight(0x8b5cf6, 0.8, 6);
        marqueeLight.position.set(0, 2, 1);
        this.scene.add(marqueeLight);

        // Stockage pour animation
        this.neonLights = [leftNeonLight, rightNeonLight, marqueeLight];
    }

    setupControls() {
        // Gestion tactile et souris
        if (this.isMobile) {
            // Événements tactiles
            this.renderer.domElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTouchStart(e);
            }, { passive: false });
            
            this.renderer.domElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleTouchEnd(e);
            }, { passive: false });
            
            // Désactiver le menu contextuel
            this.renderer.domElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        } else {
            // Gestion desktop (clic et hover)
            this.renderer.domElement.addEventListener('click', (event) => {
                this.handleScreenClick(event);
            });

            this.renderer.domElement.addEventListener('mousemove', (event) => {
                this.handleMouseMove(event);
            });
        }

        // Redimensionnement
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Optimisation: pause sur fond
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isMobile) {
                this.pauseVideo();
            } else if (!document.hidden && this.isMobile) {
                // Attendre un peu avant de reprendre sur mobile
                setTimeout(() => this.playVideo(), 500);
            }
        });
        
        console.log(`🎮 Contrôles configurés (Mobile: ${this.isMobile})`);
    }

    handleTouchStart(event) {
        // Prévenir le scroll pendant l'interaction
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.getTouchPosition(touch);
            
            // Vérifier si on touche l'écran
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.screen);
            
            if (intersects.length > 0) {
                this.onScreenTouch();
            }
        }
    }

    handleTouchEnd(event) {
        // Gérer le tap sur l'écran
        if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            this.getTouchPosition(touch);
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.screen);
            
            if (intersects.length > 0) {
                this.openVideoModal();
            }
        }
        
        // Retour à l'état normal
        this.onScreenLeave();
    }

    getTouchPosition(touch) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onScreenTouch() {
        // Effet tactile pour mobile
        this.screen.material.emissive = new THREE.Color(0x0066cc);
        this.screen.material.emissiveIntensity = 0.3;
        
        // Vibration tactile si supportée
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Animation scale
        if (window.gsap) {
            gsap.to(this.screen.scale, {
                x: 1.1,
                y: 1.1,
                z: 1.1,
                duration: 0.2,
                ease: "power2.out"
            });
        }
        
        console.log('📱 Touch sur l\'écran détecté');
    }

    handleMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast pour détecter le hover sur l'écran
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.screen);

        if (intersects.length > 0) {
            if (!this.isHovering) {
                this.isHovering = true;
                this.onScreenHover();
            }
        } else {
            if (this.isHovering) {
                this.isHovering = false;
                this.onScreenLeave();
            }
        }
    }

    handleScreenClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.screen);

        if (intersects.length > 0) {
            this.openVideoModal();
        }
    }

    onScreenHover() {
        // Effet de glow sur l'écran
        this.screen.material.emissive = new THREE.Color(0x0066cc);
        this.screen.material.emissiveIntensity = 0.2;
        
        // Curseur si disponible
        if (window.arcadeCursor) {
            window.arcadeCursor.setCursorStyle('gaming');
        }

        // Animation GSAP pour le glow
        if (window.gsap) {
            gsap.to(this.screen.scale, {
                x: 1.05,
                y: 1.05,
                z: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        }

        console.log('🎯 Hover sur l\'écran détecté');
    }

    onScreenLeave() {
        // Retour à la normale
        this.screen.material.emissive = new THREE.Color(0x000000);
        this.screen.material.emissiveIntensity = 0;
        
        if (window.arcadeCursor) {
            window.arcadeCursor.setCursorStyle('default');
        }

        if (window.gsap) {
            gsap.to(this.screen.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    openVideoModal() {
        console.log('🎬 Ouverture de la modal vidéo (Mobile optimisée)');
        
        // Création de la modal YouTube mobile-friendly
        const modal = document.createElement('div');
        modal.className = `video-modal ${this.isMobile ? 'mobile' : ''}`;
        modal.innerHTML = `
            <div class="video-modal-overlay">
                <div class="video-modal-content">
                    <button class="video-modal-close" aria-label="Fermer">✕</button>
                    ${this.isMobile ? '<div class="mobile-swipe-indicator">Glissez vers le bas pour fermer</div>' : ''}
                    <div class="video-wrapper">
                        <iframe 
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1${this.isMobile ? '&controls=1' : ''}" 
                            frameborder="0" 
                            allowfullscreen
                            allow="autoplay; encrypted-media"
                            ${this.isMobile ? 'allow="autoplay; encrypted-media; fullscreen"' : ''}>
                        </iframe>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Prévenir le scroll du body sur mobile
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
        
        // Animation d'apparition
        if (window.gsap) {
            gsap.fromTo(modal, 
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
            
            const content = modal.querySelector('.video-modal-content');
            if (this.isMobile) {
                // Animation depuis le bas sur mobile
                gsap.fromTo(content,
                    { y: '100%' },
                    { y: '0%', duration: 0.4, ease: "power2.out" }
                );
            } else {
                // Animation standard desktop
                gsap.fromTo(content,
                    { scale: 0.8, y: -50 },
                    { scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
                );
            }
        }
        
        // Gestion de fermeture
        this.setupModalCloseEvents(modal);
    }

    setupModalCloseEvents(modal) {
        const closeBtn = modal.querySelector('.video-modal-close');
        const overlay = modal.querySelector('.video-modal-overlay');
        const content = modal.querySelector('.video-modal-content');
        
        const closeModal = () => {
            // Restaurer le scroll du body
            if (this.isMobile) {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
            
            if (window.gsap) {
                if (this.isMobile) {
                    gsap.to(content, {
                        y: '100%',
                        duration: 0.3,
                        ease: "power2.in"
                    });
                }
                gsap.to(modal, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => modal.remove()
                });
            } else {
                modal.remove();
            }
        };
        
        // Événements de fermeture
        closeBtn.addEventListener('click', closeModal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        // Swipe down pour fermer sur mobile
        if (this.isMobile) {
            let startY = 0;
            let currentY = 0;
            let isDragging = false;
            
            content.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isDragging = true;
            }, { passive: true });
            
            content.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                
                if (deltaY > 0) {
                    // Glissement vers le bas
                    content.style.transform = `translateY(${deltaY}px)`;
                    overlay.style.opacity = Math.max(0.5, 1 - deltaY / 300);
                }
            }, { passive: true });
            
            content.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                
                const deltaY = currentY - startY;
                if (deltaY > 150) { // Seuil de fermeture
                    closeModal();
                } else {
                    // Retour à la position originale
                    gsap.to(content, {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                    gsap.to(overlay, {
                        opacity: 1,
                        duration: 0.3
                    });
                }
                
                content.style.transform = '';
                overlay.style.opacity = '';
            }, { passive: true });
        }
        
        // Fermeture avec Escape (desktop)
        if (!this.isMobile) {
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
        }
    }

    handleResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Méthode appelée par GSAP pour la rotation
    setRotation(rotation) {
        if (this.arcadeMachine) {
            this.arcadeMachine.rotation.y = rotation * (Math.PI / 180);
        }
    }

    // Méthode pour les effets de scroll
    setScrollProgress(progress) {
        // Effet de perspective selon le scroll
        if (this.camera) {
            this.camera.position.z = 5 + progress * 2;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Rotation légère automatique si pas de scroll
        if (this.rotationSpeed > 0) {
            this.arcadeMachine.rotation.y += this.rotationSpeed;
        }
        
        // Animations des éléments lumineux
        this.animateNeonEffects(time);
        
        // Animation subtile de la borne (respiration)
        this.animateBreathing(time);
        
        // Animation des reflets
        this.animateReflections(time);
        
        this.renderer.render(this.scene, this.camera);
    }

    animateNeonEffects(time) {
        // Pulsation des néons
        this.arcadeMachine.children.forEach(child => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                const baseIntensity = child.material.userData.baseEmissive || child.material.emissiveIntensity;
                child.material.userData.baseEmissive = baseIntensity;
                
                // Pulsation douce et organique
                const pulse = Math.sin(time * 2 + child.position.x) * 0.1;
                child.material.emissiveIntensity = Math.max(0, baseIntensity + pulse);
            }
        });

        // Animation des lumières de néon
        if (this.neonLights) {
            this.neonLights.forEach((light, index) => {
                const phase = time * 1.5 + index * Math.PI / 3;
                light.intensity = light.userData.baseIntensity || light.intensity;
                light.userData.baseIntensity = light.intensity;
                light.intensity += Math.sin(phase) * 0.2;
            });
        }
    }

    animateBreathing(time) {
        // Respiration subtile de toute la borne
        const breathe = Math.sin(time * 0.8) * 0.005 + 1;
        if (this.arcadeMachine) {
            this.arcadeMachine.scale.y = this.arcadeMachine.scale.x * breathe;
        }
    }

    animateReflections(time) {
        // Animation des reflets sur l'écran et surfaces métalliques
        this.arcadeMachine.traverse((child) => {
            if (child.material && child.material.clearcoat !== undefined) {
                const wave = Math.sin(time * 1.2 + child.position.x + child.position.y) * 0.1;
                child.material.clearcoatRoughness = Math.max(0.05, 0.2 + wave);
            }
        });
    }

    // Méthodes publiques pour contrôler la borne
    playVideo() {
        if (this.video && this.isVideoLoaded) {
            this.video.play();
        }
    }

    pauseVideo() {
        if (this.video && this.isVideoLoaded) {
            this.video.pause();
        }
    }

    destroy() {
        if (this.video) {
            this.video.remove();
        }
        this.renderer.dispose();
        this.scene.clear();
    }
}

// Ajout des styles CSS pour la modal mobile-friendly
const modalStyles = `
<style>
.video-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    opacity: 0;
}

.video-modal-overlay {
    width: 100%;
    height: 100%;
    background: rgba(5, 5, 16, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.video-modal-content {
    position: relative;
    width: 100%;
    max-width: 900px;
    background: rgba(15, 15, 35, 0.9);
    border-radius: 20px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.video-modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid #8b5cf6;
    color: white;
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
}

.video-modal-close:hover {
    background: #8b5cf6;
    transform: scale(1.1);
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 */
    border-radius: 12px;
    overflow: hidden;
}

.video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.mobile-swipe-indicator {
    text-align: center;
    color: rgba(139, 92, 246, 0.7);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    font-family: var(--font-body, sans-serif);
}

/* Styles spécifiques mobile */
.video-modal.mobile .video-modal-overlay {
    padding: 0;
    align-items: flex-end;
}

.video-modal.mobile .video-modal-content {
    max-width: 100%;
    height: 85vh;
    border-radius: 20px 20px 0 0;
    margin: 0;
    display: flex;
    flex-direction: column;
}

.video-modal.mobile .video-wrapper {
    flex: 1;
    height: auto;
    padding-bottom: 0;
}

.video-modal.mobile .video-wrapper iframe {
    position: relative;
    height: 100%;
}

.video-modal.mobile .video-modal-close {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    top: 0.75rem;
    right: 0.75rem;
}

/* Optimisations tactiles */
@media (hover: none) and (pointer: coarse) {
    .video-modal-close:hover {
        transform: none;
    }
    
    .video-modal-close:active {
        transform: scale(0.95);
        background: #8b5cf6;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .video-modal-overlay {
        padding: 1rem;
    }
    
    .video-modal-content {
        padding: 1.5rem;
        border-radius: 16px;
    }
    
    .video-modal-close {
        width: 36px;
        height: 36px;
        font-size: 1.2rem;
        top: 0.75rem;
        right: 0.75rem;
    }
}

@media (max-width: 480px) {
    .video-modal-overlay {
        padding: 0.5rem;
    }
    
    .video-modal-content {
        padding: 1rem;
        border-radius: 12px;
    }
}

/* Landscape mobile */
@media (max-height: 500px) and (orientation: landscape) {
    .video-modal.mobile .video-modal-content {
        height: 95vh;
        border-radius: 16px;
    }
    
    .mobile-swipe-indicator {
        display: none;
    }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
    .video-modal * {
        transition: none !important;
        animation: none !important;
    }
}
</style>
`;

// Injection des styles
document.head.insertAdjacentHTML('beforeend', modalStyles);

// Export global pour utilisation dans main.js
window.ArcadeMachine3D = ArcadeMachine3D;

// Export pour utilisation en module si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArcadeMachine3D;
}