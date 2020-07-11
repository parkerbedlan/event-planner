import React, { useRef, useEffect } from 'react'
import Cookies from 'universal-cookie'
import styled from 'styled-components'

const cookies = new Cookies()

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

export default function ParticipantsPage({ appUser }) {
  const event = useRef(null)
  useEffect(() => {
    const currentEventId = cookies.get('currentEventId')
    if (!currentEventId) window.location.href = '../'
    event.current = appUser.adminEvents[currentEventId]
  }, [appUser.adminEvents])

  return (
    <Styles>
      <h1>Participants</h1>
      {!!event.current &&
        Object.values(appUser.adminEvents[event.current.id].participants).map(
          participant => (
            <h3 key={participant.emailAddr}>
              {participant.emailAddr}
              {participant.firstName
                ? ' - ' + participant.firstName + ' ' + participant.lastName
                : ''}
            </h3>
          )
        )}
    </Styles>
  )
}
