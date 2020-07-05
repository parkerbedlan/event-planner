import React from 'react'
import Cookies from 'universal-cookie'
import styled from 'styled-components'

const cookies = new Cookies()

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

export default function AdminsPage({ appUser }) {
  const currentEventId = cookies.get('currentEventId')
  if (!currentEventId) window.location.href = '../'

  return (
    <Styles>
      <h1>Admins</h1>
      {Object.values(appUser.adminEvents[currentEventId].admins).map(admin => (
        <h3 key={admin.emailAddr}>
          {admin.emailAddr}
          {admin.firstName.length !== 0
            ? ' - ' + admin.firstName + ' ' + admin.lastName
            : ''}
        </h3>
      ))}
    </Styles>
  )
}
