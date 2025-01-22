let totalSavedPokemon = 0;
let currentTeam = [];
let pokemonTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];
let type_images = [];

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

        // Update the grid cell with new data
        const cell = document.querySelector(`#choice-${i}`);
        cell.innerHTML = `
                    <img src="${data.sprite}" alt="${data.name}" style="width: 100%; height: auto;">
                    <p class="pokemon-name">#${data.id}<br>${data.name}</p>
                `;
        cell.dataset.pokemon = JSON.stringify(data);
        cell.addEventListener("click", showModal);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
        alert("Failed to fetch Pokémon data. Please try again.");
      }
    }
  });

  function showModal(event) {
    type_images = [];
    const data = JSON.parse(event.currentTarget.dataset.pokemon);
    const modal = document.getElementById("pokemon-info");
    const modalBody = document.getElementById("modal-body");
    const pokemonCry = data.cry;
    const level = Number(document.getElementById("level-dropdown").value);
    hp = Math.floor(((data.hp * 2 + data.ivs[0]) * level) / 100 + level + 10);
    attack = Math.floor(
      ((data.attack * 2 + data.ivs[1]) * level) / 100 + 5
    );
    defense = Math.floor(
      ((data.defense * 2 + data.ivs[2]) * level) / 100 + 5
    );
    specialAttack = Math.floor(
      ((data["special-attack"] * 2 + data.ivs[3]) * level) /
        100 +
        5
    );
    specialDefense = Math.floor(
      ((data["special-defense"] * 2 + data.ivs[4]) * level) /
        100 +
        5
    );
    speed = Math.floor(((data.speed * 2 + data.ivs[5]) * level) / 100 + 5);
    type = data.type;
    pokemonName = data.name;
    ability = data.ability;
    nature = data.nature[0];
    sprite = data.sprite;
    moves = data.moves;

    if (type.includes("/")) {
      type_images.push(type.split("/")[0]);
      type_images.push(type.split("/")[1]);
    } else {
      type_images.push(type);
      type_images.push(null);
    }

    if (data.nature[1] === "Attack") {
      attack = Math.floor(attack * 1.1);
    } else if (data.nature[1] === "Defense") {
      defense = Math.floor(defense * 1.1);
    } else if (data.nature[1] === "Sp. Attack") {
      specialAttack = Math.floor(specialAttack * 1.1);
    } else if (data.nature[1] === "Sp. Defense") {
      specialDefense = Math.floor(specialDefense * 1.1);
    } else if (data.nature[1] === "Speed") {
      speed = Math.floor(speed * 1.1);
    }
    if (data.nature[2] === "Attack") {
      attack = Math.floor(attack * 0.9);
    } else if (data.nature[2] === "Defense") {
      defense = Math.floor(defense * 0.9);
    } else if (data.nature[2] === "Sp. Attack") {
      specialAttack = Math.floor(specialAttack * 0.9);
    } else if (data.nature[2] === "Sp. Defense") {
      specialDefense = Math.floor(specialDefense * 0.9);
    } else if (data.nature[2] === "Speed") {
      speed = Math.floor(speed * 0.9);
    }

    crySound = new Audio(pokemonCry);
    crySound.play();

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-header-content">
                <h1>${pokemonName}</h1> 
                <h3>Lvl. ${level}</h3>
                <h3>Type: ${type} </h3>
                <h3>Ability: ${ability}</h3>
                <h3>Nature: ${nature}</h3>
            </div>
            <img src="${sprite}" alt="${pokemonName}" id="pokemon-sprite">
            <div class="icon-container">
                <div class="icon ${type_images[0].toLowerCase()}">
                    <img src="icons/${type_images[0].toLowerCase()}.svg/">
                </div>
                ${type_images[1] ? `<div class="icon ${type_images[1].toLowerCase()}"><img src="icons/${type_images[1].toLowerCase()}.svg/"></div>` : ''}
            </div>
        </div>
        <div class="modal-content-body">
            <div class="modal-stats">
                ${createStatBar('HP', hp, data.nature[1], data.nature[2])}
                ${createStatBar('Attack', attack, data.nature[1], data.nature[2])}
                ${createStatBar('Defense', defense, data.nature[1], data.nature[2])}
                ${createStatBar('Sp. Attack', specialAttack, data.nature[1], data.nature[2])}
                ${createStatBar('Sp. Defense', specialDefense, data.nature[1], data.nature[2])}
                ${createStatBar('Speed', speed, data.nature[1], data.nature[2])}
            </div>
            <div id = "move-info">
              <p class="${moves[0]['type'].toLowerCase()}-text">${moves[0]['name'].toUpperCase()} </p>
              <p class="${moves[1]['type'].toLowerCase()}-text"> ${moves[1]['name'].toUpperCase()} </p>
              <p class="${moves[2]['type'].toLowerCase()}-text"> ${moves[2]['name'].toUpperCase()} </p>
              <p class="${moves[3]['type'].toLowerCase()}-text"> ${moves[3]['name'].toUpperCase()} </p>
            </div>
        </div>
        <div class="modal-footer">
            <button id="add-to-team">Add to Team</button>
        </div>
    `;
    modal.style.display = "block";
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
                <p>${pokemonName}</p>
            `;
      alert(data.name + " added to team!");
      const pokemon = {
        name: pokemonName,
        level: level,
        id: data.id,
        hp: hp,
        type: data.type,
        attack: attack,
        defense: defense,
        specialAttack: specialAttack,
        specialDefense: specialDefense,
        speed: speed,
        ivs: data.ivs,
        ability: data.ability,
        nature: data.nature[0],
        sprite: data.sprite,
        moves: data.moves
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

    function showSavedPokemonModal() {
      const modalBody = document.getElementById("pokemon-info");
      addTeamButton = document.getElementById("add-to-team");
      addTeamButton.style.display = "none";
      crySound.play();
      modalBody.style.display = "block";
    }

    document.querySelectorAll(".grid-cell").forEach((cell) => {
      cell.addEventListener("click", (event) => {
        const data = currentTeam.find(
          (pokemon) =>
            pokemon.name === event.currentTarget.querySelector("p").textContent
        );
        if (data) {
          showSavedPokemonModal();
        }
      });
    });

    document
      .getElementById("clear-team-button")
      .addEventListener("click", () => {
        for (let i = 1; i <= 6; i++) {
          const box = document.querySelector(`#box-${i}`);
          box.innerHTML = '<span class="placeholder">?</span>';
        }
        currentTeam = [];
        totalSavedPokemon = 0;
      });

    document
      .getElementById("save-team-button")
      .addEventListener("click", async () => {
        const saveTeamModal = document.getElementById("save-team-modal");
        saveTeamModal.style.display = "block";
        document
          .getElementById("save-team-name-button")
          .addEventListener("click", async () => {
            debugger;
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
              debugger;
              const response = await fetch(
                "http://127.0.0.1:5500/save-pokemon",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    trainerName: trainerName,
                    teamName: teamName,
                    team: currentTeam
                  }),
                }
              );
              saveTeamModal.style.display = "None";
              alert("Team saved successfully!");
            } catch (error) {
              console.error("Error saving team:", error);
              alert("Failed to save team. Please try again.");
            }
          });
      });
  });
});
