let totalSavedPokemon = 0;
let currentTeam = [];
let pokemonTypes = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy"
];
let type_images = [];
let fetchedPokemonData = [];

const saveButton = document.getElementById("save-team-button");
saveButton.hidden = true;
const saveTeamModal = document.getElementById("save-team-modal");

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json(); // Successfully fetched data
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // If all retries fail, throw the error
        throw error;
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".pokeball").addEventListener("click", async () => {
    if (totalSavedPokemon === 6) {
      alert("You can only save up to 6 Pokémon!");
      return;
    }
    const generation = document.getElementById("generation-dropdown").value;

    // Clear the contents of the cells before making new requests
    for (let i = 1; i <= 3; i++) {
      const cell = document.querySelector(`#choice-${i}`);
      cell.innerHTML = '<span class="placeholder"></span>';
    }

    fetchedPokemonData = []; // Clear previous data

    for (let i = 1; i <= 3; i++) {
      try {
        const data = await fetchWithRetry(
          `http://127.0.0.1:5500/get-random-pokemon?generation=${generation}`,
          3,
          1000
        );

        if (data.error) {
          alert(data.error);
          return;
        }

        // Compute stats with nature factor
        const level = Number(document.getElementById("level-dropdown").value);
        const hp = Math.floor(((data.hp * 2 + data.ivs[0]) * level) / 100 + level + 10);
        let attack = Math.floor(((data.attack * 2 + data.ivs[1]) * level) / 100 + 5);
        let defense = Math.floor(((data.defense * 2 + data.ivs[2]) * level) / 100 + 5);
        let specialAttack = Math.floor(((data["special-attack"] * 2 + data.ivs[3]) * level) / 100 + 5);
        let specialDefense = Math.floor(((data["special-defense"] * 2 + data.ivs[4]) * level) / 100 + 5);
        let speed = Math.floor(((data.speed * 2 + data.ivs[5]) * level) / 100 + 5);
        let upStat = data.nature[1];
        let downStat = data.nature[2];

        if (upStat === "Attack") {
          attack = Math.floor(attack * 1.1);
        } else if (upStat === "Defense") {
          defense = Math.floor(defense * 1.1);
        } else if (upStat === "Sp. Attack") {
          specialAttack = Math.floor(specialAttack * 1.1);
        } else if (upStat === "Sp. Defense") {
          specialDefense = Math.floor(specialDefense * 1.1);
        } else if (upStat === "Speed") {
          speed = Math.floor(speed * 1.1);
        }
        if (downStat === "Attack") {
          attack = Math.floor(attack * 0.9);
        } else if (downStat === "Defense") {
          defense = Math.floor(defense * 0.9);
        } else if (downStat === "Sp. Attack") {
          specialAttack = Math.floor(specialAttack * 0.9);
        } else if (downStat === "Sp. Defense") {
          specialDefense = Math.floor(specialDefense * 0.9);
        } else if (downStat === "Speed") {
          speed = Math.floor(speed * 0.9);
        }

        // Store fetched data with computed stats
        fetchedPokemonData.push({
          ...data,
          level,
          hp,
          attack,
          defense,
          specialAttack,
          specialDefense,
          speed
        });

        // Update the grid cell with new data
        const cell = document.querySelector(`#choice-${i}`);
        cell.innerHTML = `
          <img src="${data.sprite}" alt="${data.name}" style="width: 100%; height: auto;">
          <p class="pokemon-name">#${data.id}<br>${data.name}</p>
        `;
        cell.dataset.index = i - 1; // Store index of the fetched data
        cell.addEventListener("click", showModal);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
        alert("Failed to fetch Pokémon data. Please try again.");
      }
    }
  });

  function displayModal(data, modalBody, showAddToTeamButton = false) {
    type_images = [];
    const { level, hp, attack, defense, specialAttack, specialDefense, speed, type, name, ability, nature, sprite, moves } = data;

    if (type.includes("/")) {
        type_images.push(type.split("/")[0]);
        type_images.push(type.split("/")[1]);
    } else {
        type_images.push(type);
        type_images.push(null);
    }

    upStat = data.nature[1];
    downStat = data.nature[2];

    crySound = new Audio(data.cry);
    crySound.play();

    debugger;

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-content">
                <h1>${name}</h1> 
                <h3>Lvl. ${level}</h3>
                <h3>Type: ${type} </h3>
                <h3>Ability: ${ability}</h3>
                <h3>Nature: ${nature[0]}</h3>
            </div>
            <img src="${sprite}" alt="${name}" id="pokemon-sprite">
            <div class="icon-container">
                <div class="icon ${type_images[0].toLowerCase()}">
                    <img src="icons/${type_images[0].toLowerCase()}.svg/">
                </div>
                ${type_images[1] ? `<div class="icon ${type_images[1].toLowerCase()}"><img src="icons/${type_images[1].toLowerCase()}.svg/"></div>` : ''}
            </div>
        </div>
        <div class="modal-content-body">
            <div class="modal-stats">
                ${createStatBar('HP', hp, upStat, downStat)}
                ${createStatBar('Attack', attack, upStat, downStat)}
                ${createStatBar('Defense', defense, upStat, downStat)}
                ${createStatBar('Sp. Attack', specialAttack, upStat, downStat)}
                ${createStatBar('Sp. Defense', specialDefense, upStat, downStat)}
                ${createStatBar('Speed', speed, upStat, downStat)}
            </div>
            <div id="move-info">
                ${moves.map((move, index) => `
                    <button class="move-button ${move.type.toLowerCase()}-text" data-move-index="${index}">
                        ${move.name.toUpperCase()}
                        <div class="move-icon ${move.type.toLowerCase()}">
                            <img src="icons/${move.type.toLowerCase()}.svg" alt="${move.type}">
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
        ${showAddToTeamButton ? '<div class="modal-footer"><button id="add-to-team">Add to Team</button></div>' : ''}
    `;

    document.querySelectorAll(".move-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const moveIndex = event.currentTarget.dataset.moveIndex;
            const move = moves[moveIndex];
            showMoveModal(event.currentTarget, move);
        });
    });

    if (showAddToTeamButton) {
        document.querySelector("#add-to-team").addEventListener("click", () => {
            let currentBoxNumber = totalSavedPokemon + 1;
            if (currentBoxNumber > 6) {
                alert("You can only save up to 6 Pokémon!");
                return;
            }
            if (currentTeam.some((pokemon) => pokemon.name === data.name)) {
                alert("You already have this Pokémon in your team!");
                return;
            }
            const box = document.querySelector(`#box-${currentBoxNumber}`);
            box.innerHTML = `
                <img src="${sprite}" style="width: 100%; height: auto;">
                <p>${name}</p>
            `;
            alert(data.name + " added to team!");
            const pokemon = {
                name,
                level,
                id: data.id,
                hp,
                type,
                attack,
                defense,
                specialAttack,
                specialDefense,
                speed,
                ivs: data.ivs,
                ability,
                nature: nature,
                sprite,
                moves
            };
            currentTeam.push(pokemon);
            totalSavedPokemon = currentTeam.length;
            if (totalSavedPokemon < 6) {
                saveButton.hidden = true;
            } else {
                saveButton.hidden = false;
            }
            document.getElementById("pokemon-info").style.display = "none";
        });
    }
  }

  function showModal(event) {
    const index = event.currentTarget.dataset.index;
    const data = fetchedPokemonData[index];
    const modal = document.getElementById("pokemon-info");
    const modalBody = document.getElementById("modal-body");
    displayModal(data, modalBody, true);
    modal.style.display = "block";
  }

  function showMoveModal(button, move){
    const moveModal = document.createElement("div");
    moveModal.classList.add("move-modal");
    moveModal.innerHTML = `
      <div class="move-modal-content">
        <h3>${move.name.toUpperCase()}</h3>
        <p>Type: ${move.type}</p>
        <p>PP: ${move.pp}</p>
        <p>Power: ${move.power}</p>
        <p>Accuracy: ${move.accuracy}</p>
        <p>${move.effect_entry}</p>
      </div>
    `;
    document.body.appendChild(moveModal);

    const rect = button.getBoundingClientRect();
    moveModal.style.top = `${rect.top - 225}px`;
    moveModal.style.left = `${rect.right + 10}px`;

    function closeMoveModal() {
      moveModal.remove();
      document.removeEventListener("click", closeMoveModal);
    }

    setTimeout(() => {
      document.addEventListener("click", closeMoveModal);
    }, 0);
  }

  function createStatBar(statName, statValue, natureUp, natureDown) {
    let sign = "";
    let color = "";
    if (natureUp === statName) {
        sign = "+";
        color = "red";
    }
    if (natureDown === statName) {
        sign = "-";
        color = "blue";
    }
    const width = statName === "HP" ? statValue : statValue * 1.5;
    return `
        <div class="stat-container">
            <span class="stat-name">${statName}: <span style="color: ${color};">${statValue} ${sign}</span></span>
            <div class="stat-bar">
                <div class="stat-bar-fill" style="width: ${width}px"></div>
            </div>
        </div>
    `;
  }

  // Close the modal
  document.querySelectorAll(".close").forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      closeButton.closest(".modal").style.display = "none";
    });
  });

  function showSavedPokemonModal(data) {
    const modal = document.getElementById("pokemon-info");
    const modalBody = document.getElementById("modal-body");
    displayModal(data, modalBody, false);
    modal.style.display = "block";
  }

  document.querySelectorAll(".grid-cell").forEach((cell) => {
    cell.addEventListener("click", (event) => {
      const data = currentTeam.find(
        (pokemon) => pokemon.name === event.currentTarget.querySelector("p").textContent
      );
      if (data) {
        showSavedPokemonModal(data);
      }
    });
  });

  document.getElementById("clear-team-button").addEventListener("click", () => {
    for (let i = 1; i <= 6; i++) {
      const box = document.querySelector(`#box-${i}`);
      box.innerHTML = '<span class="placeholder">?</span>';
    }
    currentTeam = [];
    totalSavedPokemon = 0;
    saveButton.hidden = true;
  });

  document.getElementById("save-team-button").addEventListener("click", () => {
    saveTeamModal.style.display = "block";
  });

  document.getElementById("save-team-name-button").addEventListener("click", async () => {
    const teamName = document.getElementById("team-name").value;
    const trainerName = document.getElementById("trainer-name").value;
    if (!teamName) {
        alert("Please enter a team name!");
        return;
    }
    if (!trainerName) {
        alert("Please enter a trainer name!");
        return;
    }
    try {
        const response = await fetch("http://127.0.0.1:5500/save-pokemon", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trainerName: trainerName,
                teamName: teamName,
                team: currentTeam,
            }),
        });
        if (response.ok) {
            alert("Team saved successfully!");
            saveTeamModal.style.display = "none";
        } else {
            alert("Failed to save team. Please try again.");
        }
    } catch (error) {
        console.error("Error saving team:", error);
        alert("Failed to save team. Please try again.");
    }
  });
});