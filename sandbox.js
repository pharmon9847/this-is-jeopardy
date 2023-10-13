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
const numOfCategories = 6;
const numOfClues = 5;

/** Get NUM_CATEGORIES random category from API. */
async function getCategoryIds() {
  const res = await axios.get(`https://jservice.io/api/categories?count=100`);
  const catIds = res.data.map((result) => result.id);
  return _.sampleSize(catIds, numOfCategories); //Returns an array of 6 randomly picked categories
  //Lodash -Gets n random elements at unique keys from collection up to the size of collection.
}

/** Returns object with data about a category: */
async function getCategory(catId) {
  const res = await axios.get(`https://jservice.io/api/category?id=${catId}`);

  let allClues = res.data.clues;
  let randomClues = _.sampleSize(allClues, numOfClues); //randomly selects 5 questions for category
  let clues = randomClues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title: res.data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  //add header row for categories and rows for clues; append both to table board
  $("#board")
    .append($("<thead>").attr("id", "header"))
    .append($("<tbody>").attr("id", "clues"));

  //add header cells for numOfCategories
  for (let x = 0; x < numOfCategories; x++) {
    $("thead").append($("<th>").attr("id", x).text(categories[x].title));
  }
  $("#board").append($("thead"));

  // creates main board based on set numOfCategories (WIDTH) x numOfClues (HEIGHT)
  // add rows with questions for each category
  for (let y = 0; y < numOfClues; y++) {
    $("tbody").append($("<tr>").attr("id", `${y}`));
    // creates a td and appends it to the tr above, loops until itiration is equal to numOfCategories (width)
    for (let x = 0; x < numOfCategories; x++) {
      $(`#${y}`).append($("<td>").attr("id", `${x}-${y}`).text("?"));
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
function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-"); //turns td id into an array, '-' is the separator
  let clue = categories[catId].clues[clueId];
  let text;

  if (clue.showing === null) {
    text = clue.question;
    clue.showing = "question";
    evt.target.style.color = "white";
  } else if (clue.showing === "question") {
    text = clue.answer;
    clue.showing = "answer";
    evt.target.style.backgroundColor = "#2a3698";
    evt.target.style.boxShadow = "1px 1px 10px rgb(16, 14, 59) inset";
    evt.target.style.color = "red";
  } else {
    //if already showing answer; ignore
    return;
  }
  // Update text of cell
  $(`#${catId}-${clueId}`).text(text);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  $("#loader").show(2000, hideLoadingView);
  $("#startGame").hide();
  $("#game").hide();
  $("#board").empty();
  setupAndStart();
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $("#loader").hide();
  $("#game").show();
  $("#startGame").show();
  $("#startGame").text("Start New Game");
}

// START GAME ON BUTTON CLICK
/**
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  categories = [];
  let catIds = await getCategoryIds();

  for (let id of catIds) {
    categories.push(await getCategory(id)); //push (6) sampleSize into categories array
  }
  fillTable();
}

/** On click of start / restart button, set up game. */
$("#startGame").on("click", showLoadingView);

/** On page load, add event handler for clicking clues */
$("#board").on("click", "td", handleClick);
