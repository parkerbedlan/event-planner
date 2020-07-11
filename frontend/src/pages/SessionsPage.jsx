import React, { useState, useRef, useEffect, useContext } from 'react'
import styled from 'styled-components'
import {
  Button,
  Modal,
  Spinner,
  Form as FormBS,
  Card,
  Row,
  Alert,
} from 'react-bootstrap'
import { Formik, Field, Form } from 'formik'
import Cookies from 'universal-cookie'
import { getPHP, sanitize } from '../phpHelper'
import { FieldWithError } from '../components/FieldWithError'
import { AppUser } from '../App'
import { LoadingScreen } from '../components/LoadingScreen'

const cookies = new Cookies()

const Styles = styled.div`
  .mt {
    margin-top: 1em;
  }
`

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
      const eventRequest = await getPHP('getEventGroupsAndSize', {
        eventId: Number(currentEventId),
      })
      setEvent({ ...eventRequest, sessions })
      await setLoading(false)

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
    <Styles>
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
                    <h1 className="mt">{monthHeader}</h1>
                    <hr />
                  </>
                )}
                {!!dateHeader && <h2 className="mt">{dateHeader}</h2>}

                <SessionCard session={session} event={event} />
              </>
            )}
          </React.Fragment>
        )
      })}
      <NewSessionModal
        show={showNew}
        onHide={() => setShowNew(false)}
        event={event}
        appUserEmail={emailAddr}
      />
    </Styles>
  )
}

function SessionCard({ session, event }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      {!deleting && (
        <Card className="mt">
          <Row>
            <div className="my-auto ml-4 mr-auto">
              <strong>{session.title}</strong>
              <br />
              {session.startTime.substring(11, 16) +
                ' - ' +
                session.endTime.substring(11, 16)}
            </div>
            <div className="my-auto mr-4 ml-auto">
              <Button
                onClick={() => setShowDetails(true)}
                variant="secondary"
                className="m-2"
              >
                Details
              </Button>
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
            </div>
          </Row>
        </Card>
      )}

      {showDetails && (
        <DetailsSessionModal
          show={showDetails}
          session={session}
          event={event}
          onHide={() => setShowDetails(false)}
        />
      )}

      {showEdit && (
        <EditSessionModal
          show={showEdit}
          session={session}
          event={event}
          onHide={() => setShowEdit(false)}
        />
      )}
    </>
  )
}

function DetailsSessionModal({ show, onHide, session, event }) {
  useEffect(() => {
    console.log('details mount', session.id)
  }, [session.id])
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
              {session.everyone
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
              {session.everyone
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

function EditSessionModal({ show, onHide, session, event }) {
  useEffect(() => {
    console.log('edit mount', session.id)
  }, [session.id])
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <h4>Edit: {session.title}</h4>
      </Modal.Header>
      {session.groupIds === undefined ? (
        <LoadingScreen />
      ) : (
        <Formik
          validateOnChange={true}
          initialValues={{
            title: session.title,
            description: session.description,
            startDate: session.startTime.substring(0, 10),
            startTime: session.startTime.substring(11, 16),
            endDate: session.endTime.substring(0, 10),
            endTime: session.endTime.substring(11, 16),
            everyone: session.everyone,
            groups: session.groupIds.map(id => String(id)),
            link: session.link,
            location: session.location,
          }}
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
            await getPHP('editSession', {
              // eventId: event.id,
              sessionId: session.id,
              title: sanitize(values.title),
              description: sanitize(values.description),
              startTime: `${values.startDate} ${values.startTime}`,
              endTime: `${values.endDate} ${values.endTime}`,
              link: sanitize(values.link),
              location: sanitize(values.location),
              groups: values.groups.map(id => Number(id)),
              // eslint-disable-next-line
              everyone: values.everyone == 'true',
            })
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
                  />
                  <Field
                    name="startTime"
                    type="time"
                    style={{ width: '15rem' }}
                    className="form-control d-inline"
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
                      checked={values.everyone === 'true'}
                    />
                    <Field
                      name="everyone"
                      value="false"
                      type="radio"
                      as={FormBS.Check}
                      label={<strong>Specific Groups...</strong>}
                      checked={values.everyone !== 'true'}
                    />
                    {values.everyone !== 'true' && (
                      <>
                        <FormBS.Check
                          label="Check All Groups"
                          onChange={e => {
                            setFieldValue(
                              'groups',
                              e.target.checked ? Object.keys(event.groups) : []
                            )
                          }}
                        />
                        {Object.values(event.groups).map(group => {
                          return (
                            <Field
                              key={group.id}
                              name="groups"
                              type="checkbox"
                              value={group.id}
                              label={group.title}
                              as={FormBS.Check}
                              checked={values.groups.includes(String(group.id))}
                            />
                          )
                        })}
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

function NewSessionModal({ show, onHide, event, appUserEmail }) {
  const titleField = useRef(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [everyone, setEveryone] = useState(true)
  const [groups, setGroups] = useState([])
  const [link, setLink] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (titleField.current) titleField.current.focus()
  }, [titleField])

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <h4>Create New Session</h4>
      </Modal.Header>
      <FormBS className="m-3">
        <FormBS.Group>
          <h2>What</h2>
          <FormBS.Control
            ref={titleField}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Session Title"
          />
        </FormBS.Group>
        <FormBS.Group>
          <FormBS.Control
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            as="textarea"
          />
        </FormBS.Group>
        <FormBS.Group>
          <h2>When</h2>
          <FormBS.Label className="mr-2">Start Time</FormBS.Label>
          <FormBS.Control
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value)
              setEndDate(e.target.value)
            }}
            style={{ display: 'inline', width: '15rem' }}
          />
          <FormBS.Control
            type="time"
            value={startTime}
            onChange={e => {
              setStartTime(e.target.value)
              const [hr, min] = e.target.value.split(':')
              setEndTime(((Number(hr) + 1) % 24) + ':' + min)
            }}
            style={{ display: 'inline', width: '15rem' }}
          />
        </FormBS.Group>
        <FormBS.Group>
          <FormBS.Label className="mr-2">End Time</FormBS.Label>
          <FormBS.Control
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ display: 'inline', width: '15rem' }}
          />
          <FormBS.Control
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={{ display: 'inline', width: '15rem' }}
          />
        </FormBS.Group>
        {hasGroup(event) && (
          <FormBS.Group>
            <h2>Who</h2>
            <FormBS.Check
              checked={everyone}
              onChange={() => setEveryone(true)}
              name="everyoneRadio"
              label={<strong>Everyone</strong>}
              type="radio"
            />
            <FormBS.Check
              checked={!everyone}
              onChange={() => setEveryone(false)}
              name="everyoneRadio"
              label={<strong>Specific Groups...</strong>}
              type="radio"
            />
            {!everyone && (
              <>
                <FormBS.Check
                  onChange={e => {
                    if (e.target.checked)
                      setGroups(Object.keys(event.groups).map(id => Number(id)))
                    else setGroups([])
                  }}
                  label="Check All Groups"
                  type="checkbox"
                />
                {Object.values(event.groups).map(group => (
                  <FormBS.Check
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
          </FormBS.Group>
        )}
        <FormBS.Group>
          <h2>Where</h2>
          <FormBS.Control
            value={link}
            onChange={e => setLink(e.target.value)}
            type="url"
            placeholder="Invite Link (optional)"
          />
        </FormBS.Group>
        <FormBS.Group>
          <FormBS.Control
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Physical Location (optional)"
          />
        </FormBS.Group>
      </FormBS>
      <Modal.Footer>
        <Button onClick={onHide} variant="secondary">
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
                description: sanitize(description),
                startTime: `${startDate} ${startTime}`,
                endTime: `${endDate} ${endTime}`,
                link: sanitize(link),
                location: sanitize(location),
                groups: groups,
                everyone,
              })
              window.location.reload()
              onHide()
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

const getDate = timestamp =>
  new Date(timestamp).toDateString().substring(0, 10).replace(' 0', ' ')

const getString = timestamp => new Date(timestamp).toLocaleString()
