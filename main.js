// main.js
import {
  search,
  resetSearch,
  createSnippets,
  getUniqueCategories,
  filterByCategory,
} from './functions.js';
import { 
  openEncoder, 
  openConsoleEditor, 
  notesButton, 
  fetchCSVData,
  glossaryButton, 
   
} from './extraFeatures.js';



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
  document.getElementById("generatePDFButton").addEventListener("click", generatePDF);

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


function generatePDF() {
  const pdf = new jsPDF();
  const codeContainer = document.getElementById("code-container");
  const snippets = codeContainer.querySelectorAll(".title, .snippet-code");

  let y = 10; // Start at position 10
  const lineHeight = 7 ; // Line height (convert from points to mm)

  snippets.forEach((snippet) => {
    // Check if the snippet is visible
    if (snippet.offsetParent !== null) {
      // Adjust font size and style based on whether the snippet is a title or code
      if (snippet.classList.contains("title")) {
        pdf.setFontSize(14); // Set the font size to 14 points for titles
        pdf.setFont('helvetica', 'bold'); // Set the font weight to bold for titles
      } else {
        pdf.setFontSize(12); // Set the font size to 12 points for code
        pdf.setFont('helvetica', 'normal'); // Set the font weight to normal for code
      }

      const lines = pdf.splitTextToSize(snippet.textContent, 180); // Split the text into lines
      lines.forEach((line) => {
        // Check if we need to add a new page
        if (y + lineHeight > 297 - 10) { // 297 is the height of an A4 page, 10 is a margin
          pdf.addPage();
          y = 10; // Reset y to the top of the new page
        }
        pdf.text(line, 10, y);
        y += lineHeight;
      });
      y += lineHeight; // Add an extra line height as a gap between snippets
    }
  });

  pdf.save("results.pdf");
}





