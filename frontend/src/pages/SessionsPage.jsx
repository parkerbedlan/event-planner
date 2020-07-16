import React, { useState, useRef, useEffect, useContext } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Spinner from 'react-bootstrap/Spinner'
import FormBS from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Alert from 'react-bootstrap/Alert'
import { Formik, Field, Form } from 'formik'
import Cookies from 'universal-cookie'
import { getPHP, sanitize } from '../phpHelper'
import FieldWithError from '../components/FieldWithError'
import { AppUser } from '../App'
import LoadingScreen from '../components/LoadingScreen'

const cookies = new Cookies()

export default function SessionsPage() {
  const {
    appUser: { emailAddr },
  } = useContext(AppUser)

  const [isLoading, setLoading] = useState(true)
  const [event, setEvent] = useState([])
  useEffect(() => {
    if (!emailAddr) return
    async function f() {
      const currentEventId = cookies.get('currentEventId')
      if (!currentEventId) window.location.href = '../'

      const sessions = await getPHP('getEventSessions', {
        eventId: currentEventId,
      })
      const eventRequest = await getPHP('getEventGroupsWithSize', {
        eventId: +currentEventId,
      })
      setEvent({ ...eventRequest, sessions })
      setLoading(false)

      const sessionsDetails = await getPHP('getEventSessionsDetails', {
        eventId: currentEventId,
      })
      setEvent(e => ({
        ...e,
        sessions: sessions.map((session, i) => ({
          ...session,
          ...sessionsDetails[i],
        })),
      }))
      const sessionsGroupIds = await Promise.all(
        sessions.map(
          async ({ id }) =>
            await getPHP('getSessionGroupIds', { sessionId: id })
        )
      )
      setEvent(e => ({
        ...e,
        sessions: e.sessions.map((session, i) => ({
          ...session,
          groupIds: sessionsGroupIds[i],
        })),
      }))
    }
    f()
  }, [emailAddr])

  const [showNew, setShowNew] = useState(false)
  const [showPrevSessions, setShowPrevSessions] = useState(false)

  const month = useRef(null)
  const date = useRef(null)

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <>
      <h1 className="m-3 d-inline">Sessions</h1>
      <Button
        onClick={() => setShowNew(true)}
        variant="secondary"
        className="m-3"
      >
        Create New Session
      </Button>
      <FormBS.Switch
        id="prevSwitch"
        checked={showPrevSessions}
        onChange={e => setShowPrevSessions(e.target.checked)}
        label="Show Previous Sessions"
      />

      {event.sessions.map((session, i, { length }) => {
        const showSession =
          showPrevSessions || new Date(session.startTime) >= new Date()

        let monthHeader = getMonth(session.startTime)
        if (month.current === monthHeader || !showSession) monthHeader = ''
        else month.current = monthHeader

        let dateHeader = getDate(session.startTime)
        if (date.current === dateHeader || !showSession) dateHeader = ''
        else date.current = dateHeader

        if (i === length - 1) {
          date.current = null
          month.current = null
        }

        return (
          <React.Fragment key={session.id}>
            {!!showSession && (
              <>
                {!!monthHeader && (
                  <>
                    <h1 className="mt-5">{monthHeader}</h1>
                    <hr />
                  </>
                )}
                {!!dateHeader && <h2 className="mt-3">{dateHeader}</h2>}

                <SessionCard session={session} event={event} isAdmin={true} />
              </>
            )}
          </React.Fragment>
        )
      })}
      <EditSessionModal
        newSession
        show={showNew}
        onHide={() => setShowNew(false)}
        event={event}
      />
    </>
  )
}

export function SessionCard({ session, event, isAdmin }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      {!deleting && (
        <Card className="mt-3">
          <Row>
            <div className="my-auto ml-4 mr-auto">
              <strong>{session.title}</strong>
              <br />
              {isAdmin
                ? session.startTime.substring(11, 16) +
                  ' - ' +
                  session.endTime.substring(11, 16)
                : new Date(session.startTime).toLocaleString() +
                  ' - ' +
                  new Date(session.endTime).toLocaleTimeString()}
            </div>
            <div className="my-auto mr-4 ml-auto">
              <Button
                onClick={() => setShowDetails(true)}
                variant="secondary"
                className="m-2"
              >
                Details
              </Button>
              {isAdmin && (
                <>
                  <Button
                    onClick={() => setShowEdit(true)}
                    variant="info"
                    className="m-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${session.title}?`
                        )
                      ) {
                        setDeleting(true)
                        await getPHP('removeSession', {
                          sessionId: session.id,
                        })
                        window.location.reload()
                      }
                    }}
                    variant="danger"
                    className="m-2"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </Row>
        </Card>
      )}

      <DetailsSessionModal
        show={showDetails}
        session={session}
        event={event}
        onHide={() => setShowDetails(false)}
      />

      <EditSessionModal
        show={showEdit}
        session={session}
        event={event}
        onHide={() => setShowEdit(false)}
      />
    </>
  )
}

function DetailsSessionModal({ show, onHide, session, event }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <h4>{session.title}</h4>
      </Modal.Header>
      <div className="m-3">
        <p>
          <strong>Title: </strong>
          {session.title}
        </p>
        <p>
          <strong>Description: </strong>
          {session.description ||
            (session.description === undefined ? 'Loading...' : '[None]')}
        </p>
        <p>
          <strong>Start Time: </strong>
          {getString(session.startTime)}
        </p>
        <p>
          <strong>End Time: </strong>
          {getString(session.endTime)}
        </p>
        <p>
          <strong>Link: </strong>
          {session.link ||
            (session.link === undefined ? 'Loading...' : '[None]')}
        </p>
        <p>
          <strong>Location: </strong>
          {session.location ||
            (session.location === undefined ? 'Loading...' : '[None]')}
        </p>
        {session.groupIds === undefined ? (
          'Loading...'
        ) : (
          <>
            <p>
              <strong>Attendees: </strong>
              {!!('' + session.everyone)
                ? 'Everyone'
                : session.groupIds
                    .map(
                      groupId =>
                        event.groups.find(({ id }) => id === groupId).title
                    )
                    .join(', ')}
            </p>
            <p>
              <strong>Number of Attendees: </strong>
              {!!('' + session.everyone)
                ? event.size
                : session.groupIds.reduce(
                    (a, b) => a + event.groups.find(({ id }) => id === b).size,
                    0
                  )}
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}

function EditSessionModal({ show, onHide, session, event, newSession }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <h4>
          {newSession ? 'Create New Session' : `Edit Session: ${session.title}`}
        </h4>
      </Modal.Header>
      {session && session.groupIds === undefined ? (
        <LoadingScreen />
      ) : (
        <Formik
          validateOnChange={true}
          initialValues={
            newSession
              ? {
                  title: '',
                  description: '',
                  startDate: '',
                  startTime: '08:00:00',
                  endDate: '',
                  endTime: '09:00:00',
                  everyone: 'true',
                  groups: [],
                  link: '',
                  location: '',
                }
              : {
                  title: session.title,
                  description: session.description,
                  startDate: session.startTime.substring(0, 10),
                  startTime: session.startTime.substring(11, 16),
                  endDate: session.endTime.substring(0, 10),
                  endTime: session.endTime.substring(11, 16),
                  everyone: '' + session.everyone,
                  groups: session.groupIds.map(id => '' + id),
                  link: session.link,
                  location: session.location,
                }
          }
          validate={values => {
            const errors = {}

            if (!values.title.trim().length) errors.title = 'Title required.'
            if (
              !values.startDate ||
              !values.startTime ||
              !values.endDate ||
              !values.endTime
            )
              errors.time = 'All time fields required.'
            if (
              new Date(`${values.startDate} ${values.startTime}`) -
                new Date(`${values.endDate} ${values.endTime}`) >
              0
            )
              errors.time =
                "Your session's End Time needs to come after your Start Time."
            if (!values.everyone && !values.groups.length)
              errors.groups = 'Check who you want to attend the event.'

            return errors
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true)
            if (newSession) {
              await getPHP('addSession', {
                eventId: event.id,
                title: sanitize(values.title),
                description: sanitize(values.description),
                startTime: `${values.startDate} ${values.startTime}`,
                endTime: `${values.endDate} ${values.endTime}`,
                link: sanitize(values.link),
                location: sanitize(values.location),
                groups: values.groups.map(id => +id),
                everyone: values.everyone === 'true',
              })
            } else {
              await getPHP('editSession', {
                sessionId: session.id,
                title: sanitize(values.title),
                description: sanitize(values.description),
                startTime: `${values.startDate} ${values.startTime}`,
                endTime: `${values.endDate} ${values.endTime}`,
                link: sanitize(values.link),
                location: sanitize(values.location),
                groups: values.groups.map(id => +id),
                everyone: values.everyone === 'true',
              })
            }

            window.location.reload()
            setSubmitting(false)
            onHide()
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => {
            return (
              <Form className="m-3">
                <h2>What</h2>
                <FieldWithError name="title" placeholder="Title" />
                <FieldWithError
                  name="description"
                  placeholder="Description (optional)"
                  as="textarea"
                />

                <h2>When</h2>
                <FormBS.Group>
                  <strong>Start Time: </strong>
                  <Field
                    name="startDate"
                    type="date"
                    style={{ width: '15rem' }}
                    className="form-control d-inline"
                    onChange={e => {
                      setFieldValue('startDate', e.target.value)
                      setFieldValue('endDate', e.target.value)
                    }}
                  />
                  <Field
                    name="startTime"
                    type="time"
                    style={{ width: '15rem' }}
                    className="form-control d-inline"
                    onChange={e => {
                      setFieldValue('startTime', e.target.value)
                      const [hr, min] = e.target.value.split(':')
                      setFieldValue('endTime', ((+hr + 1) % 24) + ':' + min)
                    }}
                  />
                </FormBS.Group>
                <FormBS.Group>
                  <strong>End Time: </strong>
                  <Field
                    name="endDate"
                    type="date"
                    style={{ width: '15rem' }}
                    className="form-control d-inline"
                  />
                  <Field
                    name="endTime"
                    type="time"
                    style={{ width: '15rem' }}
                    className="form-control d-inline"
                  />
                </FormBS.Group>
                {errors.time && <Alert variant="danger">{errors.time}</Alert>}

                {hasGroup(event) && (
                  <FormBS.Group>
                    <h2>Who</h2>
                    <Field
                      name="everyone"
                      value="true"
                      type="radio"
                      as={FormBS.Check}
                      label={<strong>Everyone</strong>}
                    />
                    <Field
                      name="everyone"
                      value="false"
                      type="radio"
                      as={FormBS.Check}
                      label={<strong>Specific Groups...</strong>}
                    />
                    {values.everyone !== 'true' && (
                      <>
                        <FormBS.Check
                          label="Check All Groups"
                          onChange={e => {
                            setFieldValue(
                              'groups',
                              e.target.checked
                                ? event.groups.map(group => '' + group.id)
                                : []
                            )
                          }}
                        />
                        {event.groups.map(group => (
                          <Field
                            key={group.id}
                            name="groups"
                            type="checkbox"
                            value={'' + group.id}
                            label={group.title}
                            as={FormBS.Check}
                          />
                        ))}
                      </>
                    )}
                    {errors.groups && touched.groups && (
                      <Alert variant="danger">{errors.groups}</Alert>
                    )}
                  </FormBS.Group>
                )}

                <h2>Where</h2>
                <FieldWithError
                  name="link"
                  placeholder="Invite Link (optional)"
                />
                <FieldWithError
                  name="location"
                  placeholder="Physical Location (optional)"
                />

                <Modal.Footer>
                  <Button onClick={onHide} variant="secondary">
                    Cancel
                  </Button>
                  <Button disabled={isSubmitting} type="submit">
                    Save changes
                    {isSubmitting && (
                      <Spinner animation="border" variant="light" />
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            )
          }}
        </Formik>
      )}
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

const getDate = timestamp =>
  new Date(timestamp).toDateString().substring(0, 10).replace(' 0', ' ')

const getString = timestamp => new Date(timestamp).toLocaleString()
