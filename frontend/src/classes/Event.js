import User from './User'
import Session from './Session'
import Group from './Group'
import { getPHP } from '../phpHelper'

export default class Event {
  constructor(id, title, shortTitle, admins, participants, sessions, groups) {
    this.id = id
    this.title = title
    this.shortTitle = shortTitle
    this.admins = admins
    this.participants = participants
    this.sessions = sessions
    this.groups = groups
  }

  static async fetch(eventId) {
    const eventData = await getPHP('getEventData', { eventId })

    const adminEmailAddrs = await getPHP('getAdminEmailAddrs', { eventId })
    const admins = {}
    for (const adminEmailAddr of adminEmailAddrs) {
      admins[adminEmailAddr] = await User.fetch(adminEmailAddr)
    }

    const participantEmailAddrs = await getPHP('getParticipantEmailAddrs', {
      eventId,
    })
    const participants = {}
    for (const participantEmailAddr of participantEmailAddrs) {
      participants[participantEmailAddr] = await User.fetch(
        participantEmailAddr
      )
    }

    const sessionIds = await getPHP('getEventSessionIds', { eventId })
    let sessions = []
    for (const sessionId of sessionIds) {
      sessions.push(await Session.fetch(sessionId))
    }

    const groupIds = await getPHP('getEventGroupIds', { eventId })
    let groups = {}
    for (const groupId of groupIds) {
      groups[groupId] = await Group.fetch(groupId)
    }

    return new Event(
      eventId,
      eventData.title,
      eventData.shortTitle,
      admins,
      participants,
      sessions,
      groups
    )
  }

  getAllUsers() {
    return this.admins.concat(this.participants)
  }
}
