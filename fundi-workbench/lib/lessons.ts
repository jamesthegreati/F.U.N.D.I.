import type { CircuitPart, Connection } from '@/store/useAppStore'
import { convertToFundiCircuit, getFeaturedProjects, type FeaturedProject } from '@/lib/featuredProjects'

export type LessonStepScaffold = {
  /** Adds parts only (no wires) so the student still wires intentionally. */
  addParts?: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    rotate?: number
    attrs?: Record<string, unknown>
  }>
  /** Optional code to drop into the main file. */
  setMainCode?: string
}

export type LessonStepChecks = {
  /** All required part types must exist in the circuit. */
  requiredPartTypes?: string[]
  /** All required code snippets must be present in the active code buffer. */
  codeMustContain?: string[]
  /** Run backend wiring validator and require no errors (warnings are allowed). */
  requireWiringNoErrors?: boolean
  /** Require the project to have a compiled hex (successful compile). */
  requireCompiledHex?: boolean
}

export type LessonStep = {
  id: string
  title: string
  objectives: string[]
  instructions: string
  checks?: LessonStepChecks
  scaffold?: LessonStepScaffold
}

export type Lesson = {
  id: string
  title: string
  summary: string
  steps: LessonStep[]
  /** A short canonical description for the AI to use as context. */
  aiBrief: string
}

function normalizeFeaturedPartType(type: string): string {
  return String(type || '').trim().replace(/^wokwi-/, '')
}

function featuredProjectToLesson(project: FeaturedProject): Lesson {
  const id = `featured:${project.id}`
  const title = project.name
  const summary = `${project.description} (${project.difficulty} • ${project.estimatedTime})`

  const requiredPartTypes = Array.from(
    new Set(project.diagram.parts.map((p) => normalizeFeaturedPartType(p.type)))
  ).filter(Boolean)

  const { parts } = convertToFundiCircuit(project)

  const tagLine = project.tags.length ? `Key topics: ${project.tags.join(', ')}.` : ''
  const starterCode = `// ${project.name} (Lesson Starter)\n// Goal: ${project.description}\n// ${tagLine}\n//\n// Tip: Start small, get one signal working, then expand.\n\nvoid setup() {\n  // TODO: initialize pins, Serial, libraries\n}\n\nvoid loop() {\n  // TODO: implement the core behavior\n}\n`

  return {
    id,
    title,
    summary,
    aiBrief:
      `Lesson based on Featured Project: ${project.name}. Difficulty: ${project.difficulty}. Student should place the required parts, wire them correctly, write working code, and compile/run in simulation. Tags: ${project.tags.join(', ')}.`,
    steps: [
      {
        id: 'understand',
        title: 'Understand the goal',
        objectives: [
          'Identify inputs (sensors/buttons) vs outputs (LEDs/buzzers/displays)',
          'Predict the expected behavior before you build',
          'Name 2–3 likely Arduino pins you’ll use',
        ],
        instructions:
          `Read the project description and tags. In 2–4 sentences: what should the circuit do? Then list inputs vs outputs, and guess which Arduino pins you’ll use. If you’re unsure, ask in Teacher Mode before building anything.`,
      },
      {
        id: 'parts',
        title: 'Place the parts',
        objectives: ['Add all required components to the canvas', 'Keep the layout readable for wiring'],
        instructions:
          'Use the component library to place the required parts on the canvas. Keep spacing clean so wiring is easy. You can use the scaffold button to auto-place parts (no wires).',
        checks: {
          requiredPartTypes,
        },
        scaffold: {
          addParts: parts.map((p) => ({
            id: p.id,
            type: p.type,
            position: p.position,
            rotate: p.rotation,
            attrs: p.attrs,
          })),
        },
      },
      {
        id: 'wire',
        title: 'Wire the circuit',
        objectives: ['Connect power + GND first', 'Wire signals one-by-one', 'Fix any wiring errors reported by the checker'],
        instructions:
          'Wire your circuit carefully. Start with power and GND, then connect signals one at a time. When ready, run “Check” to validate there are no wiring errors.',
        checks: {
          requireWiringNoErrors: true,
        },
      },
      {
        id: 'code',
        title: 'Write the code',
        objectives: ['Outline the logic in plain English first', 'Implement setup() + loop()', 'Read inputs and drive outputs', 'Add Serial prints for debugging'],
        instructions:
          'Before writing code, outline the behavior in 3–6 bullet points (what happens first, what repeats, what triggers changes). Then implement the sketch. Use Teacher Mode for explanations; use Builder Mode when you want the implementation.',
        checks: {
          codeMustContain: ['void setup', 'void loop'],
        },
        scaffold: {
          setMainCode: starterCode,
        },
      },
      {
        id: 'run',
        title: 'Compile and run',
        objectives: ['Compile successfully', 'Observe the expected behavior in simulation', 'Fix one issue at a time'],
        instructions:
          'Click Run. If you hit errors, use the error output + Teacher Mode to debug step-by-step.',
        checks: {
          requireCompiledHex: true,
        },
      },
      {
        id: 'extend',
        title: 'Extend the project',
        objectives: ['Make one small improvement', 'Explain why your change works'],
        instructions:
          'Pick one small enhancement (e.g., adjust timing, add a safety limit, add a second output, improve readability). Ask the Teacher for guidance, then use Builder Mode to implement the change.',
      },
    ],
  }
}

export const LESSONS: Lesson[] = getFeaturedProjects().map(featuredProjectToLesson)

export function getLessonById(id: string | null | undefined): Lesson | null {
  if (!id) return null
  return LESSONS.find((l) => l.id === id) ?? null
}

export function normalizePartTypeForLessonChecks(type: string): string {
  return String(type || '').trim().toLowerCase()
}

export function circuitHasRequiredPartTypes(parts: CircuitPart[], required: string[]): boolean {
  const have = new Set(parts.map((p) => normalizePartTypeForLessonChecks(p.type)))
  return required.every((t) => have.has(normalizePartTypeForLessonChecks(t)))
}

export function codeContainsAll(code: string, needles: string[]): boolean {
  const hay = code || ''
  return needles.every((n) => hay.includes(n))
}
