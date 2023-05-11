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
  const encoderUrl = './indexEncoder.html';
  window.open(encoderUrl, '_blank');
}

export function openConsoleEditor() {
  const consoleEditorUrl = './indexEditor.html';
  window.open(consoleEditorUrl, '_blank');
}

// Generate a random YouTube video URL with "rubber duck" in its name
function generateRandomVideoURL() {
  const keyword = "rubber duck";
  const apiKey = "AIzaSyBcGpCSq0G8j5pMklyd48Pkr7EAlaRdZ8A";
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(keyword)}&type=video&key=${apiKey}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const videos = data.items;
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const videoId = randomVideo.id.videoId;
      const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
      window.open(videoURL, "_blank");
    })
    .catch(error => {
      console.error("Error fetching YouTube API:", error);
    });
}

// Attach event listener to the button
const randomVideoImage = document.getElementById("randomVideoImage");
randomVideoImage.addEventListener("click", generateRandomVideoURL);

