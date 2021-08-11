/* global browser, setTimeout, clearTimeout */

const timeouts = new Map();

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.method == 'singlefile.lazyTimeout.setTimeout') {
    let tabTimeouts = timeouts.get(sender.tab.id);
    let frameTimeouts;
    if (tabTimeouts) {
      frameTimeouts = tabTimeouts.get(sender.frameId);
      if (frameTimeouts) {
        const previousTimeoutId = frameTimeouts.get(message.type);
        if (previousTimeoutId) {
          clearTimeout(previousTimeoutId);
        }
      } else {
        frameTimeouts = new Map();
      }
    }
    const timeoutId = setTimeout(async () => {
      try {
        const tabTimeouts = timeouts.get(sender.tab.id);
        const frameTimeouts = tabTimeouts.get(sender.frameId);
        if (tabTimeouts && frameTimeouts) {
          deleteTimeout(frameTimeouts, message.type);
        }
        await browser.tabs.sendMessage(sender.tab.id, {
          method: 'singlefile.lazyTimeout.onTimeout',
          type: message.type,
        });
      } catch (error) {
        // ignored
      }
    }, message.delay);
    if (!tabTimeouts) {
      tabTimeouts = new Map();
      frameTimeouts = new Map();
      tabTimeouts.set(sender.frameId, frameTimeouts);
      timeouts.set(sender.tab.id, tabTimeouts);
    }
    frameTimeouts.set(message.type, timeoutId);
    return Promise.resolve({});
  }
  if (message.method == 'singlefile.lazyTimeout.clearTimeout') {
    let tabTimeouts = timeouts.get(sender.tab.id);
    if (tabTimeouts) {
      const frameTimeouts = tabTimeouts.get(sender.frameId);
      if (frameTimeouts) {
        const timeoutId = frameTimeouts.get(message.type);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        deleteTimeout(frameTimeouts, message.type);
      }
    }
    return Promise.resolve({});
  }
});

browser.tabs.onRemoved.addListener(tabId => timeouts.delete(tabId));

function deleteTimeout(framesTimeouts, type) {
  framesTimeouts.delete(type);
}
