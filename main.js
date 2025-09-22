let currentPokemon = 1;
let searchError = false;
const pokemonCache = {};
const totalPokemon = 1010; // Total number of Pokemon available in PokeAPI

// Loading state management
function showLoading() {
  document.getElementById('pokemonSprite').textContent = '⏳';
  document.getElementById('pokemonName').textContent = 'LOADING...';
  document.getElementById('pokemonNumber').textContent = '#???';

  const infoScreen = document.getElementById('infoScreen');
  infoScreen.innerHTML = `
                <div class="pokemon-stats">
                    <div style="color: #f39c12;"><strong>LOADING</strong></div>
                    <br>
                    <div>Fetching Pokemon data from PokeAPI...</div>
                    <br>
                    <div>Please wait...</div>
                </div>
            `;
}

// Fetch Pokemon data from PokeAPI
async function fetchPokemonData(pokemonId) {
  try {
    // Check cache first
    if (pokemonCache[pokemonId]) {
      return pokemonCache[pokemonId];
    }

    showLoading();

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!response.ok) {
      throw new Error(`Pokemon #${pokemonId} not found`);
    }

    const data = await response.json();

    // Process the data
    const pokemonData = {
      id: data.id,
      name: data.name,
      types: data.types.map(type => type.type.name),
      sprite: data.sprites.front_default,
      hp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
      attack: data.stats.find(stat => stat.stat.name === 'attack').base_stat,
      defense: data.stats.find(stat => stat.stat.name === 'defense').base_stat,
      specialAttack: data.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
      specialDefense: data.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
      speed: data.stats.find(stat => stat.stat.name === 'speed').base_stat,
      height: data.height / 10, // Convert to meters
      weight: data.weight / 10, // Convert to kg
      abilities: data.abilities.map(ability => ability.ability.name),
      // types: data.types.map(type => type.type.name)
    };

    // Cache the data
    pokemonCache[pokemonId] = pokemonData;
    return pokemonData;

  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    throw error;
  }
}

function displayPokemon(pokemonData) {
  // Display sprite image or fallback
  const spriteElement = document.getElementById('pokemonSprite');
  if (pokemonData.sprite) {
    spriteElement.innerHTML = `<img src="${pokemonData.sprite}" alt="${pokemonData.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
  } else {
    spriteElement.textContent = '❓';
  }

  document.getElementById('pokemonName').textContent = pokemonData.name.toUpperCase();
  document.getElementById('pokemonNumber').textContent = `#${String(pokemonData.id).padStart(3, '0')}`;

  const typeString = pokemonData.types.join('/').toUpperCase();
  const abilitiesString = pokemonData.abilities.join(', ').toUpperCase();

  const infoScreen = document.getElementById('infoScreen');
  infoScreen.innerHTML = `
                <div class="pokemon-stats">
                    <div><strong>${pokemonData.name.toUpperCase()}</strong> #${String(pokemonData.id).padStart(3, '0')}</div>
                    <div>Type: ${typeString}</div>
                    <div>Height: ${pokemonData.height}m | Weight: ${pokemonData.weight}kg</div>
                    <br>
                    <div>HP: ${pokemonData.hp}</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min((pokemonData.hp/255)*100, 100)}%"></div></div>

                    <div>Attack: ${pokemonData.attack}</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min((pokemonData.attack/190)*100, 100)}%"></div></div>

                    <div>Defense: ${pokemonData.defense}</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min((pokemonData.defense/230)*100, 100)}%"></div></div>

                    <div>Sp. Atk: ${pokemonData.specialAttack}</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min((pokemonData.specialAttack/194)*100, 100)}%"></div></div>

                    <div>Sp. Def: ${pokemonData.specialDefense}</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min((pokemonData.specialDefense/230)*100, 100)}%"></div></div>

                    <div>Speed: ${pokemonData.speed}</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min((pokemonData.speed/200)*100, 100)}%"></div></div>
                    <br>
                    <div>Abilities: ${abilitiesString}</div>
                    <br>
                    <div style="color: #2ecc71;">Status: Data Complete ✓</div>
                </div>
            `;
}

async function searchPokemon() {
  const input = document.getElementById('searchInput').value.toLowerCase().trim();

  if (!input) {
    searchError = true;
    document.getElementById('btnC').disabled = true; // Disable shiny button
    showError('Please enter a Pokemon name or number');
    return;
  }

  try {
    let pokemonId = input;

    // If input is not a number, use it as name directly
    if (isNaN(input)) {
      pokemonId = input;
    }

    const pokemonData = await fetchPokemonData(pokemonId);
    displayPokemon(pokemonData);
    document.getElementById('btnC').disabled = false; // Enable shiny button
    searchError = false;
    currentPokemon = pokemonData.id;

  } catch (error) {
    showError(`Pokemon "${input}" not found. Try another name or number (1-${totalPokemon})`);
  }
}

function showError(message) {
  document.getElementById('pokemonSprite').textContent = '❌';
  document.getElementById('pokemonName').textContent = 'NOT FOUND';
  document.getElementById('pokemonNumber').textContent = '#???';

  document.getElementById('infoScreen').innerHTML = `
                <div class="pokemon-stats">
                    <div style="color: #e74c3c;"><strong>ERROR</strong></div>
                    <br>
                    <div>${message}</div>
                    <br>
                    <div>Examples:</div>
                    <div>• pikachu</div>
                    <div>• 25</div>
                    <div>• charizard</div>
                    <div>• 150</div>
                    <br>
                    <div>Total Pokemon available: ${totalPokemon}</div>
                </div>
            `;
}

async function navigatePokemon(direction) {
  let newId = currentPokemon + direction;

  // Handle boundaries
  if (newId > totalPokemon) newId = 1;
  if (newId < 1) newId = totalPokemon;

  try {
    const pokemonData = await fetchPokemonData(newId);
    displayPokemon(pokemonData);
    currentPokemon = newId;
  } catch (error) {
    console.error('Error navigating to Pokemon:', error);
    showError(`Could not load Pokemon #${newId}`);
  }
}

async function randomPokemon() {
  const randomId = Math.floor(Math.random() * totalPokemon) + 1;

  try {
    const pokemonData = await fetchPokemonData(randomId);
    displayPokemon(pokemonData);
    currentPokemon = randomId;

    // Add search animation effect
    const sprite = document.getElementById('pokemonSprite');
    sprite.style.animation = 'none';
    document.getElementById('btnC').disabled = false;
    setTimeout(() => {
      sprite.style.animation = 'float 2s ease-in-out infinite';
    }, 100);

  } catch (error) {
    console.error('Error loading random Pokemon:', error);
    showError(`Could not load random Pokemon #${randomId}`);
  }
}

async function shinyPokemon() {
  try {
    // Fetch the current Pokemon's data to get the shiny sprite
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shiny sprite for Pokemon #${currentPokemon}`);
    }

    const data = await response.json();
    const shinySprite = data.sprites.front_shiny;

    // Update the sprite with the shiny version
    const spriteElement = document.getElementById('pokemonSprite');
    if (shinySprite) {
      spriteElement.innerHTML = `<img src="${shinySprite}" alt="${data.name} (Shiny)" style="width: 100%; height: 100%; object-fit: contain;">`;
    } else {
      console.log('No shiny sprite available for this Pokemon');
    }
  } catch (error) {
    console.error('Error loading shiny Pokemon:', error);
  }
}

function addNumber(num) {
  const input = document.getElementById('searchInput');
  input.value += num;
}

function clearInput() {
  document.getElementById('searchInput').value = '';
}

function handleEnter(event) {
  if (event.key === 'Enter') {
    searchPokemon();
  }
}

// Initialize with Pikachu
async function initializePokemon() {
  try {
    const pikachuData = await fetchPokemonData(25);
    displayPokemon(pikachuData);
    currentPokemon = 25;
  } catch (error) {
    console.error('Error initializing Pokemon:', error);
    showError('Failed to load initial Pokemon. Please try refreshing the page.');
  }
}


// Start the app
initializePokemon();
