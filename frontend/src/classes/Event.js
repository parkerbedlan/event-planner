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

    const adminsData = await getPHP('getAdmins', { eventId })
    const admins = {}
    for (const adminData of adminsData) {
      admins[adminData.emailAddr] = new User(adminData)
    }

    const participantsData = await getPHP('getParticipants', { eventId })
    const participants = {}
    for (const participantData of participantsData) {
      participants[participantData.emailAddr] = new User(participantData)
    }

    const sessionIds = await getPHP('getEventSessionIds', { eventId })
    let sessions = {}
    for (const sessionId of sessionIds) {
      sessions[sessionId] = await Session.fetch(sessionId)
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
