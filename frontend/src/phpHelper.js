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

// taken from stack overflow https://u.nu/-a6b3
export const resizeImage = settings => {
  var file = settings.file
  var maxSize = settings.maxSize
  var reader = new FileReader()
  var image = new Image()
  var canvas = document.createElement('canvas')
  var dataURItoBlob = function (dataURI) {
    var bytes =
      dataURI.split(',')[0].indexOf('base64') >= 0
        ? atob(dataURI.split(',')[1])
        : unescape(dataURI.split(',')[1])
    var mime = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var max = bytes.length
    var ia = new Uint8Array(max)
    for (var i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i)
    return new Blob([ia], { type: mime })
  }
  var resize = function () {
    var width = image.width
    var height = image.height
    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width
        width = maxSize
      }
    } else {
      if (height > maxSize) {
        width *= maxSize / height
        height = maxSize
      }
    }
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    var dataUrl = canvas.toDataURL('image/jpeg')
    return dataURItoBlob(dataUrl)
  }
  return new Promise(function (ok, no) {
    if (!file.type.match(/image.*/)) {
      no(new Error('Not an image'))
      return
    }
    reader.onload = function (readerEvent) {
      image.onload = function () {
        return ok(resize())
      }
      image.src = readerEvent.target.result
    }
    reader.readAsDataURL(file)
  })
}
