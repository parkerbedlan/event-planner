import { getPHP } from '../phpHelper'

export default class Group {
  constructor(id, eventId, title, leaderEmails, memberEmails, sessionIds) {
    this.id = id
    this.eventId = eventId
    this.title = title
    this.leaderEmails = leaderEmails
    this.memberEmails = memberEmails
    this.sessionIds = sessionIds
  }

  static async fetch(groupId) {
    const groupData = await getPHP('getGroupData', { groupId })
    const leaderEmails = await getPHP('getGroupLeaderEmails', { groupId })
    const memberEmails = await getPHP('getGroupMemberEmails', { groupId })
    const sessionIds = await getPHP('getGroupSessionIds', { groupId })
    return new Group(
      Number(groupData.id),
      groupData.eventId,
      groupData.title,
      leaderEmails,
      memberEmails,
      sessionIds
    )
  }

  getAllUserEmails() {
    return this.leaderEmails.concat(this.memberEmails)
  }
}
