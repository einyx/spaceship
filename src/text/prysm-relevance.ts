// SPDX-License-Identifier: GPL-3.0-or-later
// Part of the vendored Spaceship IDE (chuanqisun/spaceship, MIT). See README.prysm.md for what we changed.

import type { RelevanceRequest, RelevanceSource } from "./keyword-relevance.ts"

/** The model's own attention, through the bridge: the rail's meters ask the engine how much each
 *  pinned keyword bears on the sentence being written (POST /api/chat/relevance). Upstream asked a
 *  separate decisions API with the user's own key; here the bridge holds the model. */
export const prysmRelevance: RelevanceSource = async function* ({ story, tip, leads }: RelevanceRequest, signal: AbortSignal) {
  if (leads.length === 0) return
  const response = await fetch("/api/chat/relevance", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Prysm-Agent-Forge-UI": "1" },
    signal,
    body: JSON.stringify({ story, tip, keywords: leads.map(({ before, keyword, after }) => ({ before, keyword, after })) }),
  })
  if (!response.ok) throw new Error(`the model could not score it (${response.status})`)
  const { scores } = (await response.json()) as { scores?: number[] }
  for (const index of leads.keys()) {
    const score = scores?.[index]
    if (typeof score === "number") yield { index, relevance: Math.max(0, Math.min(1, score)) }
  }
}
