


//Copy button
export function copyText(event) {
  const copyButton = event.target;
  const codeElement = copyButton.parentNode.querySelector("code");
  const text = codeElement.textContent;
  //clipboard API to save text
  navigator.clipboard.writeText(text);
}

//External features
export function openEncoder() {
  const encoderUrl = './indexEncoder.html';
  window.open(encoderUrl, '_blank');
}

export function openConsoleEditor() {
  const consoleEditorUrl = './indexEditor.html';
  window.open(consoleEditorUrl, '_blank');
}

export function notesButton() {
  const notesUrl = './indexNotes.html';
  window.open(notesUrl, '_blank');
}

// Fetch data from CSV
export async function fetchCSVData(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error("Failed to fetch CSV data");
    }
    const data = await response.text();
    const parsedData = data.split('\n').slice(1)
      .filter(row => !row.startsWith('@') && row.trim() !== '');
    const snippetsData = parsedData.map((row) => {
      const [title, code, categories] = row.split(',');
      return { title, code: code.replace(/%nl%/g, '\n'), categories: categories.split(';') };
    });
    return snippetsData;
  } catch (error) {
    console.error(error);
    // Handle the error (e.g., show an error message to the user)
    return []; // Return an empty array or a default value if desired
  }
}


 