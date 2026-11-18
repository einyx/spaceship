// SPDX-License-Identifier: GPL-3.0-or-later
// Part of the vendored Spaceship IDE (chuanqisun/spaceship, MIT). See README.prysm.md for what we changed.
//
// The host: in Prysm the text does not come from a vendor's API but from the bridge, and the steering
// the user sets rides along with the next message. This file is the seam between the two.

import type { Control } from "../text/dimension.ts"
import type { Lead } from "../text/attention.ts"
import type { Steering, TextSource } from "../text/text-stream.ts"

/** What the steering means to the host: the phrases to lead with, and the dimensions tuned for what comes next. */
export type PrysmSteering = { leads: string[]; controls: string[] }

export type PrysmHost = {
  /** The words of the next answer, as they arrive. Waits until there is one. */
  answer(): AsyncIterable<string>
  /** Told what the user steered, so the next message can carry it. */
  setSteering(steering: PrysmSteering): void
  /** The person scrubbed back or changed the steering: they want another future of the same question.
   *  The host re-asks with the steering attached; the words that follow land as the new continuation. */
  regenerate(steering: PrysmSteering): void
}

/** The page that hosts the IDE sets this before the module loads. */
export function host(): PrysmHost | undefined {
  return (globalThis as unknown as { __PRYSM_SPACE__?: PrysmHost }).__PRYSM_SPACE__
}

/** The steering in the form the host sends it: the key phrases, and each dimension with its position. */
export function steeringOf(steering: Steering): PrysmSteering {
  return {
    leads: steering.leads.map((lead: Lead) => lead.keyword),
    controls: steering.controls.map((control: Control) => `${control.dimension.name}: ${positionOf(control)}`),
  }
}

/** Where a control sits, between its poles. */
function positionOf(control: Control): string {
  const { dimension, position } = control
  if (dimension.kind === "choice") {
    const index = Math.max(0, Math.min(dimension.options.length - 1, Math.round(position * (dimension.options.length - 1))))
    return dimension.options[index] ?? dimension.options[0] ?? ""
  }
  return position >= 0.5 ? dimension.high : dimension.low
}

/** The IDE's text comes from the host: the answer the chat is writing, word by word. */
export const prysmSource: TextSource = {
  expand: (text: string) => text,
  async *complete(_prefix: string, steering: Steering, signal: AbortSignal) {
    const page = host()
    if (!page) return
    page.setSteering(steeringOf(steering))
    for await (const chunk of page.answer()) {
      if (signal.aborted) return
      yield chunk
    }
  },
}
