function listDocuments() {
  fetch('http://localhost:3000/list-docs', {
    method: 'GET',
    headers: {
      'content-type': 'text/json',
    },
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => {
      console.log(err);
    });
}

async function archiveCurrentTab(dataURI) {
  let form = new FormData();
  form.append('url', window.location.href);
  form.append('title', document.title);
  form.append('scr', dataURI);
  const { content, title, filename } = await extension
    .getPageData({
      removeHiddenElements: true,
      removeUnusedStyles: true,
      removeUnusedFonts: true,
      removeImports: true,
      removeScripts: true,
      compressHTML: true,
      removeAudioSrc: true,
      removeVideoSrc: true,
      removeAlternativeFonts: true,
      removeAlternativeMedias: true,
      removeAlternativeImages: true,
      groupDuplicateImages: true,
    })
    .then(d => {
      form.append('onefile', d.content);
      fetch('http://localhost:3000/form', {
        method: 'POST',
        body: form,
      }).then(res =>
        browser.runtime.sendMessage({
          command: 'response-received',
          data: res.status,
        })
      );
    });
  console.log('FORM', [...form]);
}

browser.runtime.onMessage.addListener(message => {
  if (message.command === 'list-docs') {
    listDocuments();
  } else if (message.command === 'archive-current-tab') {
    archiveCurrentTab(message.data);
  }
});
