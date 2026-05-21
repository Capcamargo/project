import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_REQUESTS = 10

type Recommendation = {
  title: string
  reason: string
  explanation: string
  price_hint: string
  category: string
  tone: string
  score: number
}

type GiftPreset = {
  id: string
  slug: string
  title: string
  occasion: string
  budget_hint: string | null
  relation: string | null
  interests: string | null
  notes: string | null
  tags: string[] | null
  image_path: string | null
  starting_price: number | null
  short_description: string | null
  badge_text: string | null
  filter_tags: string[] | null
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function splitTerms(value: string | null | undefined) {
  return normalize(value)
    .split(/[;,]/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseBudgetValue(value: string | null | undefined) {
  const raw = String(value ?? '').replace(/\s+/g, '')
  const matches = raw.match(/\d+/g)
  if (!matches?.length) return null
  const numbers = matches.map((item) => Number(item)).filter((item) => Number.isFinite(item))
  if (!numbers.length) return null
  return Math.max(...numbers)
}

function scorePreset(preset: GiftPreset, payload: Record<string, string>) {
  let score = 42
  const occasion = normalize(payload.occasion)
  const relation = normalize(payload.relation)
  const interests = splitTerms(payload.interests)
  const notes = normalize(payload.notes)
  const budgetMax = parseBudgetValue(payload.budget)

  const presetOccasion = normalize(preset.occasion)
  if (presetOccasion && (presetOccasion.includes(occasion) || occasion.includes(presetOccasion))) {
    score += 20
  }

  const presetRelation = normalize(preset.relation)
  if (relation && presetRelation && (presetRelation.includes(relation) || relation.includes(presetRelation))) {
    score += 14
  }

  const presetInterests = [
    ...splitTerms(preset.interests),
    ...(preset.tags ?? []).map((item) => normalize(item)),
    ...(preset.filter_tags ?? []).map((item) => normalize(item)),
  ]

  const matches = interests.filter((term) =>
    presetInterests.some((presetTerm) => presetTerm.includes(term) || term.includes(presetTerm)),
  )
  score += matches.length * 9

  if (notes) {
    const noteTargets = [preset.notes, preset.short_description, preset.badge_text]
      .map((item) => normalize(item))
      .filter(Boolean)

    if (noteTargets.some((item) => item.includes(notes) || notes.includes(item.slice(0, 24)))) {
      score += 6
    }
  }

  if (budgetMax && preset.starting_price) {
    if (preset.starting_price <= budgetMax) {
      score += 12
      const gap = budgetMax - preset.starting_price
      if (gap <= Math.max(1500, Math.round(budgetMax * 0.2))) score += 5
    } else {
      const overspend = preset.starting_price - budgetMax
      score -= overspend > budgetMax * 0.35 ? 18 : 9
    }
  }

  return Math.max(35, Math.min(98, score))
}

function buildRecommendation(preset: GiftPreset, payload: Record<string, string>, score: number): Recommendation {
  const relationText = payload.relation ? `для ${payload.relation}` : 'для этого сценария'
  const interestText = payload.interests ? `с учетом интересов: ${payload.interests}` : 'с опорой на выбранный контекст'
  const category = preset.badge_text ?? preset.tags?.[0] ?? 'Готовый сценарий'

  return {
    title: preset.title,
    reason: `Подходит ${relationText}, хорошо ложится на повод «${payload.occasion}» и собран ${interestText}.`,
    explanation: preset.short_description ?? preset.notes ?? 'Это один из наиболее уместных вариантов для такого повода и бюджета.',
    price_hint: preset.starting_price ? `от ${preset.starting_price.toLocaleString('ru-RU')} ₽` : (preset.budget_hint ?? payload.budget),
    category,
    tone: preset.notes ? 'Подбор с личным акцентом' : 'Универсальный вариант',
    score,
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Missing authorization header' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authData.user) return jsonResponse({ error: 'Unauthorized' }, 401)

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count: recentRequestCount, error: rateLimitError } = await supabase
      .from('gift_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authData.user.id)
      .gte('created_at', windowStart)

    if (rateLimitError) throw rateLimitError

    if ((recentRequestCount ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return jsonResponse({
        error: `Слишком много запросов. Попробуйте снова через несколько минут. Лимит MVP: ${RATE_LIMIT_MAX_REQUESTS} подборок за ${RATE_LIMIT_WINDOW_MINUTES} минут.`,
      }, 429)
    }

    const payload = await req.json()
    const input = {
      occasion: String(payload.occasion ?? '').trim(),
      budget: String(payload.budget ?? '').trim(),
      relation: String(payload.relation ?? '').trim(),
      interests: String(payload.interests ?? '').trim(),
      notes: String(payload.notes ?? '').trim(),
      source: String(payload.source ?? 'edge_function').trim(),
      save: Boolean(payload.save ?? false),
    }

    if (!input.occasion || !input.budget || !input.interests) {
      return jsonResponse({ error: 'Occasion, budget and interests are required' }, 400)
    }

    if (input.occasion.length > 120 || input.budget.length > 80 || input.relation.length > 120 || input.interests.length > 600 || input.notes.length > 800) {
      return jsonResponse({ error: 'Некоторые поля слишком длинные для MVP-сценария.' }, 400)
    }

    const { data: presets, error: presetsError } = await supabase
      .from('gift_presets')
      .select('id, slug, title, occasion, budget_hint, relation, interests, notes, tags, image_path, starting_price, short_description, badge_text, filter_tags')
    if (presetsError) throw presetsError

    const rankedPresets = (presets ?? [])
      .map((preset) => ({ preset, score: scorePreset(preset as GiftPreset, input) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)

    const { data: requestRow, error: requestError } = await supabase
      .from('gift_requests')
      .insert({
        user_id: authData.user.id,
        occasion: input.occasion,
        budget: input.budget,
        relation: input.relation || null,
        interests: input.interests,
        notes: input.notes || null,
        source: input.source,
      })
      .select('id, occasion, budget, relation, interests, notes, source, created_at')
      .single()
    if (requestError || !requestRow) throw requestError

    const recommendationRows = rankedPresets.map(({ preset, score }) => {
      const recommendation = buildRecommendation(preset as GiftPreset, input, score)
      return {
        user_id: authData.user.id,
        request_id: requestRow.id,
        title: recommendation.title,
        reason: recommendation.reason,
        explanation: recommendation.explanation,
        price_hint: recommendation.price_hint,
        category: recommendation.category,
        tone: recommendation.tone,
        score: recommendation.score,
        is_saved: input.save,
        saved_at: input.save ? new Date().toISOString() : null,
      }
    })

    const { data: insertedRecommendations, error: recommendationsError } = await supabase
      .from('gift_recommendations')
      .insert(recommendationRows)
      .select('id, title, reason, explanation, price_hint, category, tone, score, is_saved, saved_at, created_at')
    if (recommendationsError) throw recommendationsError

    return jsonResponse({
      request: requestRow,
      recommendations: insertedRecommendations ?? [],
      limit: {
        window_minutes: RATE_LIMIT_WINDOW_MINUTES,
        max_requests: RATE_LIMIT_MAX_REQUESTS,
        used_before_request: recentRequestCount ?? 0,
      },
    })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500)
  }
})
