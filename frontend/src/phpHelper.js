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

// for debugging
export async function uploadPicture(picture) {
  let output
  let formData = new FormData()
  formData.append('password', process.env.REACT_APP_PHP_PASSWORD)
  formData.append('method', 'uploadPicture')
  formData.append('profilePicture', picture)
  await fetch('http://localhost/event-planner/backend/requestHandler.php', {
    method: 'POST',
    headers: {},
    body: formData,
  })
    .then(res => res.json())
    .then(response => (output = response))
  return output
}

export async function getPHP(
  methodName,
  options = {},
  responseFormat = 'json',
  requestFormat = 'json'
) {
  let output
  let formData = new FormData()
  formData.append('password', process.env.REACT_APP_PHP_PASSWORD)
  formData.append('method', methodName)
  for (const key in options) {
    if (requestFormat === 'json')
      formData.append(key, JSON.stringify(options[key]))
    else if (requestFormat === 'raw') formData.append(key, options[key])
  }
  // console.log(methodName)
  await fetch('http://localhost/event-planner/backend/requestHandler.php', {
    method: 'POST',
    headers: {},
    body: formData,
  })
    .then(res => {
      if (responseFormat === 'json') return res.json()
      else if (responseFormat === 'blob') return res.blob()
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
  const urlCreator = window.URL || window.webkitURL
  return urlCreator.createObjectURL(blob)
}
