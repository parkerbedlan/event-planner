export function blobRender(blob, documentQuery) {
  const urlCreator = window.URL || window.webkitURL
  const imageUrl = urlCreator.createObjectURL(blob)
  // console.log(imageUrl)
  document.querySelector(documentQuery).src = imageUrl
}

export async function jsonTest(user) {
  return await getPHP('jsonTest', { user: user })
}

export async function signIn(authUser) {
  return await getPHP('signIn', { user: authUser }, 'blob')
}

export async function getAuthUserProfPic(authUser) {
  return await getPHP('getAuthUserProfilePic', { user: authUser }, 'blob')
}

async function getPHP(methodName, options = {}, format = 'json') {
  let output
  let formData = new FormData()
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
