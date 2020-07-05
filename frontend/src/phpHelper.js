export function isEmail(input) {
  return /^\w+@(\w+[.])+\w+$/.test(input)
}

export function sanitize(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[$]/g, '\\$')
    .trim()
}

export async function signIn(authUser) {
  console.log('Signing in...')
  return await getPHP('signIn', { user: authUser })
}

export async function getPHP(methodName, options = {}, format = 'json') {
  let output
  let formData = new FormData()
  formData.append('password', process.env.REACT_APP_PHP_PASSWORD)
  formData.append('method', methodName)
  for (const key in options) {
    formData.append(key, JSON.stringify(options[key]))
  }
  await fetch('http://localhost/event-planner/backend/requestHandler.php', {
    method: 'POST',
    headers: {},
    body: formData,
  })
    .then(res => {
      if (format === 'json') return res.json()
      else if (format === 'blob') return res.blob()
    })
    .then(response => {
      output = response
    })
  return output
}

export function blobRender(blob, documentQuery) {
  const imageUrl = blobToUrl(blob)
  document.querySelector(documentQuery).src = imageUrl
}

export function blobToUrl(blob) {
  const urlCreator = window.URL // || window.webkitURL
  return urlCreator.createObjectURL(blob)
}
