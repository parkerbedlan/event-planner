import React from 'react'
import styled from 'styled-components'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

export default function SessionsPage({ appUser }) {
  const currentEventId = cookies.get('currentEventId')
  if (!currentEventId) window.location.href = '../'

  const event = appUser.adminEvents[currentEventId]
  return (
    <Styles>
      <h1>Sessions</h1>
      {Object.values(event.sessions).map(session => (
        <h3 key={session.id}>
          {session.startTime.substring(0, 10) + ' - '}
          <strong>{session.title}</strong>
        </h3>
      ))}
    </Styles>
  )
}
