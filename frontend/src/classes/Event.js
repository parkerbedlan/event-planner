import User from './User'
import Session from './Session'
import Group from './Group'
import {
  getEventData,
  getAdmins,
  getParticipants,
  getEventSessionIds,
  getEventGroupIds,
} from '../phpHelper'

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
    const eventData = await getEventData(eventId)

    const adminsData = await getAdmins(eventId)
    const admins = new Map()
    for (const adminData of adminsData) {
      admins.set(adminData.emailAddr, new User(adminData))
    }

    const participantsData = await getParticipants(eventId)
    const participants = new Map()
    for (const participantData of participantsData) {
      participants.set(participantData.emailAddr, new User(participantData))
    }

    const sessionIds = await getEventSessionIds(eventId)
    let sessions = new Map()
    for (const sessionId of sessionIds) {
      sessions.set(sessionId, await Session.fetch(sessionId))
    }

    const groupIds = await getEventGroupIds(eventId)
    let groups = new Map()
    for (const groupId of groupIds) {
      groups.set(groupId, await Group.fetch(groupId))
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
