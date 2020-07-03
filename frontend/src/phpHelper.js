export async function getEventSchedule(
  eventId,
  emailAddr,
  scope = 'entireFuture'
) {
  throw Error('Not yet implemented')
}

export async function getGroupData(groupId) {
  return await getPHP('getGroupData', { groupId: groupId })
}

export async function getGroupLeaderEmails(groupId) {
  return await getPHP('getGroupLeaderEmails', { groupId: groupId })
}

export async function getGroupMemberEmails(groupId) {
  return await getPHP('getGroupMemberEmails', { groupId: groupId })
}

export async function getGroupSessionIds(groupId) {
  return await getPHP('getGroupSessionIds', { groupId: groupId })
}

export async function getSessionData(sessionId) {
  return await getPHP('getSessionData', { sessionId: sessionId })
}

export async function getSessionGroupIds(sessionId) {
  return await getPHP('getSessionGroupIds', { sessionId: sessionId })
}

export async function getEventGroupIds(eventId) {
  return await getPHP('getEventGroupIds', { eventId: eventId })
}

export async function getEventSessionIds(eventId) {
  return await getPHP('getEventSessionIds', { eventId: eventId })
}

export async function getAdmins(eventId) {
  return await getPHP('getAdmins', { eventId: eventId })
}

export async function getParticipants(eventId) {
  return await getPHP('getParticipants', { eventId: eventId })
}

export async function getEventData(eventId) {
  return await getPHP('getEventData', { eventId: eventId })
}

export async function getUserData(emailAddr) {
  return await getPHP('getUserData', { emailAddr: emailAddr })
}

export async function jsonTest(data) {
  return await getPHP('jsonTest', { data: data })
}

export async function signIn(authUser) {
  console.log('Signing in...')
  return await getPHP('signIn', { user: authUser })
}

export async function getAuthUserProfPic(authUser) {
  return await getPHP('getAuthUserProfilePic', { user: authUser }, 'blob')
}

export async function getProfilePic(emailAddr) {
  return await getPHP('getProfilePic', { emailAddr: emailAddr }, 'blob')
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
  const urlCreator = window.URL || window.webkitURL
  const imageUrl = urlCreator.createObjectURL(blob)
  console.log(imageUrl)
  document.querySelector(documentQuery).src = imageUrl
}
