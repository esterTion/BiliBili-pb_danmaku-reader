function headerReceivedFilter(h) {
  for (let i of h.responseHeaders) {
    if (i.name.toLowerCase() == 'content-type') {
      i.value = 'text/html';
      break;
    }
  }
  return {
    responseHeaders: h.responseHeaders
  };
}
browser.webRequest.onHeadersReceived.addListener(headerReceivedFilter, {
  urls: [
    "*://comment.bilibili.com/*.pb"
  ]
}, [
  'blocking',
  'responseHeaders'
]
)