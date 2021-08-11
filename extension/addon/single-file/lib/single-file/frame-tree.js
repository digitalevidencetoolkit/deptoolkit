/* global browser */

browser.runtime.onMessage.addListener((message, sender) => {
  if (
    message.method == 'singlefile.frameTree.initResponse' ||
    message.method == 'singlefile.frameTree.ackInitRequest'
  ) {
    browser.tabs.sendMessage(sender.tab.id, message, { frameId: 0 });
    return Promise.resolve({});
  }
});
