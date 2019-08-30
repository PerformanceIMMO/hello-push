const app = (() => {
  'use strict'

  const fetchEndpoints = document.getElementById('js-endpoints')
  const rootEndpoints = document.getElementById('endpoints')
  const endpointRow = document.getElementById('endpoint_row')
  const notify = document.getElementById('js-notify')
  const payload = document.getElementById('payload')

  const p = new DOMParser()

  function refreshEndpoints() {
    fetch('/endpoints')
      .then(r => r.json())
      .then((endpoints) => {
        while (rootEndpoints.firstChild) rootEndpoints.removeChild(rootEndpoints.firstChild)
        endpoints.forEach(e => {
          const row = endpointRow.firstChild.nodeValue
          const a = row.replace(/%value%/g, encodeURI(JSON.stringify(e)))
          const b = p.parseFromString(a, 'text/html').querySelector('.row')
          const c = document.importNode(b, true)
          rootEndpoints.append(c)
        })
      })
  }

  function notifyThem() {
    const endpoints = Array.from(document.querySelectorAll(':checked')).map(c => JSON.parse(decodeURI(c.value)))
    fetch('/notify', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        endpoints: endpoints,
        payload: payload.value
      }),
    })
  }

  fetchEndpoints.addEventListener('click', refreshEndpoints)
  notify.addEventListener('click', notifyThem)

  refreshEndpoints()
})()