import {
  getGroupData,
  getGroupLeaderEmails,
  getGroupMemberEmails,
  getGroupSessionIds,
} from '../phpHelper'

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
    const groupData = await getGroupData(groupId)
    const leaderEmails = await getGroupLeaderEmails(groupId)
    const memberEmails = await getGroupMemberEmails(groupId)
    const sessionIds = await getGroupSessionIds(groupId)
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
