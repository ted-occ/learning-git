export type SeatNumber = number;
export type StepId = string;

export type CommandStatus = "ok" | "error";

export interface CommandRecord {
  status: CommandStatus;
  timestamp: number;
}

export interface HelpRequest {
  id: string;
  seatNumber: SeatNumber;
  currentSection: string;
  timestamp: number;
  dismissed: boolean;
}

interface StoreData {
  checkpoints: Map<SeatNumber, Map<StepId, number>>;
  commandStatuses: Map<SeatNumber, Map<string, CommandRecord>>;
  helpRequests: HelpRequest[];
  steps: Record<string, { id: string; title: string; commandCount: number }[]>;
}

const g = globalThis as unknown as { __store?: StoreData };
if (!g.__store) {
  g.__store = {
    checkpoints: new Map(),
    commandStatuses: new Map(),
    helpRequests: [],
    steps: {},
  };
}
// Ensure commandStatuses exists for stores created before this field was added
if (!g.__store.commandStatuses) {
  g.__store.commandStatuses = new Map();
}
const store = g.__store;

export function registerSteps(dayId: string, steps: { id: string; title: string; commandCount: number }[]) {
  store.steps[dayId] = steps;
}

export function getSteps() {
  return store.steps;
}

export function markComplete(seatNumber: SeatNumber, stepId: StepId) {
  if (!store.checkpoints.has(seatNumber)) {
    store.checkpoints.set(seatNumber, new Map());
  }
  store.checkpoints.get(seatNumber)!.set(stepId, Date.now());
}

export function getProgress(): Record<number, Record<string, number>> {
  const result: Record<number, Record<string, number>> = {};
  for (const [seat, steps] of store.checkpoints) {
    result[seat] = Object.fromEntries(steps);
  }
  return result;
}

export function addHelpRequest(seatNumber: SeatNumber, currentSection: string): string {
  const id = crypto.randomUUID();
  store.helpRequests.push({
    id,
    seatNumber,
    currentSection,
    timestamp: Date.now(),
    dismissed: false,
  });
  return id;
}

export function dismissHelpRequest(id: string): boolean {
  const req = store.helpRequests.find((r) => r.id === id);
  if (req) {
    req.dismissed = true;
    return true;
  }
  return false;
}

export function getActiveHelpRequests(): HelpRequest[] {
  return store.helpRequests.filter((r) => !r.dismissed);
}

export function setCommandStatus(
  seatNumber: SeatNumber,
  commandId: string,
  status: CommandStatus
) {
  if (!store.commandStatuses.has(seatNumber)) {
    store.commandStatuses.set(seatNumber, new Map());
  }
  store.commandStatuses.get(seatNumber)!.set(commandId, {
    status,
    timestamp: Date.now(),
  });
}

export function getCommandStatuses(): Record<
  number,
  Record<string, CommandRecord>
> {
  const result: Record<number, Record<string, CommandRecord>> = {};
  for (const [seat, cmds] of store.commandStatuses) {
    result[seat] = Object.fromEntries(cmds);
  }
  return result;
}
