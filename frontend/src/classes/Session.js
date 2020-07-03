import { getPHP } from '../phpHelper'

export default class Session {
  constructor(
    id,
    eventId,
    title,
    description,
    startTime,
    endTime,
    link,
    location,
    groupIds
  ) {
    this.id = id
    this.eventId = eventId
    this.title = title
    this.description = description
    this.startTime = startTime
    this.endTime = endTime
    this.link = link
    this.location = location
    this.groupIds = groupIds
  }

  static async fetch(sessionId) {
    const sessionData = await getPHP('getSessionData', { sessionId })
    const groupIds = await getPHP('getSessionGroupIds', { sessionId })

    return new Session(
      Number(sessionData.id),
      Number(sessionData.eventId),
      sessionData.title,
      sessionData.description,
      sessionData.startTime,
      sessionData.endTime,
      sessionData.link,
      sessionData.location,
      groupIds
    )
  }
}
