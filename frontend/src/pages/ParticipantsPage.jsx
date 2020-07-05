import React from 'react'
import Cookies from 'universal-cookie'
import styled from 'styled-components'

const cookies = new Cookies()

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

export default function ParticipantsPage({ appUser }) {
  const currentEventId = cookies.get('currentEventId')
  if (!currentEventId) window.location.href = '../'

  return (
    <Styles>
      <h1>Participants</h1>
      {Object.values(appUser.adminEvents[currentEventId].participants).map(
        participant => (
          <h3 key={participant.emailAddr}>
            {participant.emailAddr}
            {participant.firstName.length !== 0
              ? ' - ' + participant.firstName + ' ' + participant.lastName
              : ''}
          </h3>
        )
      )}
    </Styles>
  )
}
