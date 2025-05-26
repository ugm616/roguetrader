document.addEventListener('DOMContentLoaded', () => {
    const universeContainer = document.getElementById('universe-container');
    const modalContainer = document.getElementById('modal-container');
    const closeModal = document.getElementById('close-modal');
    
    // Add UI elements for save/load system and game controls
    createSaveLoadUI();
    createGameUI();
    
    // Universe configuration
    const config = {
        minPlanets: 4,
        maxPlanets: 8,
        minMoonsPerPlanet: 0,
        maxMoonsPerPlanet: 4,
        distantStars: 100,
        centralStarSize: 80
    };
    
    // Game state
    const gameState = {
        day: 1,
        credits: 10000,
        currentLocation: null, // Will store planet or moon object
        inventory: [],
        ship: {
            name: "Stellar Wanderer",
            cargoCapacity: 20,
            currentCargo: 0,
            fuelCapacity: 100,
            currentFuel: 100,
            speed: 50, // million km per day
            slots: {
                weapon: null,
                shield: null,
                engine: {name: "Standard Engine", level: 1, speedBonus: 0},
                special: null
            },
            availableSlots: 0, // Additional slots that can be added
        },
        travelMode: false,
        travelPath: [],
        travelDaysRemaining: 0,
        eventLog: []
    };
    
    // Item templates
    const itemTemplates = {
        resources: [
            { id: "water", name: "Water Drums", category: "Basic", size: 0.5, basePrice: 50, legal: true, description: "Essential for life support systems." },
            { id: "oxygen", name: "Oxygen Tanks", category: "Basic", size: 0.4, basePrice: 60, legal: true, description: "Compressed oxygen for breathing and industrial processes." },
            { id: "food", name: "Food Supplies", category: "Basic", size: 0.6, basePrice: 70, legal: true, description: "Preserved food rations." },
            { id: "medicines", name: "Medical Supplies", category: "Medical", size: 0.2, basePrice: 120, legal: true, description: "Basic medical equipment and drugs." },
            { id: "luxury_goods", name: "Luxury Goods", category: "Luxury", size: 0.3, basePrice: 200, legal: true, description: "High-end products for the wealthy." },
            { id: "industrial_materials", name: "Industrial Materials", category: "Industrial", size: 0.8, basePrice: 90, legal: true, description: "Raw materials for manufacturing." },
            { id: "electronics", name: "Electronics", category: "Technology", size: 0.2, basePrice: 150, legal: true, description: "Various electronic components." },
            { id: "weapons", name: "Weapon Parts", category: "Military", size: 0.4, basePrice: 250, legal: false, description: "Components for manufacturing weapons." },
            { id: "narcotics", name: "Synthetic Narcotics", category: "Illegal", size: 0.1, basePrice: 500, legal: false, description: "Highly addictive substances." },
            { id: "rare_minerals", name: "Rare Minerals", category: "Mining", size: 0.7, basePrice: 300, legal: true, description: "Valuable minerals for high-tech manufacturing." },
            { id: "exotic_matter", name: "Exotic Matter", category: "Scientific", size: 0.2, basePrice: 450, legal: true, description: "Strange matter with unique properties." },
            { id: "ai_cores", name: "AI Cores", category: "Technology", size: 0.1, basePrice: 600, legal: true, description: "Advanced artificial intelligence cores." },
            { id: "antimatter", name: "Antimatter Containers", category: "Energy", size: 0.3, basePrice: 800, legal: true, description: "Highly volatile energy source." },
            { id: "bio_implants", name: "Bio-Implants", category: "Medical", size: 0.2, basePrice: 350, legal: true, description: "Cybernetic enhancements." },
            { id: "terraforming_equipment", name: "Terraforming Equipment", category: "Scientific", size: 1.5, basePrice: 700, legal: true, description: "Tools for planetary transformation." }
        ],
        shipUpgrades: [
            { id: "cargo_expansion", name: "Cargo Bay Expansion", slot: "special", size: 0, basePrice: 5000, effect: {cargoCapacity: 5}, description: "Increases cargo capacity by 5 units." },
            { id: "fuel_tank", name: "Extended Fuel Tank", slot: "special", size: 0, basePrice: 3000, effect: {fuelCapacity: 50}, description: "Increases fuel capacity by 50 units." },
            { id: "basic_shield", name: "Basic Shield Generator", slot: "shield", size: 0, basePrice: 8000, effect: {shieldStrength: 1}, description: "Provides basic protection against attacks." },
            { id: "advanced_shield", name: "Advanced Shield Generator", slot: "shield", size: 0, basePrice: 20000, effect: {shieldStrength: 3}, description: "Stronger shields against attacks." },
            { id: "laser_cannon", name: "Laser Cannon", slot: "weapon", size: 0, basePrice: 10000, effect: {weaponStrength: 2}, description: "Basic weapon system." },
            { id: "plasma_cannon", name: "Plasma Cannon", slot: "weapon", size: 0, basePrice: 25000, effect: {weaponStrength: 4}, description: "Advanced weapon system." },
            { id: "emp_torpedo", name: "EMP Torpedo Launcher", slot: "weapon", size: 0, basePrice: 15000, effect: {empStrength: 3}, description: "Disables enemy systems temporarily." },
            { id: "enhanced_engine", name: "Enhanced Engine", slot: "engine", size: 0, basePrice: 12000, effect: {speedBonus: 20}, description: "Increases travel speed by 20 million km per day." },
            { id: "sublight_drive", name: "Sublight Drive", slot: "engine", size: 0, basePrice: 100000, effect: {speedBonus: 50, universeTravel: true}, description: "Allows travel between universes and increases speed significantly." },
            { id: "scanner_array", name: "Advanced Scanner Array", slot: "special", size: 0, basePrice: 7500, effect: {scanRange: 2}, description: "Detects ships and resources at longer range." },
            { id: "cloaking_device", name: "Cloaking Device", slot: "special", size: 0, basePrice: 30000, effect: {evasion: 3}, description: "Makes your ship harder to detect." }
        ]
    };
    
    // Current universe data
    let currentUniverse = {
        seed: generateRandomSeed(),
        name: "Unnamed Universe",
        timestamp: Date.now(),
        centralStar: null,
        planets: [],
        difficulty: 1 // Starting difficulty level
    };
    
    // All explored universes
    let exploredUniverses = {};
    
    // Data for generating random universe content
    const planetColors = [
        'linear-gradient(45deg, #3f51b5, #2196f3)',  // Blue
        'linear-gradient(45deg, #4caf50, #8bc34a)',  // Green
        'linear-gradient(45deg, #f44336, #e91e63)',  // Red
        'linear-gradient(45deg, #ff9800, #ff5722)',  // Orange
        'linear-gradient(45deg, #9c27b0, #673ab7)',  // Purple
        'linear-gradient(45deg, #795548, #5d4037)',  // Brown
        'linear-gradient(45deg, #607d8b, #455a64)',  // Gray-Blue
        'linear-gradient(45deg, #ffeb3b, #ffc107)',  // Yellow
    ];
    
    const moonColors = [
        '#d1d1d1', // Light gray
        '#a0a0a0', // Medium gray
        '#c0c0c0', // Silver
        '#e6e6e6', // Off-white
        '#b5b5b5', // Pale gray
        '#eaeacc', // Pale yellow
        '#efd9c6', // Pale orange
        '#d6eaff'  // Pale blue
    ];
    
    const planetNames = [
        'Nexus', 'Zenith', 'Kronos', 'Elysium', 'Aether', 
        'Lumina', 'Obsidian', 'Terravale', 'Aquatica', 'Pyron',
        'Quasar', 'Nebula', 'Astoria', 'Celestis', 'Vortex',
        'Avalon', 'Hyperion', 'Gaia Prime', 'Nova', 'Eclipse'
    ];
    
    const moonNames = [
        'Luno', 'Silva', 'Aura', 'Nimbus', 'Umbra',
        'Spectra', 'Echo', 'Wisp', 'Phantom', 'Crescent',
        'Dusk', 'Twilight', 'Glimmer', 'Radiance', 'Tidal'
    ];
    
    const starNames = [
        'Solaris', 'Polaris', 'Alpha Centauri', 'Sirius', 'Vega',
        'Arcturus', 'Capella', 'Antares', 'Aldebaran', 'Betelgeuse'
    ];
    
    // News event templates
    const newsEventTemplates = [
        { type: "war", template: "{planet1} and {planet2} have entered into a military conflict. Weapons and medical supplies are in high demand." },
        { type: "shortage", template: "{item} shortage reported on {planet}. Prices have skyrocketed!" },
        { type: "surplus", template: "Surplus of {item} on {planet}. Local markets are flooded with cheap goods." },
        { type: "pirate", template: "Pirate activity has increased in the vicinity of {planet}. Travel with caution." },
        { type: "tech", template: "Technological breakthrough on {planet} has created demand for {item}." },
        { type: "disaster", template: "Natural disaster on {planet} has disrupted {item} production. Emergency supplies needed." },
        { type: "festival", template: "{planet} is celebrating its annual festival. Luxury goods are in high demand." },
        { type: "trade", template: "New trade agreement between {planet1} and {planet2} has stabilized prices for {item}." },
        { type: "discovery", template: "Scientists on {planet} have discovered a new use for {item}, increasing its value." }
    ];
    
    // Ship encounter templates
    const shipEncounterTemplates = [
        { 
            type: "trader", 
            template: "You've encountered a friendly trading vessel. They offer to trade goods with you.",
            options: ["Trade", "Ignore", "Attack"]
        },
        { 
            type: "military", 
            template: "A military patrol ship approaches. They're scanning your cargo for illegal goods.",
            options: ["Submit to Scan", "Flee", "Attack"]
        },
        { 
            type: "pirate", 
            template: "Warning! Pirate ship detected! They're moving to intercept.",
            options: ["Fight", "Flee", "Negotiate"]
        },
        { 
            type: "distress", 
            template: "You're receiving a distress signal from a damaged ship nearby.",
            options: ["Assist", "Ignore", "Investigate"]
        },
        { 
            type: "smuggler", 
            template: "A suspicious ship hails you, offering rare goods at discounted prices.",
            options: ["View Offer", "Ignore", "Report to Authorities"]
        }
    ];

    // Initialize the pseudorandom number generator
    let prng = null;
    
    // Generate a new universe or load an existing one
    loadOrCreateUniverse();
    
    // Set up event handlers for save/load system and game controls
    document.getElementById('save-universe').addEventListener('click', saveGame);
    document.getElementById('new-universe').addEventListener('click', startNewGame);
    document.getElementById('saved-universes-list').addEventListener('change', handleSavedGameSelection);
    
    // Close modal on click
    closeModal.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            modalContainer.classList.add('hidden');
        }
    });

    // Main Function to generate or load a universe
    function loadOrCreateUniverse(savedUniverse = null) {
        // Clear universe container
        universeContainer.innerHTML = '';
        
        // If we're loading a saved universe, use its data
        if (savedUniverse) {
            currentUniverse = savedUniverse.currentUniverse;
            gameState.day = savedUniverse.gameState.day;
            gameState.credits = savedUniverse.gameState.credits;
            gameState.inventory = savedUniverse.gameState.inventory;
            gameState.ship = savedUniverse.gameState.ship;
            gameState.travelMode = savedUniverse.gameState.travelMode;
            gameState.travelPath = savedUniverse.gameState.travelPath;
            gameState.travelDaysRemaining = savedUniverse.gameState.travelDaysRemaining;
            gameState.eventLog = savedUniverse.gameState.eventLog;
            exploredUniverses = savedUniverse.exploredUniverses || {};
        } else {
            // Initialize a new universe with random seed
            currentUniverse = {
                seed: generateRandomSeed(),
                name: "Starting Universe",
                timestamp: Date.now(),
                centralStar: null,
                planets: [],
                difficulty: 1
            };
            
            // Reset game state for a new game
            gameState.day = 1;
            gameState.credits = 10000;
            gameState.inventory = [];
            gameState.ship = {
                name: "Stellar Wanderer",
                cargoCapacity: 20,
                currentCargo: 0,
                fuelCapacity: 100,
                currentFuel: 100,
                speed: 50,
                slots: {
                    weapon: null,
                    shield: null,
                    engine: {name: "Standard Engine", level: 1, speedBonus: 0},
                    special: null
                },
                availableSlots: 0
            };
            gameState.travelMode = false;
            gameState.travelPath = [];
            gameState.travelDaysRemaining = 0;
            gameState.eventLog = [{
                day: 1,
                message: "You begin your journey as an interstellar trader in the " + currentUniverse.name + "."
            }];
            
            // Add the current universe to explored universes
            exploredUniverses = {};
        }
        
        // Make sure the current universe is in the explored universes list
        exploredUniverses[currentUniverse.seed] = currentUniverse;
        
        // Initialize the pseudorandom number generator with the seed
        prng = new PseudoRandomNumberGenerator(currentUniverse.seed);
        
        // Update seed display
        document.getElementById('seed-display').textContent = currentUniverse.seed;
        document.getElementById('universe-name-display').textContent = currentUniverse.name;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate universe center
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;
        
        // Generate distant stars in the background
        for (let i = 0; i < config.distantStars; i++) {
            createDistantStar(
                prng.random() * viewportWidth,
                prng.random() * viewportHeight,
                prng.random() * 2 + 1
            );
        }

        // Create central star
        const centralStar = createCentralStar(centerX, centerY, config.centralStarSize);
        
        // Create or load central star data
        if (!currentUniverse.centralStar) {
            currentUniverse.centralStar = {
                name: getRandomItem(starNames),
                population: 0,
                exports: ['Solar Energy', 'Helium-3', 'Hydrogen Fuel'],
                imports: [],
                distance: 0,
                type: 'star',
                inventory: {},
                relations: 100, // Neutral relations value
                government: "None"  // Stars typically don't have governments
            };
        }
        
        centralStar.addEventListener('click', () => showCelestialBodyInfo(currentUniverse.centralStar));
        
        // Generate random number of planets
        const numPlanets = currentUniverse.planets.length > 0 ? currentUniverse.planets.length : 
                           getRandomInt(config.minPlanets, config.maxPlanets);
        
        const minDistanceFromStar = config.centralStarSize + 50;
        const maxDistanceFromStar = Math.min(viewportWidth, viewportHeight) / 2 - 50;
        const distanceStep = (maxDistanceFromStar - minDistanceFromStar) / numPlanets;
        
        // If creating a new universe, reset planets array
        if (currentUniverse.planets.length === 0) {
            currentUniverse.planets = [];
        }
        
        // Create planets
        for (let i = 0; i < numPlanets; i++) {
            const distance = minDistanceFromStar + i * distanceStep;
            const size = getRandomInt(15, 40);
            const speed = 0.1 / Math.sqrt(distance); // Slower speeds for distant planets
            
            // Create orbit
            createOrbit(centerX, centerY, distance);
            
            // Create planet
            const planet = createPlanet(centerX, centerY, distance, size, i, speed);
            
            // Create or use existing planet data
            let planetData;
            if (i < currentUniverse.planets.length) {
                planetData = currentUniverse.planets[i];
            } else {
                const planetName = getRandomItem(planetNames, []);
                planetData = {
                    name: planetName,
                    population: getRandomInt(100000, 10000000000),
                    type: 'planet',
                    distance: Math.round(distance * 3), // Scale distance
                    moons: [],
                    inventory: {},
                    relations: getRandomInt(50, 100), // Starting relations value (50-100)
                    government: generateRandomGovernment()
                };
                generatePlanetaryEconomy(planetData);
                currentUniverse.planets.push(planetData);
            }
            
            planet.addEventListener('click', () => showCelestialBodyInfo(planetData));
            
            // If this is a new game, set the starting location to the first planet
            if (!savedUniverse && i === 0) {
                gameState.currentLocation = planetData;
                planet.classList.add('current-location');
            }
            
            // Add moons to this planet
            const numMoons = planetData.moons.length > 0 ? planetData.moons.length : 
                            getRandomInt(config.minMoonsPerPlanet, config.maxMoonsPerPlanet);
            
            // If creating a new universe, reset moons array
            if (planetData.moons.length === 0) {
                planetData.moons = [];
            }
            
            for (let j = 0; j < numMoons; j++) {
                const moonDistance = size + 15 + j * 15;
                const moonSize = getRandomInt(4, 10);
                const moonSpeed = 0.3 / Math.sqrt(moonDistance);
                
                const moon = createMoon(planet, moonDistance, moonSize, j, moonSpeed);
                
                // Create or use existing moon data
                let moonData;
                if (j < planetData.moons.length) {
                    moonData = planetData.moons[j];
                } else {
                    const moonName = planetData.name + " " + getRandomItem(moonNames, []);
                    moonData = {
                        name: moonName,
                        population: getRandomInt(0, 1000000),
                        parentPlanet: planetData.name,
                        type: 'moon',
                        distance: Math.round((distance + moonDistance / 10) * 3), // Adjusted distance from central star
                        inventory: {},
                        relations: getRandomInt(50, 100), // Starting relations value (50-100)
                        government: generateRandomGovernment()
                    };
                    generatePlanetaryEconomy(moonData);
                    planetData.moons.push(moonData);
                }
                
                moon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering planet click
                    showCelestialBodyInfo(moonData);
                });
            }
        }
        
        // If this is a loaded game, highlight the player's current location
        if (savedUniverse && gameState.currentLocation) {
            highlightCurrentLocation();
        }
        
        // Update the game UI
        updateGameUI();
        
        // If we just loaded a game and player is in travel mode
        if (savedUniverse && gameState.travelMode) {
            continueTravelMode();
        }
        
        // Update the saved universes list
        updateSavedGamesList();
    }
    
    // Generate a random government type
    function generateRandomGovernment() {
        const governments = [
            "Democracy", "Republic", "Monarchy", "Dictatorship", "Technocracy", 
            "Corporate State", "Collective", "Anarchy", "Military Junta", 
            "Theocracy", "Federation"
        ];
        return getRandomItem(governments);
    }
    
    // Generate a planet's economy (what it imports/exports)
    function generatePlanetaryEconomy(planetData) {
        // Initialize inventory with all possible items
        planetData.inventory = {};
        
        itemTemplates.resources.forEach(item => {
            // Determine availability and price multiplier based on random factors
            let availability = getRandomInt(0, 200);
            
            // Some items might be completely unavailable
            if (availability < 20) {
                availability = 0;
            }
            
            // Calculate price multiplier - scarce items cost more, abundant items cost less
            let priceMultiplier = 2 - (availability / 100); // Range: 0.0 to 2.0
            
            // Ensure minimum price multiplier
            priceMultiplier = Math.max(0.5, priceMultiplier);
            
            // Some planets might have special deals on certain items
            if (prng.random() < 0.1) { // 10% chance for a special deal
                if (availability > 100) { // If item is abundant
                    priceMultiplier = 0.3; // Very cheap
                } else if (availability > 0) { // If item is scarce but available
                    priceMultiplier = 3.0; // Very expensive
                }
            }
            
            // Store item information in planet's inventory
            planetData.inventory[item.id] = {
                availability: availability,
                priceMultiplier: priceMultiplier
            };
        });
        
        // Assign major imports (scarce items)
        const scarceCommodities = Object.keys(planetData.inventory)
            .filter(itemId => {
                const item = planetData.inventory[itemId];
                return item.availability > 0 && item.availability < 70;
            })
            .sort((a, b) => planetData.inventory[a].priceMultiplier - planetData.inventory[b].priceMultiplier)
            .reverse()
            .slice(0, 3);
            
        // Assign major exports (abundant items)
        const abundantCommodities = Object.keys(planetData.inventory)
            .filter(itemId => planetData.inventory[itemId].availability > 130)
            .sort((a, b) => planetData.inventory[a].priceMultiplier - planetData.inventory[b].priceMultiplier)
            .slice(0, 3);
        
        // Convert item IDs to readable names for display
        planetData.imports = scarceCommodities.map(id => {
            const item = itemTemplates.resources.find(template => template.id === id);
            return item ? item.name : id;
        });
        
        planetData.exports = abundantCommodities.map(id => {
            const item = itemTemplates.resources.find(template => template.id === id);
            return item ? item.name : id;
        });
    }
    
    // Save Game Functions
    function saveGame() {
        const nameInput = document.getElementById('universe-name');
        
        if (nameInput.value.trim() !== "") {
            currentUniverse.name = nameInput.value.trim();
            document.getElementById('universe-name-display').textContent = currentUniverse.name;
        }
        
        currentUniverse.timestamp = Date.now();
        
        // Create the save game object
        const saveGame = {
            currentUniverse: currentUniverse,
            gameState: gameState,
            exploredUniverses: exploredUniverses
        };
        
        // Save to localStorage
        const savedGames = getSavedGames();
        savedGames[currentUniverse.seed] = saveGame;
        
        localStorage.setItem('spaceTradingGame', JSON.stringify(savedGames));
        
        // Update the UI
        updateSavedGamesList();
        
        // Show save confirmation
        const saveConfirm = document.getElementById('save-confirmation');
        saveConfirm.textContent = "Game saved!";
        saveConfirm.classList.remove('hidden');
        
        setTimeout(() => {
            saveConfirm.classList.add('hidden');
        }, 2000);
        
        // Add to event log
        addToEventLog("Game saved.");
    }
    
    function getSavedGames() {
        const saved = localStorage.getItem('spaceTradingGame');
        return saved ? JSON.parse(saved) : {};
    }
    
    function updateSavedGamesList() {
        const savedGames = getSavedGames();
        const selectElement = document.getElementById('saved-universes-list');
        
        // Clear existing options
        selectElement.innerHTML = '<option value="">-- Select a Saved Game --</option>';
        
        // Add options for each saved game
        Object.keys(savedGames).forEach(seed => {
            const save = savedGames[seed];
            const option = document.createElement('option');
            option.value = seed;
            
            const date = new Date(save.currentUniverse.timestamp);
            const creditsStr = save.gameState.credits.toLocaleString();
            
            option.textContent = `${save.currentUniverse.name} - Day ${save.gameState.day} - ${creditsStr} Credits`;
            selectElement.appendChild(option);
        });
    }
    
    function handleSavedGameSelection(event) {
        const seed = event.target.value;
        if (seed) {
            const savedGames = getSavedGames();
            const selectedGame = savedGames[seed];
            
            if (selectedGame) {
                // Update name input
                document.getElementById('universe-name').value = selectedGame.currentUniverse.name;
                
                // Load the game
                loadOrCreateUniverse(selectedGame);
                
                // Show a welcome back message
                showInfoModal(`Welcome back to ${selectedGame.currentUniverse.name}!`, 
                    `Day: ${selectedGame.gameState.day}<br>Credits: ${selectedGame.gameState.credits.toLocaleString()}`);
            }
        }
    }
    
    function startNewGame() {
        // Confirm if the user wants to start a new game
        if (confirm("Start a new game? Any unsaved progress will be lost.")) {
            // Reset name input
            document.getElementById('universe-name').value = "Starting Universe";
            
            // Generate a new universe
            loadOrCreateUniverse();
            
            // Show welcome message
            showInfoModal("Welcome Space Trader!", 
                "You begin your journey with a small trading ship and 10,000 credits. Buy low, sell high, upgrade your ship, and explore the galaxy!");
        }
    }
    
    // UI Element Creation
    function createSaveLoadUI() {
        const uiContainer = document.createElement('div');
        uiContainer.id = 'save-load-container';
        uiContainer.innerHTML = `
            <div class="controls">
                <button id="new-universe">New Game</button>
                <div class="seed-display-container">
                    <span>Universe: </span>
                    <span id="universe-name-display">Starting Universe</span>
                    <span> (Seed: </span>
                    <span id="seed-display"></span>
                    <span>)</span>
                </div>
            </div>
            <div class="save-controls">
                <input type="text" id="universe-name" placeholder="Universe Name">
                <button id="save-universe">Save Game</button>
                <span id="save-confirmation" class="hidden"></span>
            </div>
            <div class="load-controls">
                <select id="saved-universes-list">
                    <option value="">-- Select a Saved Game --</option>
                </select>
            </div>
        `;
        
        document.body.appendChild(uiContainer);
    }
    
    function createGameUI() {
        // Create the game HUD
        const gameHUD = document.createElement('div');
        gameHUD.id = 'game-hud';
        gameHUD.innerHTML = `
            <div class="hud-section">
                <div class="hud-label">Day:</div>
                <div id="day-display">1</div>
            </div>
            <div class="hud-section">
                <div class="hud-label">Credits:</div>
                <div id="credits-display">0</div>
            </div>
            <div class="hud-section">
                <div class="hud-label">Cargo:</div>
                <div id="cargo-display">0/0</div>
            </div>
            <div class="hud-section">
                <div class="hud-label">Fuel:</div>
                <div id="fuel-display">0/0</div>
            </div>
            <div class="hud-section">
                <div class="hud-label">Location:</div>
                <div id="location-display">None</div>
            </div>
        `;
        document.body.appendChild(gameHUD);
        
        // Create the game controls
        const gameControls = document.createElement('div');
        gameControls.id = 'game-controls';
        gameControls.innerHTML = `
            <button id="market-button" class="game-button">Trade Market</button>
            <button id="inventory-button" class="game-button">Inventory</button>
            <button id="ship-button" class="game-button">Ship Status</button>
            <button id="travel-button" class="game-button">Travel</button>
            <button id="log-button" class="game-button">Event Log</button>
        `;
        document.body.appendChild(gameControls);
        
        // Add event listeners for game controls
        document.getElementById('market-button').addEventListener('click', showMarket);
        document.getElementById('inventory-button').addEventListener('click', showInventory);
        document.getElementById('ship-button').addEventListener('click', showShipStatus);
        document.getElementById('travel-button').addEventListener('click', showTravelOptions);
        document.getElementById('log-button').addEventListener('click', showEventLog);
    }
    
    function updateGameUI() {
        document.getElementById('day-display').textContent = gameState.day;
        document.getElementById('credits-display').textContent = gameState.credits.toLocaleString();
        document.getElementById('cargo-display').textContent = `${calculateCurrentCargo()}/${gameState.ship.cargoCapacity}`;
        document.getElementById('fuel-display').textContent = `${gameState.ship.currentFuel}/${gameState.ship.fuelCapacity}`;
        document.getElementById('location-display').textContent = gameState.currentLocation ? gameState.currentLocation.name : 'In Space';
    }

    // Game Action Functions
    function showCelestialBodyInfo(bodyData) {
        // If player is in travel mode, ignore clicks on celestial bodies
        if (gameState.travelMode) return;
        
        // Set up modal title
        document.getElementById('modal-title').textContent = bodyData.name;
        
        // Set up modal content
        const content = document.getElementById('modal-content');
        
        // Format population
        const popText = formatNumber(bodyData.population);
        
        // Format the exports and imports
        const exportsText = bodyData.exports.join(', ') || 'None';
        const importsText = bodyData.imports.join(', ') || 'None';
        
        // Create content HTML
        let contentHTML = `
            <p><strong>Type:</strong> ${capitalizeFirstLetter(bodyData.type)}</p>
            <p><strong>Population:</strong> ${popText}</p>
            <p><strong>Government:</strong> ${bodyData.government}</p>
            <p><strong>Major Exports:</strong> ${exportsText}</p>
            <p><strong>Major Imports:</strong> ${importsText}</p>
            <p><strong>Distance from Central Star:</strong> ${bodyData.distance.toLocaleString()} million km</p>
        `;
        
        // Add travel button if this is not the current location
        if (gameState.currentLocation !== bodyData) {
            contentHTML += `<div class="modal-buttons">
                <button id="travel-to-body" class="modal-button">Travel Here</button>
            </div>`;
        } else {
            contentHTML += `<p class="current-location-text">Current Location</p>`;
        }
        
        content.innerHTML = contentHTML;
        
        // Add event listener for travel button
        const travelButton = document.getElementById('travel-to-body');
        if (travelButton) {
            travelButton.addEventListener('click', () => {
                startTravel(bodyData);
                modalContainer.classList.add('hidden');
            });
        }
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function showInfoModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-content').innerHTML = content;
        modalContainer.classList.remove('hidden');
    }
    
    function showMarket() {
        // Can only trade if at a location
        if (!gameState.currentLocation) {
            showInfoModal("Not Available", "You must be at a planet or moon to access the market.");
            return;
        }
        
        // Set up modal content
        document.getElementById('modal-title').textContent = `${gameState.currentLocation.name} Market`;
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <p>Your Credits: ${gameState.credits.toLocaleString()}</p>
            <p>Cargo Space: ${calculateCurrentCargo()}/${gameState.ship.cargoCapacity}</p>
            <div class="market-tabs">
                <button id="buy-tab" class="modal-tab active">Buy</button>
                <button id="sell-tab" class="modal-tab">Sell</button>
                <button id="upgrades-tab" class="modal-tab">Ship Upgrades</button>
            </div>
            <div id="market-content" class="tab-content">
                <table id="market-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Size</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateMarketItemRows('buy')}
                    </tbody>
                </table>
            </div>
        `;
        
        content.innerHTML = contentHTML;
        
        // Add event listeners for tabs
        document.getElementById('buy-tab').addEventListener('click', () => switchMarketTab('buy'));
        document.getElementById('sell-tab').addEventListener('click', () => switchMarketTab('sell'));
        document.getElementById('upgrades-tab').addEventListener('click', () => switchMarketTab('upgrades'));
        
        // Add event listeners for buy/sell buttons (will be added dynamically)
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function switchMarketTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.modal-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update table content
        const marketTable = document.getElementById('market-table');
        if (marketTable) {
            const tbody = marketTable.querySelector('tbody');
            tbody.innerHTML = generateMarketItemRows(tabName);
        }
    }
    
    function generateMarketItemRows(tabType) {
        let rows = '';
        
        if (tabType === 'buy') {
            // Generate rows for items available to buy
            itemTemplates.resources.forEach(template => {
                const planetInventory = gameState.currentLocation.inventory[template.id];
                
                // Skip if item isn't available at this location
                if (!planetInventory || planetInventory.availability === 0) return;
                
                const price = Math.round(template.basePrice * planetInventory.priceMultiplier);
                const availability = getAvailabilityText(planetInventory.availability);
                
                rows += `
                    <tr>
                        <td>${template.name} <span class="item-description">(${template.description})</span></td>
                        <td>${price.toLocaleString()} cr</td>
                        <td>${template.size}</td>
                        <td>${availability}</td>
                        <td>
                            <button class="market-button" onclick="buyItem('${template.id}', 1)">Buy 1</button>
                            <button class="market-button" onclick="buyItem('${template.id}', 5)">Buy 5</button>
                            <button class="market-button" onclick="buyItem('${template.id}', 10)">Buy 10</button>
                        </td>
                    </tr>
                `;
            });
            
            // If no items to buy
            if (rows === '') {
                rows = `<tr><td colspan="5">No items available for purchase at this location.</td></tr>`;
            }
            
        } else if (tabType === 'sell') {
            // Generate rows for player's inventory items to sell
            if (gameState.inventory.length === 0) {
                rows = `<tr><td colspan="5">Your cargo hold is empty.</td></tr>`;
            } else {
                // Group inventory items by ID and count
                const inventoryGroups = {};
                gameState.inventory.forEach(item => {
                    if (!inventoryGroups[item.id]) {
                        inventoryGroups[item.id] = {
                            template: item,
                            count: 0
                        };
                    }
                    inventoryGroups[item.id].count++;
                });
                
                // Create rows for each inventory group
                Object.values(inventoryGroups).forEach(group => {
                    const template = group.template;
                    const count = group.count;
                    
                    // Calculate sell price based on location
                    let sellPrice = template.basePrice;
                    
                    // If location has this in inventory, use its price multiplier
                    if (gameState.currentLocation.inventory[template.id]) {
                        sellPrice = Math.round(template.basePrice * gameState.currentLocation.inventory[template.id].priceMultiplier * 0.9); // 10% less than buy price
                        
                        // Bonus for scarce items
                        if (gameState.currentLocation.inventory[template.id].availability < 50) {
                            sellPrice = Math.round(sellPrice * 1.2); // 20% bonus for scarce items
                        }
                    } else {
                        // Location doesn't normally sell this, but might buy it
                        sellPrice = Math.round(template.basePrice * 0.8); // Standard 20% loss
                    }
                    
                    // Check if item is in major imports of the location
                    if (gameState.currentLocation.imports.includes(template.name)) {
                        sellPrice = Math.round(sellPrice * 1.5); // 50% bonus for items in high demand
                    }
                    
                    rows += `
                        <tr>
                            <td>${template.name} <span class="item-description">(${template.description})</span></td>
                            <td>${sellPrice.toLocaleString()} cr</td>
                            <td>${template.size}</td>
                            <td>${count}</td>
                            <td>
                                <button class="market-button" onclick="sellItem('${template.id}', 1)">Sell 1</button>
                                ${count >= 5 ? `<button class="market-button" onclick="sellItem('${template.id}', 5)">Sell 5</button>` : ''}
                                ${count >= 10 ? `<button class="market-button" onclick="sellItem('${template.id}', 10)">Sell 10</button>` : ''}
                                ${count > 1 ? `<button class="market-button" onclick="sellItem('${template.id}', ${count})">Sell All</button>` : ''}
                            </td>
                        </tr>
                    `;
                });
            }
            
        } else if (tabType === 'upgrades') {
            // Generate rows for ship upgrades
            let hasUpgrades = false;
            
            itemTemplates.shipUpgrades.forEach(upgrade => {
                // Skip sublight drive in starting universe
                if (upgrade.id === 'sublight_drive' && currentUniverse.difficulty === 1) return;
                
                // Calculate price with potential modifiers based on government/relations
                let upgradePrice = upgrade.basePrice;
                
                // Apply difficulty multiplier for later universes
                upgradePrice = Math.round(upgradePrice * (1 + (currentUniverse.difficulty - 1) * 0.2));
                
                // Determine if the upgrade can be installed (check current slots)
                let canInstall = true;
                let installButtonText = "Purchase";
                let reason = "";
                
                // Check if already installed
                if (upgrade.slot !== 'special' && gameState.ship.slots[upgrade.slot] && 
                    gameState.ship.slots[upgrade.slot].name === upgrade.name) {
                    canInstall = false;
                    reason = "Already installed";
                }
                
                // Check if can afford
                if (gameState.credits < upgradePrice) {
                    canInstall = false;
                    reason = "Cannot afford";
                }
                
                rows += `
                    <tr>
                        <td>${upgrade.name} <span class="item-description">(${upgrade.description})</span></td>
                        <td>${upgradePrice.toLocaleString()} cr</td>
                        <td>${upgrade.slot}</td>
                        <td>Available</td>
                        <td>
                            ${canInstall ? 
                                `<button class="market-button" onclick="purchaseUpgrade('${upgrade.id}')">Purchase</button>` :
                                `<button class="market-button disabled" disabled>${reason}</button>`
                            }
                        </td>
                    </tr>
                `;
                
                hasUpgrades = true;
            });
            
            if (!hasUpgrades) {
                rows = `<tr><td colspan="5">No upgrades available at this location.</td></tr>`;
            }
        }
        
        // Add global handlers for market buttons
        setTimeout(() => {
            // Buying items
            window.buyItem = (itemId, quantity) => {
                const template = itemTemplates.resources.find(t => t.id === itemId);
                if (!template) return;
                
                const planetInventory = gameState.currentLocation.inventory[itemId];
                const price = Math.round(template.basePrice * planetInventory.priceMultiplier);
                const totalCost = price * quantity;
                
                // Check if player can afford it
                if (gameState.credits < totalCost) {
                    showInfoModal("Cannot Afford", `You don't have enough credits to purchase ${quantity} ${template.name}. You need ${totalCost.toLocaleString()} credits.`);
                    return;
                }
                
                // Check if there's enough cargo space
                if (calculateCurrentCargo() + template.size * quantity > gameState.ship.cargoCapacity) {
                    showInfoModal("Cargo Full", `You don't have enough cargo space for ${quantity} ${template.name}. Required: ${template.size * quantity}, Available: ${gameState.ship.cargoCapacity - calculateCurrentCargo()}`);
                    return;
                }
                
                // All checks passed, process the purchase
                gameState.credits -= totalCost;
                
                // Add items to inventory
                for (let i = 0; i < quantity; i++) {
                    gameState.inventory.push({
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        size: template.size,
                        basePrice: template.basePrice,
                        purchasePrice: price,
                        legal: template.legal
                    });
                }
                
                // Update UI
                updateGameUI();
                
                // Refresh market display
                switchMarketTab('buy');
                
                // Add to event log
                addToEventLog(`Purchased ${quantity} ${template.name} for ${totalCost.toLocaleString()} credits.`);
            };
            
            // Selling items
            window.sellItem = (itemId, quantity) => {
                // Find all matching items in inventory
                const matchingItems = gameState.inventory.filter(item => item.id === itemId);
                if (matchingItems.length === 0) return;
                
                // Limit quantity to what's available
                const actualQuantity = Math.min(quantity, matchingItems.length);
                const itemsToSell = matchingItems.slice(0, actualQuantity);
                const template = itemsToSell[0]; // They're all the same item
                
                // Calculate sell price based on location
                let sellPrice = template.basePrice;
                
                // If location has this in inventory, use its price multiplier
                if (gameState.currentLocation.inventory[template.id]) {
                    sellPrice = Math.round(template.basePrice * gameState.currentLocation.inventory[template.id].priceMultiplier * 0.9); // 10% less than buy price
                    
                    // Bonus for scarce items
                    if (gameState.currentLocation.inventory[template.id].availability < 50) {
                        sellPrice = Math.round(sellPrice * 1.2); // 20% bonus for scarce items
                    }
                } else {
                    // Location doesn't normally sell this, but might buy it
                    sellPrice = Math.round(template.basePrice * 0.8); // Standard 20% loss
                }
                
                // Check if item is in major imports of the location
                if (gameState.currentLocation.imports.includes(template.name)) {
                    sellPrice = Math.round(sellPrice * 1.5); // 50% bonus for items in high demand
                }
                
                const totalEarned = sellPrice * actualQuantity;
                
                // Process the sale
                gameState.credits += totalEarned;
                
                // Remove items from inventory
                for (let i = 0; i < actualQuantity; i++) {
                    const index = gameState.inventory.findIndex(item => item.id === itemId);
                    if (index !== -1) {
                        gameState.inventory.splice(index, 1);
                    }
                }
                
                // Update UI
                updateGameUI();
                
                // Refresh market display
                switchMarketTab('sell');
                
                // Add to event log
                addToEventLog(`Sold ${actualQuantity} ${template.name} for ${totalEarned.toLocaleString()} credits.`);
            };
            
            // Purchasing ship upgrades
            window.purchaseUpgrade = (upgradeId) => {
                const upgrade = itemTemplates.shipUpgrades.find(u => u.id === upgradeId);
                if (!upgrade) return;
                
                // Calculate price with potential modifiers
                let upgradePrice = upgrade.basePrice;
                
                // Apply difficulty multiplier for later universes
                upgradePrice = Math.round(upgradePrice * (1 + (currentUniverse.difficulty - 1) * 0.2));
                
                // Check if player can afford it
                if (gameState.credits < upgradePrice) {
                    showInfoModal("Cannot Afford", `You don't have enough credits to purchase ${upgrade.name}. You need ${upgradePrice.toLocaleString()} credits.`);
                    return;
                }
                
                // Process the purchase
                gameState.credits -= upgradePrice;
                
                // Apply upgrade effects
                if (upgrade.slot === 'special') {
                    // Special upgrades may affect various stats
                    if (upgrade.effect.cargoCapacity) {
                        gameState.ship.cargoCapacity += upgrade.effect.cargoCapacity;
                    }
                    if (upgrade.effect.fuelCapacity) {
                        const oldCapacity = gameState.ship.fuelCapacity;
                        gameState.ship.fuelCapacity += upgrade.effect.fuelCapacity;
                        // Also add the fuel
                        gameState.ship.currentFuel += upgrade.effect.fuelCapacity;
                    }
                } else {
                    // Slot-based upgrades replace existing ones
                    gameState.ship.slots[upgrade.slot] = {
                        name: upgrade.name,
                        ...upgrade.effect
                    };
                    
                    // Special handling for engines
                    if (upgrade.slot === 'engine') {
                        gameState.ship.speed = 50 + upgrade.effect.speedBonus;
                    }
                }
                
                // Update UI
                updateGameUI();
                
                // Refresh upgrades display
                switchMarketTab('upgrades');
                
                // Add to event log
                addToEventLog(`Purchased and installed ${upgrade.name} for ${upgradePrice.toLocaleString()} credits.`);
            };
        }, 0);
        
        return rows;
    }
    
    function getAvailabilityText(availability) {
        if (availability === 0) return "None";
        if (availability < 50) return "Very Low";
        if (availability < 80) return "Low";
        if (availability < 120) return "Medium";
        if (availability < 160) return "High";
        return "Abundant";
    }
    
    function showInventory() {
        // Set up modal content
        document.getElementById('modal-title').textContent = "Your Cargo Inventory";
        
        const content = document.getElementById('modal-content');
        
        // Group inventory items
        const inventoryGroups = {};
        gameState.inventory.forEach(item => {
            if (!inventoryGroups[item.id]) {
                inventoryGroups[item.id] = {
                    template: item,
                    count: 0,
                    totalSize: 0
                };
            }
            inventoryGroups[item.id].count++;
            inventoryGroups[item.id].totalSize += item.size;
        });
        
        let contentHTML = `
            <p>Cargo Space: ${calculateCurrentCargo()}/${gameState.ship.cargoCapacity} units</p>
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Size (each)</th>
                        <th>Total Size</th>
                        <th>Base Value</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (Object.keys(inventoryGroups).length === 0) {
            contentHTML += `<tr><td colspan="5" class="centered">Your cargo hold is empty.</td></tr>`;
        } else {
            Object.values(inventoryGroups).forEach(group => {
                const template = group.template;
                
                contentHTML += `
                    <tr>
                        <td>${template.name}${!template.legal ? ' <span class="illegal">(Illegal)</span>' : ''}</td>
                        <td>${group.count}</td>
                        <td>${template.size}</td>
                        <td>${group.totalSize}</td>
                        <td>${template.basePrice.toLocaleString()} cr</td>
                    </tr>
                `;
            });
        }
        
        contentHTML += `
                </tbody>
            </table>
        `;
        
        content.innerHTML = contentHTML;
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function showShipStatus() {
        // Set up modal content
        document.getElementById('modal-title').textContent = gameState.ship.name + " - Ship Status";
        
        const content = document.getElementById('modal-content');
        
        // Calculate weapon and shield strength
        const weaponInfo = gameState.ship.slots.weapon ? 
            `${gameState.ship.slots.weapon.name} (Strength: ${gameState.ship.slots.weapon.weaponStrength || 0})` : 
            "None";
            
        const shieldInfo = gameState.ship.slots.shield ? 
            `${gameState.ship.slots.shield.name} (Strength: ${gameState.ship.slots.shield.shieldStrength || 0})` : 
            "None";
            
        const engineInfo = gameState.ship.slots.engine ? 
            `${gameState.ship.slots.engine.name} (Speed: ${gameState.ship.speed} million km/day)` : 
            "Standard Engine (Speed: 50 million km/day)";
            
        const specialInfo = gameState.ship.slots.special ? 
            gameState.ship.slots.special.name : 
            "None";
        
        let contentHTML = `
            <div class="ship-info">
                <div class="ship-stats">
                    <p><strong>Cargo Capacity:</strong> ${gameState.ship.cargoCapacity} units (${calculateCurrentCargo()} used)</p>
                    <p><strong>Fuel:</strong> ${gameState.ship.currentFuel}/${gameState.ship.fuelCapacity}</p>
                    <p><strong>Travel Speed:</strong> ${gameState.ship.speed} million km/day</p>
                </div>
                <div class="ship-equipment">
                    <h3>Equipment</h3>
                    <p><strong>Weapon:</strong> ${weaponInfo}</p>
                    <p><strong>Shield:</strong> ${shieldInfo}</p>
                    <p><strong>Engine:</strong> ${engineInfo}</p>
                    <p><strong>Special:</strong> ${specialInfo}</p>
                </div>
            </div>
        `;
        
        content.innerHTML = contentHTML;
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function showTravelOptions() {
        // If already in travel mode, show travel status
        if (gameState.travelMode) {
            showTravelStatus();
            return;
        }
        
        // Set up modal content
        document.getElementById('modal-title').textContent = "Travel Options";
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <p>Select a destination to travel to:</p>
            <p><strong>Current Location:</strong> ${gameState.currentLocation ? gameState.currentLocation.name : 'In Space'}</p>
            <p><strong>Ship Speed:</strong> ${gameState.ship.speed} million km/day</p>
            <p><strong>Fuel:</strong> ${gameState.ship.currentFuel}/${gameState.ship.fuelCapacity}</p>
            
            <div class="travel-options">
                <h3>Destinations</h3>
                <table class="travel-table">
                    <thead>
                        <tr>
                            <th>Destination</th>
                            <th>Type</th>
                            <th>Distance</th>
                            <th>Travel Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add central star
        if (gameState.currentLocation !== currentUniverse.centralStar) {
            const travelTime = calculateTravelTime(currentUniverse.centralStar);
            contentHTML += `
                <tr>
                    <td>${currentUniverse.centralStar.name}</td>
                    <td>Star</td>
                    <td>${currentUniverse.centralStar.distance.toLocaleString()} million km</td>
                    <td>${travelTime} days</td>
                    <td><button class="travel-button" onclick="startTravelToDestination('${currentUniverse.centralStar.name}', 'star')">Travel</button></td>
                </tr>
            `;
        }
        
        // Add planets
        currentUniverse.planets.forEach(planet => {
            if (gameState.currentLocation === planet) return; // Skip current location
            
            const travelTime = calculateTravelTime(planet);
            contentHTML += `
                <tr>
                    <td>${planet.name}</td>
                    <td>Planet</td>
                    <td>${planet.distance.toLocaleString()} million km</td>
                    <td>${travelTime} days</td>
                    <td><button class="travel-button" onclick="startTravelToDestination('${planet.name}', 'planet')">Travel</button></td>
                </tr>
            `;
            
            // Add moons for this planet
            planet.moons.forEach(moon => {
                if (gameState.currentLocation === moon) return; // Skip current location
                
                const travelTime = calculateTravelTime(moon);
                contentHTML += `
                    <tr>
                        <td>- ${moon.name}</td>
                        <td>Moon</td>
                        <td>${moon.distance.toLocaleString()} million km</td>
                        <td>${travelTime} days</td>
                        <td><button class="travel-button" onclick="startTravelToDestination('${moon.name}', 'moon', '${planet.name}')">Travel</button></td>
                    </tr>
                `;
            });
        });
        
        // Add option for universe travel if player has sublight drive
        const hasSublight = gameState.ship.slots.engine && gameState.ship.slots.engine.universeTravel;
        if (hasSublight) {
            contentHTML += `
                </tbody>
            </table>
            
            <h3>Universe Travel</h3>
            <p>Your Sublight Drive allows you to travel to other universes.</p>
            <div class="universe-travel-options">
                <button class="universe-travel-button" onclick="travelToNewUniverse()">Explore New Universe</button>
            `;
            
            // Add previously explored universes
            if (Object.keys(exploredUniverses).length > 1) { // More than just the current universe
                contentHTML += `
                    <select id="explored-universes">
                        <option value="">-- Select Known Universe --</option>
                `;
                
                Object.keys(exploredUniverses).forEach(seed => {
                    if (seed !== currentUniverse.seed) { // Skip current universe
                        const universe = exploredUniverses[seed];
                        contentHTML += `<option value="${seed}">${universe.name}</option>`;
                    }
                });
                
                contentHTML += `
                    </select>
                    <button class="universe-travel-button" onclick="travelToExploredUniverse()">Travel to Selected Universe</button>
                `;
            }
            
            contentHTML += `
                </div>
            `;
        } else {
            contentHTML += `
                </tbody>
            </table>
            `;
        }
        
        content.innerHTML = contentHTML;
        
        // Add travel handlers
        setTimeout(() => {
            window.startTravelToDestination = (destinationName, type, parentName) => {
                let destination;
                
                if (type === 'star') {
                    destination = currentUniverse.centralStar;
                } else if (type === 'planet') {
                    destination = currentUniverse.planets.find(p => p.name === destinationName);
                } else if (type === 'moon') {
                    // Find the parent planet first
                    const parentPlanet = currentUniverse.planets.find(p => p.name === parentName);
                    if (parentPlanet) {
                        destination = parentPlanet.moons.find(m => m.name === destinationName);
                    }
                }
                
                if (destination) {
                    startTravel(destination);
                    modalContainer.classList.add('hidden');
                }
            };
            
            window.travelToNewUniverse = () => {
                // Check fuel requirements for universe travel
                if (gameState.ship.currentFuel < 50) {
                    showInfoModal("Not Enough Fuel", "Universe travel requires at least 50 units of fuel.");
                    return;
                }
                
                // Create a new universe with higher difficulty
                const newUniverseSeed = generateRandomSeed();
                const newUniverse = {
                    seed: newUniverseSeed,
                    name: "New Universe " + (Object.keys(exploredUniverses).length),
                    timestamp: Date.now(),
                    centralStar: null,
                    planets: [],
                    difficulty: currentUniverse.difficulty + 1
                };
                
                // Consume fuel
                gameState.ship.currentFuel -= 50;
                
                // Reset player location
                gameState.currentLocation = null;
                
                // Add to event log
                addToEventLog(`Engaged Sublight Drive and traveled to a new universe.`);
                
                // Store current universe in explored list
                exploredUniverses[currentUniverse.seed] = currentUniverse;
                
                // Set new universe as current
                currentUniverse = newUniverse;
                exploredUniverses[newUniverse.seed] = newUniverse;
                
                // Save the game automatically
                saveGame();
                
                // Load the new universe
                loadOrCreateUniverse({
                    currentUniverse: newUniverse,
                    gameState: gameState,
                    exploredUniverses: exploredUniverses
                });
                
                // Show welcome message for new universe
                showInfoModal(`Welcome to ${newUniverse.name}!`, 
                    `You've entered a new universe with difficulty level ${newUniverse.difficulty}. 
                    Expect higher prices, more dangerous encounters, but also more valuable resources.`);
            };
            
            window.travelToExploredUniverse = () => {
                const selectElement = document.getElementById('explored-universes');
                const selectedSeed = selectElement.value;
                
                if (!selectedSeed) {
                    showInfoModal("No Selection", "Please select a universe to travel to.");
                    return;
                }
                
                const destinationUniverse = exploredUniverses[selectedSeed];
                
                // Check fuel requirements for universe travel
                if (gameState.ship.currentFuel < 50) {
                    showInfoModal("Not Enough Fuel", "Universe travel requires at least 50 units of fuel.");
                    return;
                }
                
                // Consume fuel
                gameState.ship.currentFuel -= 50;
                
                // Reset player location
                gameState.currentLocation = null;
                
                // Add to event log
                addToEventLog(`Engaged Sublight Drive and traveled to ${destinationUniverse.name}.`);
                
                // Store current universe in explored list
                exploredUniverses[currentUniverse.seed] = currentUniverse;
                
                // Set destination universe as current
                currentUniverse = destinationUniverse;
                
                // Save the game automatically
                saveGame();
                
                // Load the destination universe
                loadOrCreateUniverse({
                    currentUniverse: destinationUniverse,
                    gameState: gameState,
                    exploredUniverses: exploredUniverses
                });
                
                // Show welcome message
                showInfoModal(`Welcome to ${destinationUniverse.name}!`, 
                    `You've returned to a familiar universe with difficulty level ${destinationUniverse.difficulty}.`);
            };
        }, 0);
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function calculateTravelTime(destination) {
        if (!gameState.currentLocation) {
            // If not currently at a location, use distance directly
            return Math.ceil(destination.distance / gameState.ship.speed);
        }
        
        // Calculate distance between current location and destination
        const distance = Math.abs(gameState.currentLocation.distance - destination.distance);
        
        // Calculate travel time based on ship speed (in days)
        return Math.max(1, Math.ceil(distance / gameState.ship.speed));
    }
    
    function startTravel(destination) {
        // Calculate travel time
        const travelDays = calculateTravelTime(destination);
        
        // Calculate fuel required (1 unit per day)
        const fuelRequired = travelDays;
        
        // Check if enough fuel
        if (gameState.ship.currentFuel < fuelRequired) {
            showInfoModal("Not Enough Fuel", 
                `You need ${fuelRequired} fuel to reach ${destination.name}, but you only have ${gameState.ship.currentFuel} fuel. 
                Visit a planet or moon to refuel.`);
            return;
        }
        
        // Start travel mode
        gameState.travelMode = true;
        gameState.travelPath = [destination];
        gameState.travelDaysRemaining = travelDays;
        
        // Consume fuel
        gameState.ship.currentFuel -= fuelRequired;
        
        // Add to event log
        addToEventLog(`Started journey to ${destination.name}. Estimated travel time: ${travelDays} days.`);
        
        // Show travel status
        continueTravelMode();
    }
    
    function continueTravelMode() {
        if (!gameState.travelMode) return;
        
        // Check if travel is complete
        if (gameState.travelDaysRemaining <= 0) {
            completeTravelToDestination();
            return;
        }
        
        // Generate daily news and potential encounters
        const dailyEvents = generateDailyEvents();
        const hasEncounter = dailyEvents.encounter !== null;
        
        // Set up travel day modal
        document.getElementById('modal-title').textContent = "Travel Day " + gameState.day;
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <div class="travel-status">
                <p><strong>Destination:</strong> ${gameState.travelPath[0].name}</p>
                <p><strong>Days remaining:</strong> ${gameState.travelDaysRemaining}</p>
                <p><strong>Fuel remaining:</strong> ${gameState.ship.currentFuel}/${gameState.ship.fuelCapacity}</p>
            </div>
            <div class="daily-news">
                <h3>Galactic News:</h3>
                <p>${dailyEvents.news}</p>
            </div>
        `;
        
        // Add encounter information if there is one
        if (hasEncounter) {
            contentHTML += `
                <div class="encounter">
                    <h3>Space Encounter:</h3>
                    <p>${dailyEvents.encounter.description}</p>
                    <div class="encounter-options">
                        ${dailyEvents.encounter.options.map((option, index) => {
                            return `<button class="encounter-button" onclick="handleEncounterOption(${index})">${option}</button>`;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            contentHTML += `
                <div class="travel-buttons">
                    <button id="continue-travel-button" class="modal-button">Continue Journey</button>
                </div>
            `;
        }
        
        content.innerHTML = contentHTML;
        
        // Add event handler for continue button
        if (!hasEncounter) {
            document.getElementById('continue-travel-button').addEventListener('click', () => {
                advanceTravelDay();
            });
        }
        
        // Add encounter option handlers
        if (hasEncounter) {
            window.handleEncounterOption = (optionIndex) => {
                handleEncounterResponse(dailyEvents.encounter, optionIndex);
            };
        }
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function advanceTravelDay() {
        // Advance the day counter
        gameState.day++;
        
        // Decrease remaining travel days
        gameState.travelDaysRemaining--;
        
        // Update game UI
        updateGameUI();
        
        // Continue travel mode
        continueTravelMode();
    }
    
// Modify the completeTravelToDestination function to include auto-refueling
function completeTravelToDestination() {
    // Set current location to the destination
    gameState.currentLocation = gameState.travelPath[0];
    
    // Exit travel mode
    gameState.travelMode = false;
    gameState.travelPath = [];
    gameState.travelDaysRemaining = 0;
    
    // Auto-refuel the ship when reaching a destination
    gameState.ship.currentFuel = gameState.ship.fuelCapacity;
    
    // Add to event log
    addToEventLog(`Arrived at ${gameState.currentLocation.name}. Ship refueled to full capacity.`);
    
    // Highlight current location on the map
    highlightCurrentLocation();
    
    // Update game UI
    updateGameUI();
    
    // Show arrival message
    showInfoModal(`Arrived at ${gameState.currentLocation.name}`, 
        `You have successfully arrived at your destination. 
        Your ship has been automatically refueled to full capacity.
        The local time is Day ${gameState.day}.
        What would you like to do next?`);
}
    
    function highlightCurrentLocation() {
        // Remove current location class from all celestial bodies
        const allBodies = document.querySelectorAll('.planet, .moon, .star');
        allBodies.forEach(body => body.classList.remove('current-location'));
        
        // Find the element representing the current location
        if (gameState.currentLocation) {
            if (gameState.currentLocation.type === 'star') {
                const star = document.querySelector('.central-star');
                if (star) star.classList.add('current-location');
            } else if (gameState.currentLocation.type === 'planet') {
                // Find planet index
                const planetIndex = currentUniverse.planets.findIndex(p => p.name === gameState.currentLocation.name);
                if (planetIndex !== -1) {
                    const planet = document.querySelectorAll('.planet')[planetIndex];
                    if (planet) planet.classList.add('current-location');
                }
            } else if (gameState.currentLocation.type === 'moon') {
                // This is more complex - would need to find the specific moon element
                // For simplicity, we're not highlighting moons for now
            }
        }
    }
    
    function generateDailyEvents() {
        const events = {
            news: generateGalacticNews(),
            encounter: null
        };
        
        // Chance of encounter based on universe difficulty
        const encounterChance = 0.2 + (currentUniverse.difficulty - 1) * 0.1; // 20% in first universe, +10% per level
        
        if (prng.random() < encounterChance) {
            events.encounter = generateRandomEncounter();
        }
        
        return events;
    }
    
    function generateGalacticNews() {
        const newsTemplate = getRandomItem(newsEventTemplates);
        
        // Replace placeholders with actual values
        let news = newsTemplate.template;
        
        // Replace {planet} or {planet1} with random planet names
        if (news.includes("{planet}")) {
            const randomPlanet = getRandomItem(currentUniverse.planets);
            news = news.replace("{planet}", randomPlanet.name);
        }
        
        if (news.includes("{planet1}") && news.includes("{planet2}")) {
            const planets = [...currentUniverse.planets];
            const randomPlanet1 = getRandomItem(planets);
            const indexToRemove = planets.indexOf(randomPlanet1);
            planets.splice(indexToRemove, 1);
            
            const randomPlanet2 = getRandomItem(planets);
            
            news = news.replace("{planet1}", randomPlanet1.name)
                       .replace("{planet2}", randomPlanet2.name);
        }
        
        // Replace {item} with a random resource
        if (news.includes("{item}")) {
            const randomItem = getRandomItem(itemTemplates.resources);
            news = news.replace("{item}", randomItem.name);
        }
        
        return news;
    }
    
    function generateRandomEncounter() {
        const encounterTemplate = getRandomItem(shipEncounterTemplates);
        
        // Customize encounter based on universe difficulty
        let description = encounterTemplate.template;
        const options = [...encounterTemplate.options];
        
        // For military encounters, check for illegal goods
        if (encounterTemplate.type === "military") {
            const hasIllegalGoods = gameState.inventory.some(item => !item.legal);
            
            if (hasIllegalGoods) {
                description += " Their sensors are detecting suspicious cargo.";
            }
        }
        
        // For pirate encounters, adjust description based on ship strength
        if (encounterTemplate.type === "pirate") {
            const pirateStrength = 1 + Math.floor(currentUniverse.difficulty / 2);
            const playerCombatStrength = calculatePlayerCombatStrength();
            
            if (pirateStrength > playerCombatStrength * 1.5) {
                description += " They appear heavily armed and dangerous.";
            } else if (pirateStrength < playerCombatStrength * 0.8) {
                description += " Their ship looks like it's seen better days.";
            }
        }
        
        return {
            type: encounterTemplate.type,
            description: description,
            options: options,
            // Store additional encounter data
            data: {
                difficulty: currentUniverse.difficulty,
                strength: 1 + Math.floor(currentUniverse.difficulty / 2)
            }
        };
    }
    
    function handleEncounterResponse(encounter, optionIndex) {
        let resultMessage = "";
        let outcomeSuccessful = false;
        
        // Handle different encounter types
        switch (encounter.type) {
            case "trader":
                resultMessage = handleTraderEncounter(encounter, optionIndex);
                outcomeSuccessful = true; // Traders are generally positive encounters
                break;
                
            case "military":
                const militaryResult = handleMilitaryEncounter(encounter, optionIndex);
                resultMessage = militaryResult.message;
                outcomeSuccessful = militaryResult.success;
                break;
                
            case "pirate":
                const pirateResult = handlePirateEncounter(encounter, optionIndex);
                resultMessage = pirateResult.message;
                outcomeSuccessful = pirateResult.success;
                break;
                
            case "distress":
                const distressResult = handleDistressEncounter(encounter, optionIndex);
                resultMessage = distressResult.message;
                outcomeSuccessful = distressResult.success;
                break;
                
            case "smuggler":
                const smugglerResult = handleSmugglerEncounter(encounter, optionIndex);
                resultMessage = smugglerResult.message;
                outcomeSuccessful = smugglerResult.success;
                break;
        }
        
        // Show the encounter result
        showEncounterResult(resultMessage, outcomeSuccessful);
    }
    
    function handleTraderEncounter(encounter, optionIndex) {
        switch (optionIndex) {
            case 0: // Trade
                // Create a small temporary market
                const tradeItems = [];
                
                // Generate 2-4 random items for the trader to sell
                const numItemsToSell = getRandomInt(2, 4);
                for (let i = 0; i < numItemsToSell; i++) {
                    const randomItem = getRandomItem(itemTemplates.resources);
                    const priceMultiplier = 0.8 + prng.random() * 0.4; // 0.8 to 1.2
                    
                    tradeItems.push({
                        item: randomItem,
                        price: Math.round(randomItem.basePrice * priceMultiplier)
                    });
                }
                
                // Show trade UI
                showTraderMarket(tradeItems);
                return null; // Don't show a result message right away
                
            case 1: // Ignore
                return "You ignore the trader's hails and continue on your journey.";
                
            case 2: // Attack
                // Determine outcome based on player's combat strength
                const playerCombatStrength = calculatePlayerCombatStrength();
                
                if (playerCombatStrength > 1) {
                    // Success
                    const stolenCredits = getRandomInt(500, 2000) * currentUniverse.difficulty;
                    gameState.credits += stolenCredits;
                    
                    // Chance to get some cargo
                    if (prng.random() < 0.7 && calculateCurrentCargo() < gameState.ship.cargoCapacity) {
                        const randomItem = getRandomItem(itemTemplates.resources);
                        gameState.inventory.push({
                            id: randomItem.id,
                            name: randomItem.name,
                            description: randomItem.description,
                            size: randomItem.size,
                            basePrice: randomItem.basePrice,
                            legal: randomItem.legal
                        });
                        
                        updateGameUI();
                        return `You attack the trader and disable their ship. You manage to steal ${stolenCredits.toLocaleString()} credits and some ${randomItem.name}.`;
                    }
                    
                    updateGameUI();
                    return `You attack the trader and disable their ship. You manage to steal ${stolenCredits.toLocaleString()} credits.`;
                } else {
                    // Failure - trader escapes
                    return "You attempt to attack the trader, but they manage to escape before you can do any damage.";
                }
        }
    }
    
    function handleMilitaryEncounter(encounter, optionIndex) {
        const hasIllegalGoods = gameState.inventory.some(item => !item.legal);
        
        switch (optionIndex) {
            case 0: // Submit to Scan
                if (hasIllegalGoods) {
                    // Confiscate illegal goods and fine
                    const illegalItems = gameState.inventory.filter(item => !item.legal);
                    
                    // Remove illegal items
                    gameState.inventory = gameState.inventory.filter(item => item.legal);
                    
                    // Calculate fine
                    const fine = 5000 * currentUniverse.difficulty;
                    gameState.credits -= fine;
                    if (gameState.credits < 0) gameState.credits = 0;
                    
                    updateGameUI();
                    return {
                        message: `The military patrol discovers your illegal cargo and confiscates ${illegalItems.length} item(s). You are fined ${fine.toLocaleString()} credits.`,
                        success: false
                    };
                } else {
                    // Safe passage
                    return {
                        message: "The military patrol scans your ship and finds nothing illegal. They wish you safe travels and move on.",
                        success: true
                    };
                }
                
            case 1: // Flee
                // Success chance based on engine speed and difficulty
                const fleeChance = 0.4 + (gameState.ship.speed / 200); // Base 40% + up to 25% bonus from speed
                
                if (prng.random() < fleeChance) {
                    // Successful escape
                    return {
                        message: "You push your engines to maximum and manage to outrun the military patrol!",
                        success: true
                    };
                } else {
                    // Failed escape - worse punishment
                    // Confiscate all illegal goods and larger fine
                    if (hasIllegalGoods) {
                        // Remove illegal items
                        gameState.inventory = gameState.inventory.filter(item => item.legal);
                        
                        // Heavy fine for fleeing and illegal cargo
                        const fine = 10000 * currentUniverse.difficulty;
                        gameState.credits -= fine;
                        if (gameState.credits < 0) gameState.credits = 0;
                        
                        updateGameUI();
                        return {
                            message: `The military patrol catches your ship and performs a thorough scan. They discover your illegal cargo and confiscate it. For attempting to flee, you're fined ${fine.toLocaleString()} credits!`,
                            success: false
                        };
                    } else {
                        // Fine for fleeing despite having nothing illegal
                        const fine = 2000 * currentUniverse.difficulty;
                        gameState.credits -= fine;
                        if (gameState.credits < 0) gameState.credits = 0;
                        
                        updateGameUI();
                        return {
                            message: `The military patrol catches your ship. They find no illegal cargo, but fine you ${fine.toLocaleString()} credits for attempting to evade inspection.`,
                            success: false
                        };
                    }
                }
                
            case 2: // Attack
                // Very bad idea to attack military
                const playerCombatStrength = calculatePlayerCombatStrength();
                const militaryStrength = 3 + currentUniverse.difficulty;
                
                if (playerCombatStrength > militaryStrength * 1.5) {
                    // Somehow defeat the military - very difficult
                    const damageToShip = getRandomInt(10, 30);
                    gameState.ship.currentFuel -= damageToShip;
                    if (gameState.ship.currentFuel < 1) gameState.ship.currentFuel = 1;
                    
                    updateGameUI();
                    return {
                        message: `Against all odds, you manage to disable the military patrol ship! Your ship takes damage in the battle, losing ${damageToShip} units of fuel. You should lay low for a while.`,
                        success: true
                    };
                } else {
                    // Devastating defeat
                    // Lose a significant portion of credits and cargo
                    const creditsLost = Math.round(gameState.credits * 0.4); // Lose 40% of credits
                    gameState.credits -= creditsLost;
                    
                    // Lose some cargo
                    if (gameState.inventory.length > 0) {
                        const itemsToLose = Math.ceil(gameState.inventory.length * 0.3); // Lose 30% of items
                        gameState.inventory = gameState.inventory.slice(0, gameState.inventory.length - itemsToLose);
                    }
                    
                    // Heavy fuel damage
                    gameState.ship.currentFuel = Math.floor(gameState.ship.currentFuel * 0.5); // Lose 50% of fuel
                    if (gameState.ship.currentFuel < 1) gameState.ship.currentFuel = 1;
                    
                    updateGameUI();
                    return {
                        message: `Your attack on the military patrol is a disastrous mistake! Your ship is severely damaged, and you lose ${creditsLost.toLocaleString()} credits and some cargo. You barely escape with your life.`,
                        success: false
                    };
                }
        }
    }
    
    function handlePirateEncounter(encounter, optionIndex) {
        const pirateStrength = encounter.data.strength;
        const playerCombatStrength = calculatePlayerCombatStrength();
        
        switch (optionIndex) {
            case 0: // Fight
                if (playerCombatStrength >= pirateStrength) {
                    // Victory - get some reward
                    const rewardCredits = getRandomInt(1000, 3000) * currentUniverse.difficulty;
                    gameState.credits += rewardCredits;
                    
                    updateGameUI();
                    return {
                        message: `You engage the pirates and defeat them! Searching their ship, you find ${rewardCredits.toLocaleString()} credits.`,
                        success: true
                    };
                } else {
                    // Loss - lose credits and possibly cargo
                    const creditsLost = Math.round(gameState.credits * 0.2); // Lose 20% of credits
                    gameState.credits -= creditsLost;
                    
                    // Damage to ship
                    const fuelLost = Math.ceil(gameState.ship.currentFuel * 0.2); // Lose 20% of fuel
                    gameState.ship.currentFuel -= fuelLost;
                    if (gameState.ship.currentFuel < 1) gameState.ship.currentFuel = 1;
                    
                    updateGameUI();
                    return {
                        message: `The pirates overpower your ship! They steal ${creditsLost.toLocaleString()} credits and damage your fuel systems, causing you to lose ${fuelLost} units of fuel.`,
                        success: false
                    };
                }
                
            case 1: // Flee
                const fleeChance = 0.5 + (gameState.ship.speed / 150); // Base 50% + up to 33% bonus from speed
                
                if (prng.random() < fleeChance) {
                    // Successful escape
                    return {
                        message: "You engage emergency thrusters and manage to outrun the pirates!",
                        success: true
                    };
                } else {
                    // Failed escape - pirates catch you and take more
                    const creditsLost = Math.round(gameState.credits * 0.3); // Lose 30% of credits
                    gameState.credits -= creditsLost;
                    
                    // Lose some cargo if available
                    let cargoLostMessage = "";
                    if (gameState.inventory.length > 0) {
                        const itemsToLose = Math.ceil(gameState.inventory.length * 0.2); // Lose 20% of items
                        const lostItems = gameState.inventory.splice(0, itemsToLose);
                        cargoLostMessage = ` and ${itemsToLose} items from your cargo`;
                    }
                    
                    updateGameUI();
                    return {
                        message: `The pirates catch your ship during your escape attempt! They steal ${creditsLost.toLocaleString()} credits${cargoLostMessage}.`,
                        success: false
                    };
                }
                
            case 2: // Negotiate
                // Pay tribute to be left alone
                const tributeAmount = Math.round(gameState.credits * 0.15); // 15% of credits
                
                if (gameState.credits > tributeAmount) {
                    gameState.credits -= tributeAmount;
                    
                    updateGameUI();
                    return {
                        message: `You negotiate with the pirates and pay them ${tributeAmount.toLocaleString()} credits. They let you pass safely.`,
                        success: true
                    };
                } else {
                    // Not enough to pay tribute
                    const creditsLost = Math.round(gameState.credits * 0.5); // Lose 50% of credits
                    gameState.credits -= creditsLost;
                    
                    // Damage to ship
                    const fuelLost = Math.ceil(gameState.ship.currentFuel * 0.15); // Lose 15% of fuel
                    gameState.ship.currentFuel -= fuelLost;
                    if (gameState.ship.currentFuel < 1) gameState.ship.currentFuel = 1;
                    
                    updateGameUI();
                    return {
                        message: `The pirates laugh at your negotiation attempt - you don't have enough credits to interest them! They attack anyway, stealing ${creditsLost.toLocaleString()} credits and damaging your ship.`,
                        success: false
                    };
                }
        }
    }
    
    function handleDistressEncounter(encounter, optionIndex) {
        switch (optionIndex) {
            case 0: // Assist
                // Random chance of scam vs legitimate
                if (prng.random() < 0.7) { // 70% legitimate
                    // Legitimate distress call - get reward
                    const rewardCredits = getRandomInt(1000, 4000) * currentUniverse.difficulty;
                    gameState.credits += rewardCredits;
                    
                    updateGameUI();
                    return {
                        message: `You assist the damaged ship with repairs. The grateful captain rewards you with ${rewardCredits.toLocaleString()} credits!`,
                        success: true
                    };
                } else {
                    // It's a trap!
                    const creditsLost = Math.round(gameState.credits * 0.15); // Lose 15% of credits
                    gameState.credits -= creditsLost;
                    
                    updateGameUI();
                    return {
                        message: `As you approach to help, the "distressed" ship reveals hidden weapons! It's a trap! They attack and steal ${creditsLost.toLocaleString()} credits before you manage to escape.`,
                        success: false
                    };
                }
                
            case 1: // Ignore
                // No risk, but potential opportunity cost
                return {
                    message: "You ignore the distress signal and continue your journey safely.",
                    success: true
                };
                
            case 2: // Investigate
                // More information before deciding
                const isLegitimate = prng.random() < 0.7; // 70% legitimate
                
                if (isLegitimate) {
                    return {
                        message: "You scan the ship and confirm it's a legitimate distress call. The ship appears to be a damaged transport vessel with a small crew. What would you like to do?",
                        options: ["Assist Them", "Leave Them"],
                        callback: (option) => {
                            if (option === 0) { // Assist
                                const rewardCredits = getRandomInt(1000, 4000) * currentUniverse.difficulty;
                                gameState.credits += rewardCredits;
                                
                                updateGameUI();
                                showEncounterResult(`You assist the damaged ship with repairs. The grateful captain rewards you with ${rewardCredits.toLocaleString()} credits!`, true);
                            } else { // Leave
                                showEncounterResult("You decide to leave the ship to fend for itself and continue your journey.", false);
                            }
                        },
                        success: true
                    };
                } else {
                    return {
                        message: "Your scans reveal suspicious power readings and hidden weapon systems on the supposedly damaged ship. It appears to be a trap!",
                        options: ["Attack First", "Flee Immediately"],
                        callback: (option) => {
                            if (option === 0) { // Attack
                                const playerCombatStrength = calculatePlayerCombatStrength();
                                
                                if (playerCombatStrength > 2) {
                                    const rewardCredits = getRandomInt(2000, 5000) * currentUniverse.difficulty;
                                    gameState.credits += rewardCredits;
                                    
                                    updateGameUI();
                                    showEncounterResult(`You catch the pirates off guard with your preemptive attack! After disabling their ship, you find ${rewardCredits.toLocaleString()} credits in their cargo hold.`, true);
                                } else {
                                    const creditsLost = Math.round(gameState.credits * 0.2);
                                    gameState.credits -= creditsLost;
                                    
                                    updateGameUI();
                                    showEncounterResult(`Your attack fails to disable the pirate ship. They return fire and damage your systems, stealing ${creditsLost.toLocaleString()} credits before you manage to escape.`, false);
                                }
                            } else { // Flee
                                showEncounterResult("You immediately engage your engines and flee from the trap before they can react!", true);
                            }
                        },
                        success: true
                    };
                }
        }
    }
    
    function handleSmugglerEncounter(encounter, optionIndex) {
        switch (optionIndex) {
            case 0: // View Offer
                // Show smuggler market with some illegal goods at discount
                const smugglerItems = [];
                
                // Always have at least one illegal item
                const illegalItem = itemTemplates.resources.find(item => !item.legal);
                smugglerItems.push({
                    item: illegalItem,
                    price: Math.round(illegalItem.basePrice * 0.7) // 30% discount
                });
                
                // Add 1-3 more random items
                const numExtraItems = getRandomInt(1, 3);
                for (let i = 0; i < numExtraItems; i++) {
                    const randomItem = getRandomItem(itemTemplates.resources);
                    const priceMultiplier = 0.6 + prng.random() * 0.3; // 0.6 to 0.9
                    
                    smugglerItems.push({
                        item: randomItem,
                        price: Math.round(randomItem.basePrice * priceMultiplier)
                    });
                }
                
                // Show smuggler market
                showTraderMarket(smugglerItems, true);
                return null; // Don't show a result message right away
                
            case 1: // Ignore
                return {
                    message: "You ignore the suspicious ship and continue on your way.",
                    success: true
                };
                
            case 2: // Report to Authorities
                // Reward for reporting
                const rewardCredits = getRandomInt(500, 1500) * currentUniverse.difficulty;
                gameState.credits += rewardCredits;
                
                updateGameUI();
                return {
                    message: `You report the smuggler to the nearest patrol. They thank you for the information and provide a reward of ${rewardCredits.toLocaleString()} credits.`,
                    success: true
                };
        }
    }
    
    function showTraderMarket(items, isSmuggler = false) {
        // Set up modal content
        document.getElementById('modal-title').textContent = isSmuggler ? "Smuggler's Market" : "Trader's Goods";
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <p>Your Credits: ${gameState.credits.toLocaleString()}</p>
            <p>Cargo Space: ${calculateCurrentCargo()}/${gameState.ship.cargoCapacity}</p>
            <table id="trader-market-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Size</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        items.forEach((itemInfo, index) => {
            const item = itemInfo.item;
            const price = itemInfo.price;
            
            contentHTML += `
                <tr>
                    <td>${item.name} ${!item.legal ? '<span class="illegal">(Illegal)</span>' : ''}</td>
                    <td>${price.toLocaleString()} cr</td>
                    <td>${item.size}</td>
                    <td>${!item.legal ? 'Contraband' : 'Legal'}</td>
                    <td>
                        <button class="market-button" onclick="traderBuyItem(${index}, 1)">Buy 1</button>
                        <button class="market-button" onclick="traderBuyItem(${index}, 5)">Buy 5</button>
                    </td>
                </tr>
            `;
        });
        
        contentHTML += `
                </tbody>
            </table>
            <div class="modal-buttons">
                <button id="trader-leave-button" class="modal-button">Leave</button>
            </div>
        `;
        
        content.innerHTML = contentHTML;
        
        // Add event handlers
        document.getElementById('trader-leave-button').addEventListener('click', () => {
            // Continue journey
            advanceTravelDay();
        });
        
        // Add buy handler
        window.traderBuyItem = (itemIndex, quantity) => {
            const itemInfo = items[itemIndex];
            if (!itemInfo) return;
            
            const item = itemInfo.item;
            const price = itemInfo.price;
            const totalCost = price * quantity;
            
            // Check if player can afford it
            if (gameState.credits < totalCost) {
                showInfoModal("Cannot Afford", `You don't have enough credits to purchase ${quantity} ${item.name}. You need ${totalCost.toLocaleString()} credits.`);
                return;
            }
            
            // Check if there's enough cargo space
            if (calculateCurrentCargo() + item.size * quantity > gameState.ship.cargoCapacity) {
                showInfoModal("Cargo Full", `You don't have enough cargo space for ${quantity} ${item.name}. Required: ${item.size * quantity}, Available: ${gameState.ship.cargoCapacity - calculateCurrentCargo()}`);
                return;
            }
            
            // All checks passed, process the purchase
            gameState.credits -= totalCost;
            
            // Add items to inventory
            for (let i = 0; i < quantity; i++) {
                gameState.inventory.push({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    size: item.size,
                    basePrice: item.basePrice,
                    purchasePrice: price,
                    legal: item.legal
                });
            }
            
            // Update UI
            updateGameUI();
            
            // Update the trader market display
            showTraderMarket(items, isSmuggler);
            
            // Add to event log
            addToEventLog(`Purchased ${quantity} ${item.name} from ${isSmuggler ? 'smuggler' : 'trader'} for ${totalCost.toLocaleString()} credits.`);
        };
    }
    
    function showEncounterResult(message, success) {
        // Set up modal content
        document.getElementById('modal-title').textContent = success ? "Encounter Resolved" : "Encounter Result";
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <p>${message}</p>
            <div class="modal-buttons">
                <button id="continue-journey-button" class="modal-button">Continue Journey</button>
            </div>
        `;
        
        content.innerHTML = contentHTML;
        
        // Add event handler for continue button
        document.getElementById('continue-journey-button').addEventListener('click', () => {
            advanceTravelDay();
        });
        
        // Add to event log
        addToEventLog(message);
        
        // Show the modal if not already visible
        if (modalContainer.classList.contains('hidden')) {
            modalContainer.classList.remove('hidden');
        }
    }
    
    function calculatePlayerCombatStrength() {
        // Base strength is 1
        let strength = 1;
        
        // Add weapon strength
        if (gameState.ship.slots.weapon) {
            strength += gameState.ship.slots.weapon.weaponStrength || 0;
        }
        
        // Add shield strength (as a smaller bonus)
        if (gameState.ship.slots.shield) {
            strength += (gameState.ship.slots.shield.shieldStrength || 0) * 0.5;
        }
        
        return strength;
    }
    
    function showEventLog() {
        // Set up modal content
        document.getElementById('modal-title').textContent = "Event Log";
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <div class="event-log">
                <table class="event-log-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Event</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Show most recent events first
        gameState.eventLog.slice().reverse().forEach(event => {
            contentHTML += `
                <tr>
                    <td>${event.day}</td>
                    <td>${event.message}</td>
                </tr>
            `;
        });
        
        contentHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        content.innerHTML = contentHTML;
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    function showTravelStatus() {
        // If travel is complete, shouldn't get here, but just in case
        if (gameState.travelDaysRemaining <= 0) {
            completeTravelToDestination();
            return;
        }
        
        // Set up modal content
        document.getElementById('modal-title').textContent = "Travel in Progress";
        
        const content = document.getElementById('modal-content');
        
        let contentHTML = `
            <div class="travel-status">
                <p><strong>Day:</strong> ${gameState.day}</p>
                <p><strong>Destination:</strong> ${gameState.travelPath[0].name}</p>
                <p><strong>Days remaining:</strong> ${gameState.travelDaysRemaining}</p>
                <p><strong>Fuel remaining:</strong> ${gameState.ship.currentFuel}/${gameState.ship.fuelCapacity}</p>
            </div>
            <div class="modal-buttons">
                <button id="continue-journey-button" class="modal-button">Continue Journey</button>
            </div>
        `;
        
        content.innerHTML = contentHTML;
        
        // Add event handler for continue button
        document.getElementById('continue-journey-button').addEventListener('click', () => {
            // Generate a new travel day event
            continueTravelMode();
        });
        
        // Show the modal
        modalContainer.classList.remove('hidden');
    }
    
    // Helper Functions for Universe Creation
    function createDistantStar(x, y, size) {
        const star = document.createElement('div');
        star.className = 'star distant-star';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        universeContainer.appendChild(star);
        return star;
    }
    
    function createCentralStar(x, y, size) {
        const star = document.createElement('div');
        star.className = 'star central-star';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x - size/2}px`;
        star.style.top = `${y - size/2}px`;
        universeContainer.appendChild(star);
        return star;
    }
    
    function createOrbit(centerX, centerY, radius) {
        const orbit = document.createElement('div');
        orbit.className = 'orbit';
        orbit.style.width = `${radius * 2}px`;
        orbit.style.height = `${radius * 2}px`;
        orbit.style.left = `${centerX - radius}px`;
        orbit.style.top = `${centerY - radius}px`;
        universeContainer.appendChild(orbit);
        return orbit;
    }
    
    function createPlanet(centerX, centerY, orbitRadius, size, index, speed) {
        // Create planet element
        const planet = document.createElement('div');
        planet.className = 'planet';
        planet.style.width = `${size}px`;
        planet.style.height = `${size}px`;
        planet.style.background = getRandomItem(planetColors);
        
        // Calculate initial position
        const angle = getRandomInt(0, 360);
        const x = centerX + orbitRadius * Math.cos(angle * Math.PI / 180);
        const y = centerY + orbitRadius * Math.sin(angle * Math.PI / 180);
        
        planet.style.left = `${x - size/2}px`;
        planet.style.top = `${y - size/2}px`;
        
        // Create animation for orbital movement
        const animationName = `orbit-planet-${index}`;
        createOrbitAnimation(animationName, centerX, centerY, orbitRadius, size);
        
        planet.style.animation = `${animationName} ${Math.round(100 / speed)}s linear infinite`;
        
        universeContainer.appendChild(planet);
        return planet;
    }
    
    function createMoon(planet, distance, size, index, speed) {
        const moon = document.createElement('div');
        moon.className = 'moon';
        moon.style.width = `${size}px`;
        moon.style.height = `${size}px`;
        moon.style.backgroundColor = getRandomItem(moonColors);
        
        // Position will be set by the animation
        moon.style.left = `${-size/2}px`;
        moon.style.top = `${-size/2}px`;
        
        // Create a moon container that will orbit around the planet
        const moonContainer = document.createElement('div');
        moonContainer.style.position = 'absolute';
        moonContainer.style.width = '0';
        moonContainer.style.height = '0';
        moonContainer.style.left = '50%';
        moonContainer.style.top = '50%';
        
        // Create animation for moon orbit
        const moonAnimationName = `orbit-moon-${index}-${Date.now()}`;
        createMoonOrbitAnimation(moonAnimationName);
        
        moonContainer.style.animation = `${moonAnimationName} ${Math.round(30 / speed)}s linear infinite`;
        
        // Add moon to the container, offset by the orbit distance
        moon.style.transform = `translate(${distance}px, 0)`;
        moonContainer.appendChild(moon);
        
        // Add the container to the planet
        planet.appendChild(moonContainer);
        
        return moon;
    }
    
    function createOrbitAnimation(name, centerX, centerY, radius, size) {
        // Check if animation already exists
        if (document.querySelector(`style[data-animation="${name}"]`)) {
            return;
        }
        
        const style = document.createElement('style');
        style.setAttribute('data-animation', name);
        
        // Calculate offsets to keep the planet centered on its orbit path
        const halfSize = size / 2;
        
        style.textContent = `
            @keyframes ${name} {
                0% {
                    transform: translate(${radius - halfSize}px, ${-halfSize}px) rotate(0deg) translate(-${radius}px, 0);
                }
                100% {
                    transform: translate(${radius - halfSize}px, ${-halfSize}px) rotate(360deg) translate(-${radius}px, 0);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    function createMoonOrbitAnimation(name) {
        // Check if animation already exists
        if (document.querySelector(`style[data-animation="${name}"]`)) {
            return;
        }
        
        const style = document.createElement('style');
        style.setAttribute('data-animation', name);
        
        style.textContent = `
            @keyframes ${name} {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Utility functions
    function getRandomInt(min, max) {
        return Math.floor(prng.random() * (max - min + 1)) + min;
    }
    
    function getRandomItem(array, sourceArray = null) {
        const index = Math.floor(prng.random() * array.length);
        const item = array[index];
        
        // If sourceArray is provided, remove the selected item from it
        if (sourceArray !== null) {
            array.splice(index, 1);
        }
        
        return item;
    }
    
    function getRandomItems(array, count) {
        const items = [];
        const tempArray = [...array]; // Create a copy to avoid modifying the original
        
        for (let i = 0; i < count && tempArray.length > 0; i++) {
            const index = Math.floor(prng.random() * tempArray.length);
            items.push(tempArray[index]);
            tempArray.splice(index, 1);
        }
        
        return items;
    }
    
    function formatNumber(num) {
        if (num === 0) return '0';
        
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + ' billion';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + ' million';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + ' thousand';
        }
        
        return num.toString();
    }
    
    function generateRandomSeed() {
        // Generate a random seed string
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let seed = '';
        for (let i = 0; i < 16; i++) {
            seed += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return seed;
    }
    
    function calculateCurrentCargo() {
        return gameState.inventory.reduce((total, item) => total + item.size, 0);
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function addToEventLog(message) {
        gameState.eventLog.push({
            day: gameState.day,
            message: message
        });
        
        // Limit event log size
        if (gameState.eventLog.length > 100) {
            gameState.eventLog.shift();
        }
    }
});

// Pseudo-Random Number Generator class 
class PseudoRandomNumberGenerator {
    constructor(seed) {
        this.seed = this.hashCode(seed);
    }
    
    // Simple string hash function
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    
    // Xorshift algorithm for pseudo-random number generation
    next() {
        let x = this.seed;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        this.seed = x;
        return (x >>> 0) / 4294967296; // Convert to range [0, 1)
    }
    
    // Alias for next() to match Math.random() interface
    random() {
        return this.next();
    }
}
                