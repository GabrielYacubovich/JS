// main.js
import {
  copyText,
  search,
  resetSearch,
  createSnippets,
  fetchCSVData,
  getUniqueCategories,
  filterByCategory,
  goToPreviousPage,
  goToNextPage,
  updatePaginationButtons,
  openEncoder,
  openConsoleEditor,

} from './functions.js';
let currentPage = 1


const container = document.querySelector('#code-container');

// Register event listeners and initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("searchInput").addEventListener("click", search);
  document.getElementById("resetButton").addEventListener("click", () => {
    resetSearch();
    currentPage = 1;
    updatePaginationButtons(currentPage);
    createSnippets(container, snippetsData, categoryFilterElement, currentPage);
  });
  document.getElementById("resetButtonBottom").addEventListener("click", () => {
    resetSearch();
    currentPage = 1;
    updatePaginationButtons(currentPage);
    createSnippets(container, snippetsData, categoryFilterElement, currentPage);
    window.scrollTo(0, 0); 
    
  });
  document.getElementById("previousButton").addEventListener("click", () => {
    currentPage = goToPreviousPage(currentPage);
    updatePaginationButtons(currentPage);
    createSnippets(container, snippetsData, categoryFilterElement, currentPage);
  });
  document.querySelector("button[onclick='openEncoder()']").addEventListener("click", openEncoder);
  document.querySelector("button[onclick='openConsoleEditor()']").addEventListener("click", openConsoleEditor);

  document.getElementById("nextButton").addEventListener("click", () => {
    currentPage = goToNextPage(currentPage);
    updatePaginationButtons(currentPage);
    createSnippets(container, snippetsData, categoryFilterElement, currentPage);
  });

  updatePaginationButtons();
  const categoryFilterElement = document.querySelector('#categoryFilter');
  const snippetsData = await fetchCSVData('snippets.csv');
  const uniqueCategories = getUniqueCategories(snippetsData);
  uniqueCategories.forEach(category => {
    if (!categoryFilterElement.querySelector(`[value="${category}"]`)) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilterElement.appendChild(option);
    }
  });

  // Register filter event listener
  categoryFilterElement.addEventListener("change", filterByCategory);

  // Pass snippetsData to createSnippets() function
  await createSnippets(container, snippetsData, categoryFilterElement, currentPage);

});

