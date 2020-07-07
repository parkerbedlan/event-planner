import React, { useState, useRef, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { Button, Modal, Spinner, Form, Card, Col, Row } from 'react-bootstrap'
import Cookies from 'universal-cookie'
import { AppState, getAppData } from '../App'
import { getPHP, sanitize } from '../phpHelper'

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

  const [showNew, setShowNew] = useState(false)
  // const [showDetails, setShowDetails] = useState({})

  const [showPrevSessions, setShowPrevSessions] = useState(false)

  let date = useRef('')
  let month = useRef('')

  return (
    <Styles>
      {showNew && (
        <NewSessionModal
          setShow={setShowNew}
          event={event}
          appUserEmail={appUser.emailAddr}
        />
      )}

      <h1 className="m-3" style={{ display: 'inline' }}>
        Sessions
      </h1>
      <Button
        onClick={() => setShowNew(true)}
        variant="secondary"
        className="m-3"
      >
        Create New Session
      </Button>
      <Form.Switch
        id="prevSwitch"
        checked={showPrevSessions}
        onChange={e => setShowPrevSessions(e.target.checked)}
        label="Show Previous Sessions"
      />

      {event.sessions.map(session => {
        const showSession =
          showPrevSessions || new Date(session.startTime) >= new Date()

        let monthHeader = getMonth(session.startTime)
        if (month === monthHeader || !showSession) monthHeader = ''
        else month = monthHeader

        let dateHeader = getDate(session.startTime)
        if (date === dateHeader || !showSession) dateHeader = ''
        else date = dateHeader

        return (
          <React.Fragment key={session.id}>
            {Boolean(showSession) && (
              <>
                {Boolean(monthHeader) && (
                  <>
                    <h1>{monthHeader}</h1>
                    <hr />
                  </>
                )}
                {Boolean(dateHeader) && <h2>{dateHeader}</h2>}
                <Card>
                  <Row className="m-0">
                    <Col>
                      <strong>{session.title}</strong>
                      <br />
                      {session.startTime.substring(11, 16) +
                        ' - ' +
                        session.endTime.substring(11, 16)}
                    </Col>
                    <Col>
                      <Button variant="secondary" className="m-2">
                        Details
                      </Button>
                      <Button variant="info" className="m-2">
                        Edit
                      </Button>
                      <Button variant="danger" className="m-2">
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </>
            )}
          </React.Fragment>
        )
      })}
    </Styles>
  )
}

function NewSessionModal({ setShow, event, appUserEmail }) {
  const titleField = useRef(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
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
        <Form.Group>
          <h2>What</h2>
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
        <Form.Group>
          <h2>When</h2>
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
        {hasGroup(event) && (
          <Form.Group>
            <h2>Who</h2>
            <Form.Check
              checked={everyone}
              onChange={() => setEveryone(true)}
              name="everyoneRadio"
              label={<strong>Everyone</strong>}
              type="radio"
            />
            <Form.Check
              checked={!everyone}
              onChange={() => setEveryone(false)}
              name="everyoneRadio"
              label={<strong>Specific Groups...</strong>}
              type="radio"
            />
            {!everyone && (
              <>
                <Form.Check
                  onChange={e => {
                    if (e.target.checked)
                      setGroups(Object.keys(event.groups).map(id => Number(id)))
                    else setGroups([])
                  }}
                  label="Check All Groups"
                  type="checkbox"
                />
                {Object.values(event.groups).map(group => (
                  <Form.Check
                    checked={groups.includes(group.id)}
                    onChange={e => {
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
        )}
        <Form.Group>
          <h2>Where</h2>
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
            } else if (!startDate || !startTime || !endDate || !endTime) {
              alert('Your session needs a time!')
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
                groups: groups,
                everyone,
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

const hasGroup = event => {
  for (const key in event.groups) return true
  return false
}

const getMonth = timestamp =>
  new Date(timestamp).toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
  })
const getDate = timestamp => new Date(timestamp).toDateString().substring(0, 10)

// function DetailsSessionModal({ setShow, session }) {}
// function EditSessionModal({ setShow, session }) {}
// function DeleteSessionModal({ setShow, session }) {}
