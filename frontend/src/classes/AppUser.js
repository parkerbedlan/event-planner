import { getPHP } from '../phpHelper'
import Event from './Event'
import Session from './Session'

export default class AppUser {
  constructor(
    { emailAddr, firstName, lastName },
    profilePic,
    groupIds,
    adminEvents,
    participantEvents,
    ownedEventIds
  ) {
    this.emailAddr = emailAddr
    this.firstName = firstName
    this.lastName = lastName
    this.profilePic = profilePic
    this.groupIds = groupIds
    this.adminEvents = adminEvents
    this.participantEvents = participantEvents
    this.ownedEventIds = ownedEventIds
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
      const eventData = await getPHP('getEventData', {
        eventId: participantEventId,
      })

      const sessionIds = await getPHP('getUserEventSessions', {
        emailAddr,
        eventId: participantEventId,
      })
      let schedule = []
      for (const sessionId of sessionIds) {
        schedule.push(await Session.fetch(sessionId))
      }

      participantEvents[participantEventId] = {
        id: participantEventId,
        title: eventData.title,
        schedule: schedule,
      }
    }

    const ownedEventIds = await getPHP('getUserOwnerEventIds', {
      emailAddr,
    })

    return new AppUser(
      userData,
      profilePic,
      groupIds,
      adminEvents,
      participantEvents,
      ownedEventIds
    )
  }
}
