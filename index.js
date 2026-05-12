// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2604-SALOME"; // Make sure to change this!
const PLAYERS = "/players";
const TEAMS = "/teams";

const PLAYERS_API = BASE + COHORT + PLAYERS;
const TEAMS_API = BASE + COHORT + TEAMS;

// ==State==

let players = [];
let teams = [];
let selectedPuppyId = null;

// ==state-changing Functions ==

// Create selectPuppyfunction
function selectPuppy(id) {
  selectedPuppyId = id;
  render();
}

//Create getPlayers async function
// //Fetch all players from the players API
// Convert response into JSON
// Save result.data.players into players state
// Call render again
async function getPlayers() {
  try {
    const response = await fetch(PLAYERS_API);
    const result = await response.json();

    players = result.data.players;

    render();
  } catch (error) {
    console.error(error);
  }
}

// Create getTeams async function
// Fetch all teams from the teams API
// Convert response into JSON
// Save result.data.team into teams state
// Call render again
async function getTeams() {
  try {
    const response = await fetch(TEAMS_API);
    const result = await response.json();

    teams = result.data.teams;

    render();
  } catch (error) {
    console.error(error);
  }
}

//Create addPuppy async funtion
// The function should receive a puppy object
// Send a POST request to the players API
// Add header with Content-Type  application/json
// Send puppy object as JSON in the body
// Fetch players again so the screen updates
async function addPuppy(puppy) {
  try {
    await fetch(PLAYERS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(puppy),
    });
    await getPlayers();
  } catch (error) {
    console.error(error);
  }
}

//Create async removePuppy async function
// function should receive a puppy id
// Send DELETE request tot he players API with that id
// Set selectedPuppyId back to null
// Fetch players again so the screen updates

async function removePuppy(id) {
  try {
    await fetch(`${PLAYERS_API}/${id}`, {
      method: "DELETE",
    });

    selectedPuppyId = null;

    await getPlayers();
  } catch (error) {
    console.error(error);
  }
}

//  == Components ==

// Creaet PuppyHeader component
// Create an h1 element
// Add text "Puppy Bowl"
// Return the h1
function PuppyHeader() {
  const $header = document.createElement("div");

  $header.innerHTML = `
    <h1 class="page-title">Puppy Bowl</h1>
  `;

  return $header.firstElementChild;
}

// Create SelectedPuppy component
// Create section element
// Find the selected puppy using selectedPuppyId
// If no puppy is selected:
//   show message: " Click a puppy card to see more details"
//   return the selection
// If puppy is selected:
//  find puppy's team using teamId
// if teams exists, show team name
// Otherwise show "Unassigned"
//

function SelectedPuppy() {
  const $section = document.createElement("section");
  $section.classList.add("selected-puppy");

  const selectedPuppy = players.find((puppy) => puppy.id === selectedPuppyId);

  if (!selectedPuppy) {
    $section.innerHTML = `
        <h2>Selected Puppy</h2>
        <p>Click a puppy card to see more details.</p>
        `;

    return $section;
  }

  const teamName = selectedPuppy.team ? selectedPuppy.team.name : "Unassigned";

  $section.innerHTML = `
    <h2>${selectedPuppy.name}</h2>
    <img src="${selectedPuppy.imageUrl}" alt="${selectedPuppy.name}"/>
    <p><strong>ID:</strong>${selectedPuppy.id}</p>
    <p><strong>Breed:</strong>${selectedPuppy.breed}</p>
    <p><strong>Status:</strong>${selectedPuppy.status}</p>
    <p><strong>Team:</strong>${teamName}</p>
    <button class="remove-button">Remove from roster</button>
    `;

  const $removeButton = $section.querySelector(".remove-button");

  $removeButton.addEventListener("click", () => {
    removePuppy(selectedPuppy.id);
  });

  return $section;
}

// Create PuppyCard component, The function received one puppy
// Create button element add click listener to button

function PuppyCard(puppy) {
  const $button = document.createElement("button");

  $button.classList.add("puppy-card");

  if (puppy.id === selectedPuppyId) {
    $button.classList.add("selected");
  }

  $button.innerHTML = `
      <img src="${puppy.imageUrl}" alt="${puppy.name}" />
      <h2>${puppy.name}</h2>
    `;
  $button.addEventListener("click", () => {
    selectPuppy(puppy.id);
  });

  return $button;
}

// Create function PuppyList Component
// Create function element
// Add class "puppy-grid"
// map over players array
// Turn each puppy cards inside the section
// Return the section

function PuppyList() {
  const $section = document.createElement("section");

  $section.classList.add("puppy-grid");

  const $cards = players.map((puppy) => {
    return PuppyCard(puppy);
  });

  $section.replaceChildren(...$cards);

  return $section;
}

//Create function new puppy form to add new puppy
// create section to hold all puppy cards
// add a class so we can style it as a grid
// loop through every puppy in players
// turn each puppy into puppy card

function NewPuppyForm() {
  const $form = document.createElement("form");
  $form.classList.add("new-puppy-form");

  $form.innerHTML = `
    <h2>Add a Puppy</h2>

    <label>
      Name
      <input name="name" required />
    </label>

    <label>
      Breed
      <input name="breed" required />
    </label>

    <label>
      Image URL
      <input name="imageUrl" />
    </label>

    <label>
      Team
      <select name="teamId">
        <option value="">Unassigned</option>
      </select>
    </label>

    <button>Add puppy</button>
   `;

  const $select = $form.querySelector("select");

  const $teamOptions = teams.map((team) => {
    const $option = document.createElement("option");

    $option.value = team.id;
    $option.textContent = team.name;

    return $option;
  });

  $select.append(...$teamOptions);

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData($form);

    const puppy = {
      name: formData.get("name"),
      breed: formData.get("breed"),
      status: "bench",
      imageUrl: formData.get("imageUrl") || "https://placedog.net/500/500",
      teamId: formData.get("teamId") ? Number(formData.get("teamId")) : null,
    };

    await addPuppy(puppy);
    $form.reset();
  });

  return $form;
}

// == Render Function ==
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `<main>
    <PuppyHeader></PuppyHeader>
    <NewPuppyForm></NewPuppyForm>
    <SelectedPuppy></SelectedPuppy>
    <PuppyList></PuppyList>
</main>
`;

  $app.querySelector("PuppyHeader").replaceWith(PuppyHeader());

  $app.querySelector("NewPuppyForm").replaceWith(NewPuppyForm());

  $app.querySelector("SelectedPuppy").replaceWith(SelectedPuppy());

  $app.querySelector("PuppyList").replaceWith(PuppyList());
}

// == Start App ==

// Call render first
// Call getPlayers
// Call getTeams

render();
getPlayers();
getTeams();
