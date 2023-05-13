// functions.js
copyText

import {copyText } from './extraFeatures.js';
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", search);
searchInput.setAttribute("autocomplete", "off");

let searchTimeout;

export function search() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
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
    // Display the results count if search term is not empty, otherwise reset the results count
    const resultsCountElement = document.getElementById("resultsCount");
    if (searchTerm) {
      resultsCountElement.textContent = `${resultsCount} results found`;
    } else {
      resultsCountElement.textContent = "";
    }
  }, 200); // Debounce time in milliseconds
}


export function resetSearch() {
  document.getElementById("searchInput").value = "";
  search();
  const resultsCountElement = document.getElementById("resultsCount");
  resultsCountElement.textContent = ""; // Clear the results count
}


export function getUniqueCategories(snippetsData) {
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
  window.scrollTo(0, 0);
  const resultsCountElement = document.getElementById("resultsCount");
  const visibleTitles = document.querySelectorAll(".title:not([style='display: none;'])");
  const visibleCount = visibleTitles.length;
  resultsCountElement.textContent = `${visibleCount} results found`;

}
export async function createSnippets(container, snippetDataList, categoryFilterElement) {
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

  uniqueCategories.forEach((category) => {
    if (!categoryFilterElement.querySelector(`[value="${category}"]`)) {
      const optionElement = document.createElement('option');
      optionElement.value = category;
      optionElement.textContent = category;
      categoryFilterElement.appendChild(optionElement);
    }
  });
  container.innerHTML = ""; // Added to clear the container before adding new snippets
  // Display only the snippets for the current page
  const visibleSnippets = snippetsData.slice();
  visibleSnippets.forEach((snippet) => {
    const snippetDiv = document.createElement('div');
    snippetDiv.innerHTML = ` 
    <div>
    <h3 class="title" data-categories="${snippet.categories.join(';')}">${snippet.title}</h3>
    <pre class="snippet-code">
        <div style= "width: 100%; background-color:#f5f2f0; padding:10px 10px 1px 10px; border-radius:10px"><code class="language-javascript">${snippet.code}</code>
        <button class="copyButton">Copy</button><a class="glossaryLink" href="./indexGlossary.html#${snippet.title.replace(/\s+/g, '_').toLowerCase()}" target="_blank">Learn more...</a>
        </div>
    </pre>  
</div>

    `;
  
    container.appendChild(snippetDiv);
    const codeElement = snippetDiv.querySelector("code");
    snippetDiv.querySelector("button.copyButton").addEventListener("click", (event) => copyText(event));
    codeElement.setAttribute('tabindex', '0');
  });
  Prism.highlightAll();
}