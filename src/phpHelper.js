export async function jsonTest(data) {
  return await getPHP('jsonTest', { data: data })
}

export async function signIn(authUser) {
  return await getPHP('signIn', { user: authUser })
}

export async function getAuthUserProfPic(authUser) {
  return await getPHP('getAuthUserProfilePic', { user: authUser }, 'blob')
}

export async function getProfilePic(emailAddr) {
  return await getPHP('getProfilePic', { emailAddr: emailAddr }, 'blob')
}

async function getPHP(methodName, options = {}, format = 'json') {
  let output
  let formData = new FormData()
  formData.append('password', process.env.REACT_APP_PHP_PASSWORD)
  formData.append('method', methodName)
  for (const key in options) {
    formData.append(key, JSON.stringify(options[key]))
  }
  await fetch('http://localhost/event_planner_php/requestHandler.php', {
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
  const urlCreator = window.URL || window.webkitURL
  const imageUrl = urlCreator.createObjectURL(blob)
  console.log(imageUrl)
  document.querySelector(documentQuery).src = imageUrl
}
