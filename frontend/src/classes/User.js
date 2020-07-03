import { getPHP } from '../phpHelper'

export default class User {
  constructor({ emailAddr, firstName, lastName }, profilePic = null) {
    this.emailAddr = emailAddr
    this.firstName = firstName
    this.lastName = lastName
    this.profilePic = profilePic
  }

  static async fetch(emailAddr) {
    const userData = await getPHP('getUserData', { emailAddr })
    return new User(userData)
  }

  async getProfilePic() {
    if (!this.profilePic) await this.updateProfilePic()
    return this.profilePic
  }

  async updateProfilePic() {
    this.profilePic = await getPHP(
      'getProfilePic',
      { emailAddr: this.emailAddr },
      'blob'
    )
  }

  sayHi() {
    console.log(this.firstName + ' says hi')
  }
}
