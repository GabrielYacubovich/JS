// main.js
import {
  search,
  resetSearch,
  createSnippets,
  getUniqueCategories,
  filterByCategory,

  
} from './functions.js';
import { openEncoder, openConsoleEditor, notesButton,copyText,fetchCSVData } from './extraFeatures.js';

const container = document.querySelector('#code-container');
// Register event listeners and initialize the page

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("searchInput").addEventListener("click", search);
  document.getElementById("resetButton").addEventListener("click", () => {
    resetSearch();
    createSnippets(container, snippetsData, categoryFilterElement);
    window.scrollTo(0, 0); 
  });
  document.getElementById("resetButtonBottom").addEventListener("click", () => {
    resetSearch();
    createSnippets(container, snippetsData, categoryFilterElement);
    window.scrollTo(0, 0); 
  });
  document.querySelector("button[onclick='openEncoder()']").addEventListener("click", openEncoder);
  document.querySelector("button[onclick='openConsoleEditor()']").addEventListener("click", openConsoleEditor);
  document.querySelector("button.notesButton").addEventListener("click", notesButton);
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
  await createSnippets(container, snippetsData, categoryFilterElement);
});