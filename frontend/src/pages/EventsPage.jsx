import React, { useState } from 'react'
import { Toast, Card } from 'react-bootstrap'
import styled from 'styled-components'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

const Styles = styled.div`
  .card {
    float: left;
    width: 15rem;
  }
`

export default function EventsPage({ appUser }) {
  cookies.remove('currentEventId')

  return (
    <Styles>
      <h1>Admin Events</h1>
      {Object.values(appUser.adminEvents).map(event => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => {
            console.log('clicked')
            cookies.set('currentEventId', event.id)
            window.location.href = '/sessions'
          }}
        />
      ))}
      <Card style={{ float: 'none' }} className="btn btn-outline-secondary m-3">
        <Card.Body>
          <Card.Img src={require('../images/new.png')} />
          <Card.Title>Create New Event</Card.Title>
        </Card.Body>
      </Card>
      <hr />
      <h1>Participant Events</h1>
      {Object.values(appUser.participantEvents).length ? (
        Object.values(appUser.participantEvents).map(event => (
          <EventCard key={event.id} event={event} />
        ))
      ) : (
        <>
          <br />
          <h3>None</h3>
        </>
      )}
      <NoEventsToast appUser={appUser} />
    </Styles>
  )
}

function EventCard({ event, onClick }) {
  return (
    <Card onClick={onClick} className="btn btn-outline-dark m-3">
      <Card.Body
        style={{
          display: 'flex',
          direction: 'column',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Card.Title className="align-middle">{event.title}</Card.Title>
      </Card.Body>
    </Card>
  )
}

function NoEventsToast({ appUser }) {
  const [showToast, setShowToast] = useState(!hasEvent(appUser))
  return (
    <Toast
      show={showToast}
      onClose={() => setShowToast(false)}
      style={{ position: 'absolute', top: '40vh', right: '45vw' }}
    >
      <Toast.Header>
        <img
          src={require('../images/logo.png')}
          className="rounded mr-2"
          width="20"
          height="20"
          alt=""
        />
        <strong className="mr-auto">Events</strong>
      </Toast.Header>
      <Toast.Body>
        You don't have any Events yet.
        <br />
        You should create one!
      </Toast.Body>
    </Toast>
  )
}

const hasEvent = appUser => {
  for (const key in appUser.adminEvents) return true
  for (const key in appUser.participantEvents) return true
  return false
}
