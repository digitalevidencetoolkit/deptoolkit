/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
const listenForClicks = () => {
  function reportError(error) {
    console.error(`Could not archive: ${error}`);
  }

  const listDocs = tabs => {
    browser.tabs.sendMessage(tabs[0].id, {
      command: 'list-docs',
    });
  };

  const archiveCurrentTab = tabs => {
    document.getElementById('archive-current-tab').classList.add('selected');
    browser.tabs.captureVisibleTab().then(res => {
      let screenshotData = res;
      browser.tabs.sendMessage(tabs[0].id, {
        command: 'archive-current-tab',
        data: screenshotData,
      });
    });
  };

  document.getElementById('list-docs').addEventListener('click', e => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(listDocs)
      .catch(reportError);
  });
  document
    .getElementById('archive-current-tab')
    .addEventListener('click', e => {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(archiveCurrentTab)
        .catch(reportError);
    });
};

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector('#popup-content').classList.add('hidden');
  document.querySelector('#error-content').classList.remove('hidden');
  console.error(`Failed to execute archiver content script: ${error.message}`);
}

/**
 * HTML element transitions from .selected to .archived
 */
function changeArchiveButtonState(btn) {
  btn.classList.remove('selected');
  btn.classList.add('archived');
  btn.innerHTML = '✅ Archived';
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: '/content_scripts/index.js' })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);

browser.runtime.onMessage.addListener(message => {
  /**
   * On receiving an OK response from the API, change the CSS
   * and content of the button to prevent duplicate archiving.
   * Note: simulate a 400ms job... so it looks like the tool is
   * "doing something"
   */
  if (message.command === 'response-received') {
    if (message.data === 200) {
      setTimeout(() => {
        changeArchiveButtonState(
          document.getElementById('archive-current-tab')
        );
      }, 400);
    }
  }
});
