import { Effect } from 'effect';
import { createActor, createMachine, types, type InspectionEvent } from 'xstate';
import { createEffectActor, send, waitFor } from '@xstate/effect';

// Count every inspection event an actor system delivers to its observers.
const system = Object.getPrototypeOf(createActor(createMachine({})).system);
const systemInspect = system.inspect;
let inspectionEvents = 0;
system.inspect = function (observer: (event: InspectionEvent) => void) {
  return systemInspect.call(this, (event: InspectionEvent) => {
    inspectionEvents++;
    observer(event);
  });
};

const counter = createMachine({
  schemas: { events: { INCREMENT: types<{}>() } },
  context: { count: 0 },
  on: { INCREMENT: ({ context }) => ({ context: { count: context.count + 1 } }) }
});

await Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const actor = yield* createEffectActor(counter);
      inspectionEvents = 0;
      for (let i = 0; i < 1000; i++) {
        yield* send(actor, { type: 'INCREMENT' });
      }
      yield* waitFor(actor, (snapshot) => snapshot.context.count === 1000);
    })
  )
);

console.log(`1000 events sent, no actor.inspect() subscriber`);
console.log(`inspection events built: ${inspectionEvents} (expected 0)`);
process.exitCode = inspectionEvents === 0 ? 0 : 1;
