export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function loadpageSection(key, partialFilePath) {
  let domSelector = null;
  let path = "";
  if (key === 1) {
    domSelector = document.querySelector(".footerForPage");
    path = `${partialFilePath}/footer.html`;
  } else if (key === 0) {
    domSelector = document.querySelector(".headerForPage");
    path = `${partialFilePath}/header.html`;
  } else {
    console.error("No page section to load for key: ", key);
    return Promise.resolve();
  }
  if (!domSelector) {
    console.error(`DOM selector for key ${key} not found.`);
    return Promise.resolve();
  }
  return renderPage(domSelector, path);
}

async function renderPage(domSelector, path) {
  try {
    const htmlContent = await getHtmlContent(path);
    if (htmlContent) {
      domSelector.innerHTML = htmlContent;
    } else {
      console.error(`No content loaded for path: ${path}`);
      domSelector.innerHTML = "<p>Error loading content</p>";
    }
  } catch (error) {
    console.error(`Error rendering page section for path: ${path}`, error);
    domSelector.innerHTML = "<p>Error loading content</p>";
  }
}

async function getHtmlContent(path) {
  try {
    const fileResponse = await fetch(path);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch path: ${path}, Status: ${fileResponse.status}`);
    }
    const content = await fileResponse.text();
    return content;
  } catch (error) {
    console.error("Error fetching content: ", path, error);
    return null;
  }
}