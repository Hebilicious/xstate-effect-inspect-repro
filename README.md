# @xstate/effect builds inspection events nobody subscribed to

`createEffectActor` always passes `inspect` to `createDurable`, so every transition builds inspection events even when nothing calls `actor.inspect()`. `repro.ts` sends 1000 events to a counter actor with no subscriber and counts the inspection events delivered to its actor system.

```sh
pnpm install && pnpm test
```

Expected: `inspection events built: 0`. Actual: `inspection events built: 2000` (one `@xstate.actor` and one `@xstate.transition` per event), and the script exits with code 1.

Versions: xstate 6.0.0-alpha.70, @xstate/effect 1.0.0-alpha.9, effect 4.0.6, Node 24.
