import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LEMON_CHECKOUT_LINK } from '~/constants'
import { useLicense } from '~/hooks/useLicense'

export function UpgradePro() {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium">
        Please upgrade to use all <b>Pro</b> features.
      </p>
      <p className="font-medium italic">Lock your Early Bird discount now!</p>

      <ul className="list-disc rounded py-2 pl-4 ring-2 ring-gray-200">
        <li>Unlock all existing Pro features.</li>
        <li>All upcoming Pro features will be free.</li>
        <li>Activated on up to 3 different browsers.</li>
        <li>
          Works on all all different browsers, i.e, Chrome, Firefox, Edge,
          Brave, etc. (Not include Safari).
        </li>
        <li>Works even when you uninstall and then reinstall the extension.</li>
      </ul>

      <div className="flex flex-col items-center gap-2">
        <a
          className="btn btn-neutral btn-sm w-full"
          href={LEMON_CHECKOUT_LINK}
          target="_blank"
          rel="noreferrer">
          Early Bird Price $9.99
        </a>
        <ActivateKey />
      </div>
    </div>
  )
}

function ActivateKey() {
  const [isActive, setIsActive] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(false)
  const { activate } = useLicense()
  const navigate = useNavigate()

  if (!isActive) {
    return (
      <button
        className="left text-sm font-medium underline"
        onClick={() => setIsActive(true)}>
        Enter license key
      </button>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="form-control">
        <input
          type="text"
          placeholder="Paste your license key here"
          className={`input input-sm input-bordered w-full max-w-xs ${
            error ? 'input-error' : ''
          }`}
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
          }}
        />
        {error && <label className="label text-red-400">{error}</label>}
      </div>
      <div className="flex gap-2">
        <button
          className="btn btn-neutral btn-sm"
          disabled={isLoading}
          onClick={() => {
            setLoading(true)
            activate(input)
              .then(({ error }) => {
                if (error) setError(error)
                else navigate('/')
              })
              .catch(() => {
                setError(
                  'Something went wrong, please try again later or contact hi@hopsken.com for help'
                )
              })
              .finally(() => setLoading(false))
          }}>
          {isLoading && <span className="loading loading-spinner" />}
          Activate
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setIsActive(false)
            setInput('')
          }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
