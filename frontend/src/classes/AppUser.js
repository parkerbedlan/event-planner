import { getPHP } from '../phpHelper'
import Event from './Event'

export default class AppUser {
  constructor(
    { emailAddr, firstName, lastName },
    profilePic,
    groupIds,
    adminEvents,
    participantEvents
  ) {
    this.emailAddr = emailAddr
    this.firstName = firstName
    this.lastName = lastName
    this.profilePic = profilePic
    this.groupIds = groupIds
    this.adminEvents = adminEvents
    this.participantEvents = participantEvents
  }

  static async fetch(emailAddr) {
    const userData = await getPHP('getUserData', { emailAddr })
    const profilePic = await getPHP('getProfilePic', { emailAddr }, 'blob')
    const groupIds = await getPHP('getUserGroupIds', { emailAddr })

    const adminEventIds = await getPHP('getUserAdminEventIds', {
      emailAddr,
    })
    const adminEvents = {}
    for (const adminEventId of adminEventIds) {
      adminEvents[adminEventId] = await Event.fetch(adminEventId)
    }

    const participantEventIds = await getPHP('getUserParticipantEventIds', {
      emailAddr,
    })
    const participantEvents = {}
    for (const participantEventId of participantEventIds) {
      participantEvents[
        participantEventId
      ] = await getPHP('getUserEventSessions', { emailAddr })
    }

    return new AppUser(
      userData,
      profilePic,
      groupIds,
      adminEvents,
      participantEvents
    )
  }
}
