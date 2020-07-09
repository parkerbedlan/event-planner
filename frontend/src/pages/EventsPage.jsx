import React, { useState, useEffect, useRef } from 'react'
import {
  Toast,
  Card,
  Modal,
  Button,
  Form as FormBS,
  ListGroup,
  Spinner,
} from 'react-bootstrap'
import styled from 'styled-components'
import Cookies from 'universal-cookie'
import { getPHP, sanitize, isEmail } from '../phpHelper'
import { getAppData } from '../App'
import { Formik, Form } from 'formik'
import { FieldWithError } from '../components/FieldWithError'
import * as yup from 'yup'

const cookies = new Cookies()

const Styles = styled.div`
  .card {
    float: left;
    width: 15rem;
  }
`

export default function EventsPage({ appUser }) {
  cookies.remove('currentEventId')
  const [showParticipantEvents, setShowParticipantEvents] = useState([])

  return (
    <Styles>
      <h1>Admin Events</h1>
      {Object.values(appUser.adminEvents).map(event => {
        return (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => {
              cookies.set('currentEventId', event.id)
              window.location.href = '/sessions'
            }}
            isOwner={appUser.ownedEventIds.includes(event.id)}
          />
        )
      })}
      <CreateEventCard appUserEmail={appUser.emailAddr} />
      <hr />
      <h1>Participant Events</h1>
      {Object.values(appUser.participantEvents).length ? (
        Object.values(appUser.participantEvents).map(event => (
          <React.Fragment key={event.id}>
            <EventCard
              event={event}
              onClick={() => {
                setShowParticipantEvents([...showParticipantEvents, event.id])
              }}
            />
            <ParticipantEventModal
              event={event}
              show={showParticipantEvents.includes(event.id)}
              onHide={() =>
                setShowParticipantEvents(
                  showParticipantEvents.filter(p => p !== event.id)
                )
              }
            />
          </React.Fragment>
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

function ParticipantEventModal({ event, show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <h4>Your Schedule</h4>
      </Modal.Header>
      <div className="m-3">
        <h2>{event.title}</h2>
        {event.schedule.map(session => {
          return (
            <h3>
              {session.startTime} - {session.title}
            </h3>
          )
        })}
      </div>
    </Modal>
  )
}

function EventCard({ event, onClick, isOwner }) {
  const [showRename, setShowRename] = useState(false)
  return (
    <>
      {showRename && (
        <RenameModal event={event} onHide={() => setShowRename(false)} />
      )}

      <Card
        onClick={e => {
          if (e.target.tagName === 'BUTTON') {
            setShowRename(true)
          } else onClick()
        }}
        className="btn btn-outline-dark m-3"
      >
        <Card.Body>
          <Card.Title>{event.title}</Card.Title>
          {isOwner && (
            <Card.Text>
              <Button variant="info" size="sm">
                Rename
              </Button>
            </Card.Text>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

function RenameModal({ event, onHide }) {
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Formik
        validateOnChange={true}
        initialValues={{ title: event.title, shortTitle: event.shortTitle }}
        validationSchema={yup.object({
          title: yup.string().required().max(63),
          shortTitle: yup
            .string()
            .max(24)
            .when('title', {
              is: title => title && title.length > 24,
              then: yup.string().required(),
              otherwise: yup.string(),
            }),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true)
          console.log('submitted', values)
          await getPHP('renameEvent', {
            newTitle: sanitize(values.title),
            newShortTitle: sanitize(values.shortTitle),
            eventId: event.id,
          })
          await getAppData()
          setSubmitting(false)
          onHide()
        }}
      >
        {({ values, isSubmitting }) => {
          return (
            <Form className="m-3">
              <FieldWithError name="title" placeholder="Title" />
              <br />
              <FieldWithError name="shortTitle" placeholder="Shortened Title" />
              {/* <pre>{JSON.stringify(values)}</pre> */}
              <Modal.Footer>
                <Button onClick={onHide} variant="secondary">
                  Cancel
                </Button>
                <Button type="submit">
                  Submit
                  {isSubmitting && (
                    <Spinner animation="border" variant="light" />
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}

function CreateEventCard({ appUserEmail }) {
  const [show, setShow] = useState(false)
  const [title, setTitle] = useState('')
  const [shortTitle, setShortTitle] = useState('')
  const [group, setGroup] = useState('')
  const [groupList, setGroupList] = useState([])
  const [admin, setAdmin] = useState('')
  const [adminList, setAdminList] = useState([])
  const [participant, setParticipant] = useState('')
  const [participantList, setParticipantList] = useState([])
  const [showSpinner, setShowSpinner] = useState(false)
  const titleField = useRef(null)

  useEffect(() => {
    if (show && titleField) titleField.current.focus()
  }, [show, titleField])

  const clearAllFields = () => {
    setTitle('')
    setShortTitle('')
    setGroup('')
    setGroupList([])
    setAdmin('')
    setAdminList([])
    setParticipant('')
    setParticipantList([])
    setShowSpinner(false)
  }

  return (
    <>
      <Card
        onClick={() => setShow(true)}
        style={{ float: 'none' }}
        className="btn btn-outline-secondary m-3"
      >
        <Card.Body>
          <Card.Img src={require('../images/new.png')} />
          <Card.Title>Create New Event</Card.Title>
        </Card.Body>
      </Card>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <h4>Create New Event</h4>
        </Modal.Header>
        <FormBS className="m-3 ">
          <FormBS.Group>
            <FormBS.Label>Event Title</FormBS.Label>
            <FormBS.Control
              ref={titleField}
              value={title}
              onChange={e => {
                setTitle(e.target.value)
              }}
              placeholder="Event Title"
              maxlength="63"
            />
          </FormBS.Group>
          {title.trim().length > 24 && (
            <FormBS.Group>
              <FormBS.Label>Shortened Title</FormBS.Label>
              <FormBS.Control
                value={shortTitle}
                onChange={e => {
                  setShortTitle(e.target.value)
                }}
                isValid={
                  shortTitle.trim().length <= 24 &&
                  shortTitle.trim().length !== 0
                }
                isInvalid={
                  !(
                    shortTitle.trim().length <= 24 &&
                    shortTitle.trim().length !== 0
                  )
                }
                placeholder="Short Title"
                maxlength="24"
              />
              <FormBS.Text className="text-muted">
                <strong>{24 - shortTitle.trim().length}</strong> characters left
              </FormBS.Text>
            </FormBS.Group>
          )}
          <br />
          <FormBS.Group>
            <FormBS.Label>Group Names (optional)</FormBS.Label>
            <FormBS.Control
              value={group}
              onChange={e => setGroup(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  setGroupList([...groupList, group])
                  setGroup('')
                }
              }}
            />
            <FormBS.Text className="text-muted">
              (Press Enter to submit each one)
            </FormBS.Text>
            <br />
            <ListGroup>
              {groupList.map(group => (
                <ListGroup.Item key={group}>
                  <Button
                    onClick={() => {
                      setGroupList(groupList.filter(g => g !== group))
                    }}
                    variant="light"
                    size="sm"
                  >
                    <span role="img" aria-label="X">
                      &#10060;
                    </span>
                  </Button>
                  {group}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </FormBS.Group>
          <FormBS.Group>
            <FormBS.Label>Admin Emails (optional)</FormBS.Label>
            <FormBS.Control
              value={admin}
              onChange={e => setAdmin(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  if (isEmail(admin)) {
                    setAdminList([...adminList, admin])
                    setAdmin('')
                  } else {
                    alert('Must be an email.')
                  }
                }
              }}
            />
            <FormBS.Text className="text-muted">
              (Press Enter to submit each one)
            </FormBS.Text>
            <br />
            <ListGroup>
              {adminList.map(admin => (
                <ListGroup.Item key={admin}>
                  <Button
                    onClick={() => {
                      setAdminList(adminList.filter(a => a !== admin))
                    }}
                    variant="light"
                    size="sm"
                  >
                    <span role="img" aria-label="X">
                      &#10060;
                    </span>
                  </Button>
                  {admin}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </FormBS.Group>

          <FormBS.Group>
            <FormBS.Label>Participant Emails (optional)</FormBS.Label>
            <FormBS.Control
              value={participant}
              onChange={e => setParticipant(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  if (isEmail(participant)) {
                    setParticipantList([...participantList, participant])
                    setParticipant('')
                  } else {
                    alert('Must be an email.')
                  }
                }
              }}
            />
            <FormBS.Text className="text-muted">
              (Press Enter to submit each one)
            </FormBS.Text>
            <br />
            <ListGroup>
              {participantList.map(participant => (
                <ListGroup.Item key={participant}>
                  <Button
                    onClick={() => {
                      setParticipantList(
                        participantList.filter(a => a !== participant)
                      )
                    }}
                    variant="light"
                    size="sm"
                  >
                    <span role="img" aria-label="X">
                      &#10060;
                    </span>
                  </Button>
                  {participant}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </FormBS.Group>
        </FormBS>
        <Modal.Footer>
          <Button
            onClick={() => {
              setShow(false)
              clearAllFields()
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (admin || participant || group) {
                alert("Hit Enter to submit what you've typed!")
              } else if (
                !showSpinner &&
                (shortTitle.trim() || title.trim().length <= 24)
              ) {
                setShowSpinner(true)
                let safeTitle = 'Event Title'
                if (title.trim()) safeTitle = title
                await getPHP('addEvent', {
                  owner: appUserEmail,
                  title: sanitize(safeTitle),
                  shortTitle: shortTitle.trim()
                    ? sanitize(shortTitle)
                    : sanitize(safeTitle),
                  groupList: groupList.map(g => sanitize(g)),
                  adminList,
                  participantList,
                })
                await getAppData()
                setShow(false)
                clearAllFields()
              }
            }}
          >
            Create Event
            {showSpinner && <Spinner animation="border" variant="light" />}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
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
