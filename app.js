// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const numberOfCategories = 6;
const numberOfClues = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const response = await axios.get(
    `https://jservice.io/api/categories?count=100`
  );
  const categoryIDs = response.data.map((result) => result.id);
  //   return an array of 6 random categories
  return _.sampleSize(categoryIDs, numberOfCategories);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const response = await axios.get(
    `https://jservice.io/api/category?id=${catId}`
  );

  let allClues = response.data.clues;
  //   randomly selects 5 questions for category
  let randomClues = _.sampleSize(allClues, numberOfClues);
  let clues = randomClues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title: response.data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  // add row for categories and rows for clues
  // append both to table
  $("#board")
    .append($("<thead>").attr("id", "header"))
    .append($("<tbody>").attr("id", "clues"));

  // add header cells for numberOfCategories
  for (let w = 0; w < numberOfCategories; w++) {
    $("thead").append($("<th>").attr("id", w).text(categories[w].title));
  }
  $("#board").append($("thead"));

  // creates main board based on numberOfCategories x numberOfClues
  // adds rows with questions for each category
  for (let p = 0; p < numberOfClues; p++) {
    $("tbody").append($("<tr>").attr("id", `${p}`));
    // creates a td and appends it to the tr above
    // loops until equal to numberOfCategories
    for (let b = 0; b < numberOfCategories; b++) {
      $(`#${p}`).append($("<td>").attr("id", `${b}-${p}`).text("?"));
    }
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(event) {
  let id = event.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];
  let text;

  if (clue.showing === null) {
    text = clue.question;
    clue.showing = "question";
    event.target.style.color = "white";
  } else if (clue.showing === "question") {
    text = clue.answer;
    clue.showing = "answer";
    event.target.style.backgroundColor = "lightskyblue";
    event.target.style.boxShadow = "1px 1px 10px black inset";
    event.target.style.color = "red";
    event.target.style.fontWeight = "bold";
    event.target.style.textShadow = "grey 2px 2px";
  } else {
    // ignore if answer already showing
    return;
  }
  // update cell text
  $(`#${catId}-${clueId}`).text(text);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#spinner").show(2000, hideLoadingView);
  $("#beginGame").hide();
  $("#game").hide();
  $("#board").empty();
  setupAndStart();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#spinner").hide();
  $("#game").show();
  $("#beginGame").show();
  $("#beginGame").text("Begin New Game");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = [];
  let categoryIDs = await getCategoryIds();

  for (let id of categoryIDs) {
    categories.push(await getCategory(id));
  }
  fillTable();
}

/** On click of start / restart button, set up game. */

$("#beginGame").on("click", showLoadingView);

/** On page load, add event handler for clicking clues */

$("#board").on("click", "td", handleClick);
