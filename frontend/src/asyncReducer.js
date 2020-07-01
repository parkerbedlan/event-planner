import { useReducer, useCallback } from 'react'
import { get } from 'lodash'
import produce from 'immer'

const FETCH_START = 'FETCH_START'
const FETCH_SUCCESS = 'FETCH_SUCCESS'
const FETCH_ERROR = 'FETCH_ERROR'

function hasAction(obj, property) {
  return Object.prototype.hasOwnProperty.call(obj, property)
}
function withAsyncDispatch(dispatch, apiMap) {
  return async action => {
    const { type, ...payload } = action
    const api = apiMap[type]
    if (api) {
      let apiCall = api
      if (hasAction(api, 'onBeforeFetch')) {
        const preAction = api.onBeforeFetch(payload)
        if (preAction) {
          dispatch(preAction)
        }
      }
      if (hasAction(api, 'api')) {
        apiCall = api.api
      }

      dispatch({ type: FETCH_START, originType: type })
      try {
        const result = await apiCall.call(null, payload)
        if (result.status === 'ERROR') {
          throw new Error(result.msg || result.message)
        }
        if (get(result, 'results[0].status') === 'ERROR') {
          throw new Error(get(result, 'results[0].msg'))
        }
        dispatch({ type: FETCH_SUCCESS, originType: type })
        dispatch({ ...action, result })
        if (hasAction(api, 'onAfterFetch')) {
          const postAction = api.onAfterFetch({ ...payload, result })
          if (postAction) {
            dispatch(postAction)
          }
        }
        return Promise.resolve(result)
      } catch (error) {
        console.error(error)
        dispatch({ type: FETCH_ERROR, originType: type, error: error.message })
        if (hasAction(api, 'onAfterFetch')) {
          const postAction = api.onAfterFetch({ ...payload, error })
          if (postAction) {
            dispatch(postAction)
          }
        }
        return Promise.resolve(error)
      }
    }
    dispatch(action)
    return Promise.resolve()
  }
}

const asyncReducer = reducer =>
  /* eslint-disable consistent-return */
  produce((draft, action) => {
    const { originType } = action
    switch (action.type) {
      case FETCH_START:
        draft.isLoading = true
        draft.loadCount += 1
        draft.loadStates[action.originType]++
        draft.errors = []
        break
      case FETCH_SUCCESS:
        draft.loadCount -= 1
        if (draft.loadCount === 0) {
          draft.isLoading = false
        }
        draft.loadStates[action.originType]--
        draft.errors = []
        break
      case FETCH_ERROR:
        draft.loadCount -= 1
        if (draft.loadCount === 0) {
          draft.isLoading = false
        }
        draft.loadStates[action.originType]--
        draft.errors.push({ error: action.error, originType })
        break
      default:
        return reducer(draft, action)
    }
  })
/* eslint-enable consistent-return */

function useAsyncReducer(reducer, initialState, apiMap) {
  const fetchStatusInitialState = {
    isLoading: false,
    loadCount: 0,
    errors: [],
    loadStates: Object.keys(apiMap).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    ),
  }
  const [state, dispatch] = useReducer(asyncReducer(reducer), {
    ...fetchStatusInitialState,
    ...initialState,
  })

  const asyncDispatch = useCallback(withAsyncDispatch(dispatch, apiMap), [
    dispatch,
    apiMap,
  ])
  return [state, asyncDispatch]
}
export default useAsyncReducer
