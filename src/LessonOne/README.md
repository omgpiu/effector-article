# Events and stores in simple way

## Before we get into it

There are few things you better look throw in effector and patronum docs :

[Events](https://effector.dev/docs/api/effector/event)  
[Stores](https://effector.dev/docs/api/effector/store)   
[Patronum](https://github.com/effector/patronum)

Let's start our journey with a small component.
Usually for similar logic you better use hooks, but for learning we are going to use effector instead.

### Task:

1) Create a component with stars.
2) Stars must change their color when we hover them.
3) Stars must change their color according chosen rating.

### First step

1) Here we create a store by [createStore](https://effector.dev/docs/api/effector/createStore) for hoveredRating and
   give an initial value for it.
2) Best practice is to start store's name with $ sign.
3) We can add types for store value or store shape.
4) I add config with field name for easy debug. We can use useful lib - [Patronum](https://github.com/effector/patronum)
   for debug our stores/events/etc.

```ts
export const $hover = createStore<number>(0, {
    name: 'hover'
})
```

### Second step

Now it's time to create an event by [createEvent](https://effector.dev/docs/api/effector/createEvent).   
Simply speaking, event is a function with or without payload. Events work as triggers to start chain of actions.
TS will help us to understand do we need payload or not. I gave a payload as a number and now, when I'm going to use
this event, it's waiting for number payload.

```ts
export const setHoveredRating = createEvent<number>()
```

### Third step

This is magic time - connect our event to store.
Let's try to understand - what's going on here?

1) Connected our $hover (store) with setHover (event), and when we fire event our store will change.
2) put callback as second argument in .on method.

This callback has two arguments - state and event payload. If we don't need store data, we name first argument as
underscore ('_')

When we call setHoveredRating with some payload, our store will change. You can do any logic as you wish, but remember
our callback MUST BE A PURE FUNCTION.

**Better to know**

1) If you trigger any event with the same payload (``if oldState === payload from event``),state will NOT change and
   will
   not UPDATE.
2) If you pass undefined to store, store will NOT change and will not UPDATE.

```ts
$hover.on(setHoveredRating, (_, rating) => rating)
```

#### Some tips with patronum lib

If you check model.ts you'll find functions debug with stores and events. Try to change rating and check it out in your
console.
It's much easier to use [debug](https://github.com/effector/patronum/tree/main/src/debug) from patronum

### What we've done?

1) Created a store
2) Created an event
3) Connect the event with the store.

### Congratulation. Now, you can start this project and check, how it works!

