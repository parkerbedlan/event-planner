import React, { useState, useRef, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { Button, Modal, Spinner, Form } from 'react-bootstrap'
import Cookies from 'universal-cookie'
import { AppState, getAppData } from '../App'
import { getPHP, sanitize } from '../phpHelper'

const cookies = new Cookies()

const Styles = styled.div`
  * {
    margin-top: 1em;
  }

  h1 {
    display: inline;
  }
`

export default function SessionsPage({ appUser }) {
  const currentEventId = cookies.get('currentEventId')
  if (!currentEventId) window.location.href = '../'
  const event = appUser.adminEvents[currentEventId]

  const [showNew, setShowNew] = useState(false)
  // const [showDetails, setShowDetails] = useState({})

  return (
    <Styles>
      {showNew && (
        <NewSessionModal
          setShow={setShowNew}
          event={event}
          appUserEmail={appUser.emailAddr}
        />
      )}

      <h1 className="m-3">Sessions</h1>
      <Button
        onClick={() => setShowNew(true)}
        variant="secondary"
        className="m-3"
      >
        Create New Session
      </Button>
      {Object.values(event.sessions).map(session => (
        <h3 key={session.id}>
          {session.startTime.substring(0, 10) + ' - '}
          <strong>{session.title}</strong>
        </h3>
      ))}
    </Styles>
  )
}

function NewSessionModal({ setShow, event, appUserEmail }) {
  const titleField = useRef(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [everyone, setEveryone] = useState(true)
  const [groups, setGroups] = useState([])
  const [link, setLink] = useState('')
  const [location, setLocation] = useState('')

  const { setState } = useContext(AppState)

  useEffect(() => {
    if (titleField) titleField.current.focus()
  }, [titleField])

  return (
    <Modal
      show={true}
      onHide={() => setShow(false)}
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton>
        <h4>Create New Session</h4>
      </Modal.Header>
      <Form className="m-3">
        <h2>What</h2>
        <Form.Group>
          <Form.Control
            ref={titleField}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Session Title"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description (optional)"
            as="textarea"
          />
        </Form.Group>
        <h2>When</h2>
        <Form.Group>
          <Form.Label className="mr-2">Start Time</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value)
              setEndDate(e.target.value)
            }}
            style={{ display: 'inline', width: '15rem' }}
          />
          <Form.Control
            type="time"
            value={startTime}
            onChange={e => {
              setStartTime(e.target.value)
              const [hr, min] = e.target.value.split(':')
              setEndTime(((Number(hr) + 1) % 24) + ':' + min)
            }}
            style={{ display: 'inline', width: '15rem' }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="mr-2">End Time</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ display: 'inline', width: '15rem' }}
          />
          <Form.Control
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={{ display: 'inline', width: '15rem' }}
          />
        </Form.Group>
        <h2>Who</h2>
        <Form.Group>
          <Form.Check
            checked={everyone}
            onClick={() => setEveryone(true)}
            name="everyoneRadio"
            label={<strong>Everyone</strong>}
            type="radio"
          />
          <Form.Check
            checked={!everyone}
            onClick={() => setEveryone(false)}
            name="everyoneRadio"
            label={<strong>Specific Groups...</strong>}
            type="radio"
          />
          {!everyone && (
            <>
              <Form.Check label="Check All Groups" type="checkbox" />
              {Object.values(event.groups).map(group => (
                <Form.Check
                  checked={groups.includes(group.id)}
                  onClick={e => {
                    if (e.target.checked) setGroups([...groups, group.id])
                    else setGroups(groups.filter(g => g !== group.id))
                  }}
                  key={group.id}
                  label={group.title}
                  type="checkbox"
                />
              ))}
            </>
          )}
        </Form.Group>
        <h2>Where</h2>
        <Form.Group>
          <Form.Control
            value={link}
            onChange={e => setLink(e.target.value)}
            type="url"
            placeholder="Invite Link (optional)"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Physical Location (optional)"
          />
        </Form.Group>
      </Form>
      <Modal.Footer>
        <Button onClick={() => setShow(false)} variant="secondary">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (!title.trim().length) {
              alert('Your session needs a title!')
            } else if (
              new Date(`${startDate} ${startTime}`) -
                new Date(`${endDate} ${endTime}`) >
              0
            ) {
              alert(
                "Your session's End Time needs to come after your Start Time!"
              )
            } else if (!everyone && !groups.length) {
              alert('Check who you want to attend the event!')
            } else if (!showSpinner) {
              setShowSpinner(true)
              await getPHP('addSession', {
                eventId: event.id,
                title: sanitize(title),
                desc: sanitize(desc),
                startTime: `${startDate} ${startTime}`,
                endTime: `${endDate} ${endTime}`,
                link: sanitize(link),
                location: sanitize(location),
                groups: everyone
                  ? Object.values(event.groups).map(g => g.id)
                  : groups,
              })
              await getAppData(appUserEmail, setState)
              setShow(false)
            }
          }}
        >
          Create Session
          {showSpinner && <Spinner animation="border" variant="light" />}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// function DetailsSessionModal({ setShow, session }) {}
// function EditSessionModal({ setShow, session }) {}
// function DeleteSessionModal({ setShow, session }) {}
