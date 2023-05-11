import { snippetsData } from './snippetsData.js';
export { fetchCSVData, getUniqueCategories };
let currentPage = 1; // Define the currentPage variable at the top level of the module scope


// functions.js
export function copyText(event) {
  const copyButton = event.target;
  const codeElement = copyButton.parentNode.querySelector("code");
  const text = codeElement.textContent;
  //clipboard API to save text
  navigator.clipboard.writeText(text);
}

function applyFilterAndPagination(container, snippetDataList, categoryFilterElement, currentPage) {
  const selectedCategories = Array.from(
    document.getElementById("categoryFilter").selectedOptions
  ).map(option => option.value);

  const filteredSnippets = snippetDataList.filter(snippet => {
    const categories = snippet.categories;
    return selectedCategories.every(category => categories.includes(category));
  });

  // Apply pagination
  const itemsPerPage = 10000;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleSnippets = filteredSnippets.slice(startIndex, endIndex);

  createSnippets(container, visibleSnippets, categoryFilterElement, currentPage);
}

export function search() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const titles = document.querySelectorAll(".title");
  let resultsCount = 0;
  titles.forEach((title) => {
    const titleText = title.textContent.toLowerCase();
    const snippetCode = title.nextElementSibling;
    const codeText = snippetCode.querySelector("code").textContent.toLowerCase();
    const matchFound = titleText.includes(searchTerm) || codeText.includes(searchTerm);

    if (matchFound) {
      title.style.display = "";
      snippetCode.style.display = "";
      resultsCount++;
    } else {
      title.style.display = "none";
      snippetCode.style.display = "none";
    }
  });
  currentPage = 1;
  updatePaginationButtons(currentPage);

  // Display the results count if search term is not empty, otherwise reset the results count
  const resultsCountElement = document.getElementById("resultsCount");
  if (searchTerm) {
    resultsCountElement.textContent = `${resultsCount} results found`;
  } else {
    resultsCountElement.textContent = "";
  }
}



const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", search);
searchInput.setAttribute("autocomplete", "off");


// Function to reset the search input and display all snippets

export function resetSearch() {
  document.getElementById("searchInput").value = "";
  search();
  currentPage = 1;
  const resultsCountElement = document.getElementById("resultsCount");
  resultsCountElement.textContent = ""; // Clear the results count
}


// Function to create and append snippets to the container
async function fetchCSVData(file) {
  const response = await fetch(file);
  const data = await response.text();
  const parsedData = data.split('\n').slice(1) 
  .filter(row => !row.startsWith('@') && row.trim() !== ''); 
  const snippetsData = parsedData.map((row) => {
    const [title, code, categories] = row.split(',');
    return { title, code: code.replace(/%nl%/g, '\n'), categories: categories.split(';') };

  });
  return snippetsData;
}

// function to create categories 
function getUniqueCategories(snippetsData) {
  const categoriesCount = {};
  snippetsData.forEach(snippet => {
    if (snippet.categories) {
      snippet.categories.forEach(category => {
        if (categoriesCount.hasOwnProperty(category)) {
          categoriesCount[category]++;
        } else {
          categoriesCount[category] = 1;
        }
      });
    }
  });
  
  const sortedCategories = Object.keys(categoriesCount)
    .filter(category => categoriesCount[category] >= 3)
    .sort();
  
  return sortedCategories;
}



export function filterByCategory() {
  const selectedCategories = Array.from(
    document.getElementById("categoryFilter").selectedOptions
  ).map(option => option.value);

  const titles = document.querySelectorAll(".title");
  titles.forEach((title) => {
    const categories = title.dataset.categories ? title.dataset.categories.split(';') : [];
    const matchFound = selectedCategories.every(category => categories.includes(category));
    const snippetCode = title.nextElementSibling;
    title.style.display = matchFound ? "block" : "none";
    snippetCode.style.display = matchFound ? "block" : "none";
  });
  currentPage = 1;
  updatePaginationButtons(currentPage);
  window.scrollTo(0, 0);

  const resultsCountElement = document.getElementById("resultsCount");
  const visibleTitles = document.querySelectorAll(".title:not([style='display: none;'])");
  const visibleCount = visibleTitles.length;
  resultsCountElement.textContent = `${visibleCount} results found`;

  applyFilterAndPagination(container, snippetsData, categoryFilterElement, currentPage);
}





let allSnippetsData;


export async function createSnippets(container, snippetDataList, categoryFilterElement, currentPage) {
  snippetDataList.sort((a, b) => a.title.localeCompare(b.title));

  const snippetsData = snippetDataList;
  const uniqueCategories = getUniqueCategories(snippetDataList);
 
  uniqueCategories.forEach((category) => {
    if (!categoryFilterElement.querySelector(`[value="${category}"]`)) {
      const categoryCount = snippetsData.filter(snippet => snippet.categories && snippet.categories.includes(category)).length;
      if (categoryCount >= 3) {
        const optionElement = document.createElement('option');
        optionElement.value = category;
        optionElement.textContent = category;
        categoryFilterElement.appendChild(optionElement);
      }
    }
  });
  const sortedCategories = Array.from(uniqueCategories).sort(); // Sort the categories

  uniqueCategories.forEach((category) => {
    if (!categoryFilterElement.querySelector(`[value="${category}"]`)) {
      const optionElement = document.createElement('option');
      optionElement.value = category;
      optionElement.textContent = category;
      categoryFilterElement.appendChild(optionElement);
    }
  });

  container.innerHTML = ""; // Added to clear the container before adding new snippets

  // Get the start and end indices of the snippets for the current page
  const itemsPerPage = 10000;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Display only the snippets for the current page
  const visibleSnippets = snippetsData.slice(startIndex, endIndex);
  visibleSnippets.forEach((snippet) => {
    const snippetDiv = document.createElement('div');
    const categories = snippet.categories ? snippet.categories.join(';') : ''; // Add a check to make sure categories is defined
    snippetDiv.innerHTML = `
      <div>
        <h3 class="title" data-categories="${snippet.categories.join(';')}">${snippet.title}</h3>
        <pre class="snippet-code"><code class="language-javascript">${snippet.code}</code><button class="copyButton">Copy</button></pre>
      </div>
    `;
    container.appendChild(snippetDiv);

    const codeElement = snippetDiv.querySelector("code");
    snippetDiv.querySelector("button.copyButton").addEventListener("click", (event) => copyText(event));
    codeElement.setAttribute('tabindex', '0');
  });

  Prism.highlightAll();

  updatePaginationButtons(); // Added to update the pagination buttons after creating snippets
}

export function goToPreviousPage(currentPage) {
  currentPage--;
  return currentPage;
}

export function goToNextPage(currentPage) {
  currentPage++;
  return currentPage;
}

export function updatePaginationButtons(currentPage) {
  const previousButton = document.getElementById("previousButton");
  const nextButton = document.getElementById("nextButton");
  const maxPages = Math.ceil(snippetsData.length / 3);

  previousButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= maxPages;
}

export function openEncoder() {
  const encoderHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Format Converter</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
          }
          textarea {
              width: 100%;
              height: 150px;
              resize: none;
          }
          button {
              margin: 10px 0;
          }
      </style>
  </head>
  <body>
      <h1>Format Converter</h1>
      <p>Syntax example:<br>
      Using the Object.values method to get an array of object values,<br>
  let person = {firstName: "John", lastName: "Doe", age: 30}; <br>
  let values = Object.values(person); <br>
  console.log(values); // Output: ["John", "Doe", 30],<br>
  JavaScript;Objects;Methods,<br></p>
      <label for="inputFormatA">Input (FORMAT A):</label>
      <textarea id="inputFormatA"></textarea>
      <button onclick="convert()">Convert</button>
      <label for="outputFormatB">Output (FORMAT B):</label>
      <textarea id="outputFormatB" readonly></textarea>
      <label for="notepad">Notepad:</label>
      <textarea id="notepad"></textarea>
  
      <script>
          function encodeFormatAtoB(input) {
              const endsWithComma = input.endsWith(",");
              const normalizedInput = input.replace(/(\r\n|\n|\r)/g, '%nl%');
              const encodedCommas = normalizedInput.replace(/,/g, '&#x2c');
              const encoded = encodedCommas.replace(/&#x2c%nl%/g, ',');
              return endsWithComma ? encoded.slice(0, -5) + ",\n" : encoded;
          }
  
          function convert() {
      const inputFormatA = document.getElementById("inputFormatA");
      const outputFormatB = document.getElementById("outputFormatB");
  
      const encodedText = encodeFormatAtoB(inputFormatA.value);
      outputFormatB.value = encodedText;
  
      const notepad = document.getElementById("notepad");
      notepad.value += encodedText + '\n';
  }
  
      </script>
  </body>
  </html>
  `;
  const encoderWindow = window.open("", "_blank");
  encoderWindow.document.write(encoderHtml);
  encoderWindow.document.close();
}
export function openConsoleEditor() {
  const consoleEditorHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.0/codemirror.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.0/codemirror.min.js" ></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.0/mode/javascript/javascript.min.js" ></script>
  
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple Code Editor and Console</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    #editor {
      width: 100%;
      height: 300px;
      border: 1px solid #ccc;
      padding: 10px;
      box-sizing: border-box;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      overflow-y: auto;
      resize: vertical;
    }
    #console {
      width: 100%;
      height: 200px;
      border: 1px solid #ccc;
      padding: 10px;
      box-sizing: border-box;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      overflow-y: auto;
      background-color: #f8f8f8;
      resize: vertical;
    }
    button {
      margin-top: 10px;
    }
  </style>
  </head>
  <body>
  <h1>Simple Code Editor</h1>
  <div id="editor"></div>
  
  <button id="runButton">Run Code</button>
  <h2>Console</h2>
  <pre id="console"></pre>
  <script>
   const editorElement = document.getElementById('editor');
  const editor = CodeMirror(editorElement, {
    mode: 'javascript',
    lineNumbers: true,
    theme: 'default'});
    const runButton = document.getElementById('runButton');
    const consoleElement = document.getElementById('console');
  
    function clearConsole() {
      consoleElement.textContent = '';
    }
  
    function printToConsole(message) {
      consoleElement.textContent += message + '\n';
    }
  
    const originalConsoleLog = console.log;
    console.log = function(message) {
      originalConsoleLog(message);
      printToConsole(message);
    };
  
    runButton.addEventListener('click', () => {
      clearConsole();
      try {
        const code = editor.getValue();
        const script = document.createElement('script');
        script.textContent = code;
        document.body.appendChild(script);
        document.body.removeChild(script);
      } catch (error) {
        console.log('Error: ' + error);
      }
    });
  </script>
  </body>
  </html>
  `; 
  const consoleEditorWindow = window.open("", "_blank");
  consoleEditorWindow.document.write(consoleEditorHtml);
  consoleEditorWindow.document.close();
}
