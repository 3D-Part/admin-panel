'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'
import { AssistantUsage } from '@/services/backoffice'

export type AssistantForm = {
  enabled: boolean
  provider: 'openai' | 'anthropic'
  // OpenAI
  model: string
  hasApiKey: boolean
  apiKey: string
  clearApiKey: boolean
  // Anthropic
  anthropicModel: string
  hasAnthropicApiKey: boolean
  anthropicApiKey: string
  clearAnthropicApiKey: boolean
}

export const DEFAULT_ASSISTANT_FORM: AssistantForm = {
  enabled: true,
  provider: 'openai',
  model: 'gpt-4o-mini',
  hasApiKey: false,
  apiKey: '',
  clearApiKey: false,
  anthropicModel: 'claude-opus-5-5',
  hasAnthropicApiKey: false,
  anthropicApiKey: '',
  clearAnthropicApiKey: false,
}

export const readAssistantForm = (stored: any): AssistantForm => ({
  ...DEFAULT_ASSISTANT_FORM,
  enabled: stored?.enabled !== false,
  provider: stored?.provider === 'anthropic' ? 'anthropic' : 'openai',
  model: stored?.model || DEFAULT_ASSISTANT_FORM.model,
  hasApiKey: !!stored?.hasApiKey,
  anthropicModel: stored?.anthropicModel || DEFAULT_ASSISTANT_FORM.anthropicModel,
  hasAnthropicApiKey: !!stored?.hasAnthropicApiKey,
})

/** What goes into the settings: a key only when a new one is typed, the API keeps the saved one otherwise. */
export const assistantSettings = (form: AssistantForm) => ({
  enabled: form.enabled,
  provider: form.provider,
  model: form.model.trim() || DEFAULT_ASSISTANT_FORM.model,
  anthropicModel: form.anthropicModel.trim() || DEFAULT_ASSISTANT_FORM.anthropicModel,
  ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
  ...(form.anthropicApiKey.trim() ? { anthropicApiKey: form.anthropicApiKey.trim() } : {}),
  ...(form.clearApiKey ? { clearApiKey: true } : {}),
  ...(form.clearAnthropicApiKey ? { clearAnthropicApiKey: true } : {}),
})

const PROVIDERS = {
  openai: {
    title: 'ChatGPT (OpenAI)',
    keyHelp: 'From platform.openai.com → API keys.',
    placeholder: 'sk-...',
    models: [
      { id: 'gpt-4.1-nano', tag: 'Cheapest', note: 'Short, simple answers.' },
      { id: 'gpt-4o-mini', tag: 'Recommended', note: 'Good answers for very little money.' },
      { id: 'gpt-4.1-mini', tag: 'Smarter', note: 'Better answers, a few times pricier.' },
      { id: 'gpt-4o', tag: 'Most capable', note: 'The best answers, the highest price.' },
    ],
    keyField: 'apiKey',
    hasField: 'hasApiKey',
    clearField: 'clearApiKey',
    modelField: 'model',
  },
  anthropic: {
    title: 'Claude (Anthropic)',
    keyHelp: 'From platform.claude.com → API keys.',
    placeholder: 'sk-ant-...',
    models: [
      { id: 'claude-haiku-5-5', tag: 'Cheapest', note: 'Fast and cheap, enough for most shop questions.' },
      { id: 'claude-sonnet-5-5', tag: 'Recommended', note: 'Very good answers at half the price of Opus.' },
      { id: 'claude-opus-5-5', tag: 'Smartest', note: 'Top answers for harder technical questions.' },
      { id: 'claude-fable-5-2', tag: 'Most capable', note: 'The strongest model, the highest price.' },
    ],
    keyField: 'anthropicApiKey',
    hasField: 'hasAnthropicApiKey',
    clearField: 'clearAnthropicApiKey',
    modelField: 'anthropicModel',
  },
} as const

const number = (value: number) => value.toLocaleString('de-DE')
const usd = (value: number | null) => (value === null ? '—' : `$${value < 0.01 && value > 0 ? value.toFixed(4) : value.toFixed(2)}`)

/**
 * Rough cost of 1000 answers, so models can be compared at a glance.
 * A typical answer: ~2500 tokens of instructions read from the AI's cache, ~500 new tokens in, ~300 out.
 */
const per1000Answers = (cost: { input: number; cacheRead: number; output: number }) =>
  ((2500 * cost.cacheRead + 500 * cost.input + 300 * cost.output) / 1_000_000) * 1000
const roughUsd = (value: number) => (value < 1 ? `$${value.toFixed(2)}` : `$${value.toFixed(value < 10 ? 1 : 0)}`)

const AssistantSettings: React.FC<{
  value: AssistantForm
  onChange: (next: AssistantForm) => void
}> = ({ value, onChange }) => {
  const [usage, setUsage] = useState<AssistantUsage | null>(null)

  useEffect(() => {
    BackofficeAPI.getAssistantUsage().then((data) => setUsage(data ?? null))
  }, [])

  const set = (patch: Partial<AssistantForm>) => onChange({ ...value, ...patch })

  const totalCost = (usage?.rows ?? []).reduce((sum, row) => sum + (row.estimatedCostUsd ?? 0), 0)

  return (
    <div className="space-y-6">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded"
          checked={value.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
        />
        <span className="text-sm text-gray-900 dark:text-white">{tx("Show the chat on the site")}</span>
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">{tx("Which AI answers")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PROVIDERS) as Array<keyof typeof PROVIDERS>).map((id) => {
            const provider = PROVIDERS[id]
            const hasKey = value[provider.hasField] && !value[provider.clearField]
            const active = value.provider === id
            return (
              <div
                key={id}
                className={`rounded-lg border p-4 ${
                  active ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <label className="flex items-center gap-2">
                  <input type="radio" name="assistantProvider" checked={active} onChange={() => set({ provider: id })} />
                  <span className="font-semibold text-gray-900 dark:text-white">{provider.title}</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                      hasKey
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {hasKey ? tx("Key saved") : tx("No key")}
                  </span>
                </label>

                <div className="mt-3">
                  <Label htmlFor={`${id}-key`} value={tx("API key")} />
                  <TextInput
                    id={`${id}-key`}
                    type="password"
                    autoComplete="off"
                    className="mt-1"
                    placeholder={hasKey ? tx("A key is saved. Type a new one to replace it.") : provider.placeholder}
                    value={value[provider.keyField]}
                    onChange={(e) => set({ [provider.keyField]: e.target.value, [provider.clearField]: false } as any)}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{tx(provider.keyHelp)}</p>
                  {hasKey && (
                    <Button
                      size="xs"
                      color="gray"
                      className="mt-2"
                      onClick={() => set({ [provider.keyField]: '', [provider.clearField]: true } as any)}
                    >
                      {tx("Remove the key")}
                    </Button>
                  )}
                  {value[provider.clearField] && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{tx("The key is removed when you save.")}</p>
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">{tx("Model")}</p>
                  <div className="space-y-2">
                    {provider.models.map((model) => {
                      const selected = value[provider.modelField] === model.id
                      const cost = usage?.prices[model.id]
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => set({ [provider.modelField]: model.id, provider: id } as any)}
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                            selected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500'
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected ? 'border-purple-600' : 'border-gray-300 dark:border-gray-500'
                            }`}
                          >
                            {selected && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{tx(model.tag)}</span>
                              <span className="text-xs text-gray-400">{model.id}</span>
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">{tx(model.note)}</span>
                          </span>
                          {cost && (
                            <span className="shrink-0 text-right">
                              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                ≈ {roughUsd(per1000Answers(cost))}
                              </span>
                              <span className="block text-[11px] text-gray-500 dark:text-gray-400">{tx("per 1000 answers")}</span>
                            </span>
                          )}
                        </button>
                      )
                    })}
                    {!provider.models.some((model) => model.id === value[provider.modelField]) && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {tx("Saved model")}: {value[provider.modelField]}. {tx("Pick one above to switch.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {tx("The chat appears on the site once the chosen AI has a key and the chat is switched on. Both keys can be saved and you switch between them here.")}
        </p>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{tx("Usage in the last 30 days")}</p>
          {usage && usage.rows.length > 0 && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {tx("Estimated cost")}: <strong>{usd(totalCost)}</strong>
            </p>
          )}
        </div>
        {!usage ? (
          <p className="text-sm text-gray-500">…</p>
        ) : usage.rows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{tx("The chat has not answered anything yet.")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-3">{tx("AI and model")}</th>
                  <th className="py-2 pr-3 text-right">{tx("Answers")}</th>
                  <th className="py-2 pr-3 text-right">{tx("Free from memory")}</th>
                  <th className="py-2 pr-3 text-right">{tx("Calls to the AI")}</th>
                  <th className="py-2 pr-3 text-right">{tx("Tokens in")}</th>
                  <th className="py-2 pr-3 text-right">{tx("From the AI's cache")}</th>
                  <th className="py-2 pr-3 text-right">{tx("Tokens out")}</th>
                  <th className="py-2 text-right">{tx("Cost (est.)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {usage.rows.map((row) => (
                  <tr key={`${row.provider}-${row.model}`} className="text-gray-800 dark:text-gray-200">
                    <td className="py-2 pr-3">
                      <span className="block text-xs text-gray-500">{row.provider === 'anthropic' ? 'Claude' : 'ChatGPT'}</span>
                      {row.model}
                    </td>
                    <td className="py-2 pr-3 text-right">{number(row.answers)}</td>
                    <td className="py-2 pr-3 text-right">{number(row.cachedAnswers)}</td>
                    <td className="py-2 pr-3 text-right">{number(row.calls)}</td>
                    <td className="py-2 pr-3 text-right">{number(row.inputTokens + row.cacheWriteTokens)}</td>
                    <td className="py-2 pr-3 text-right">{number(row.cacheReadTokens)}</td>
                    <td className="py-2 pr-3 text-right">{number(row.outputTokens)}</td>
                    <td className="py-2 text-right font-semibold">{usd(row.estimatedCostUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {tx("The cost is an estimate from the published prices; the bills of OpenAI and Anthropic are what counts. \"Free from memory\" are repeated questions answered by the server without the AI.")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssistantSettings
