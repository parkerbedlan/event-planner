import React, { useState, useEffect, useRef, useContext } from 'react'
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
import { Formik, Form } from 'formik'
import { FieldWithError } from '../components/FieldWithError'
import * as yup from 'yup'
import { AppUser } from '../App'
import { LoadingScreen } from '../components/LoadingScreen'

const cookies = new Cookies()

const Styles = styled.div`
  .card {
    float: left;
    width: 15rem;
  }
`

export default function EventsPage() {
  const { appUser } = useContext(AppUser)

  const [isLoading, setLoading] = useState(true)
  const [ownedEventIds, setOwnedEventIds] = useState()
  const [participantEvents, setParticipantEvents] = useState()
  useEffect(() => {
    if (!appUser.emailAddr) return
    cookies.remove('currentEventId')
    async function f() {
      setOwnedEventIds(
        await getPHP('getUserOwnerEventIds', { emailAddr: appUser.emailAddr })
      )
      setParticipantEvents(
        await getPHP('getParticipantEventTitles', {
          emailAddr: appUser.emailAddr,
        })
      )
      await setLoading(false)
    }
    f()
  }, [appUser.emailAddr])

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Styles>
      <h1>Admin Events</h1>
      {!!appUser.adminEvents &&
        appUser.adminEvents.map(event => {
          return (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => {
                cookies.set('currentEventId', event.id)
                window.location.href = '/sessions'
              }}
              isOwner={ownedEventIds.includes(Number(event.id))}
            />
          )
        })}
      <CreateEventCard appUserEmail={appUser.emailAddr} />
      <hr />
      <h1>Participant Events</h1>
      {Object.values(participantEvents).length ? (
        participantEvents.map(event => (
          <ParticipantEventCard key={event.id} event={event} />
        ))
      ) : (
        <>
          <br />
          <h3>None</h3>
        </>
      )}
      <NoEventsToast
        adminEvents={appUser.adminEvents}
        participantEvents={participantEvents}
      />
    </Styles>
  )
}

function ParticipantEventCard({ event }) {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <EventCard event={event} onClick={() => setShowModal(true)} />
      <ParticipantEventModal
        event={event}
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </>
  )
}

function ParticipantEventModal({ event, show, onHide }) {
  const {
    appUser: { emailAddr },
  } = useContext(AppUser)
  const [isLoading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState()
  useEffect(() => {
    async function f() {
      setSchedule(
        await getPHP('getUserEventSessions', { emailAddr, eventId: event.id })
      )
      await setLoading(false)
    }
    f()
  }, [emailAddr, event.id])

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <h4>Your Schedule</h4>
      </Modal.Header>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="m-3">
          <h2>{event.title}</h2>
          {schedule.map(session => {
            return (
              <h3 key={session.id}>
                {session.startTime} - {session.title}
              </h3>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

function EventCard({ event, onClick, isOwner }) {
  const [showRename, setShowRename] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      {showRename && (
        <RenameModal event={event} onHide={() => setShowRename(false)} />
      )}

      {!deleting && (
        <Card
          onClick={async e => {
            if (e.target.tagName === 'BUTTON') {
              if (e.target.innerHTML === 'Rename') setShowRename(true)
              else if (
                window.confirm(
                  `Are you sure you want to delete ${event.title}?`
                )
              ) {
                setDeleting(true)
                await getPHP('removeEvent', {
                  eventId: event.id,
                })
                window.location.reload()
              }
            } else onClick()
          }}
          className="btn btn-outline-dark m-3"
        >
          <Card.Body>
            <Card.Title>{event.title}</Card.Title>
            {isOwner && (
              <Card.Text>
                <Card.Link>
                  <Button variant="info" size="sm">
                    Rename
                  </Button>
                </Card.Link>
                <Card.Link>
                  <Button variant="danger" size="sm">
                    Delete
                  </Button>
                </Card.Link>
              </Card.Text>
            )}
          </Card.Body>
        </Card>
      )}
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
              then: yup.string().required().max(24),
              otherwise: yup.string().max(yup.ref('title.length')),
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
          window.location.reload()
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
              maxLength="63"
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
                maxLength="24"
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
                window.location.reload()
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

function NoEventsToast({ adminEvents, participantEvents }) {
  const [showToast, setShowToast] = useState(false)
  useEffect(() => {
    setShowToast(!hasEvent(adminEvents, participantEvents))
  }, [adminEvents, participantEvents])
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

const hasEvent = (adminEvents, participantEvents) => {
  for (const key in adminEvents) return true
  for (const key in participantEvents) return true
  return false
}
