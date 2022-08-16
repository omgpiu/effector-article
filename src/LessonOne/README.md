# Events and stores in simple way

I created a small rating component to show, how we can work with events and stores.   
I know, that's an overhead to use effector for UI logic. But I hope these examples will help to easy start with effector. 

### First step

1) Here we createStore for hover and give initial value for it.
2) Best practice is to start store's name with  $ sign.
3) We can add types for store value or store shape.
4) I add config with field name for easy debug. We can use usefully lib - [Patronum](https://github.com/effector/patronum)  for debug our stores/events/etc.


```ts
export const $hover = createStore<number>(0,{
    name:'hover'
})
```

### Second step

Now it's time to createEvent.   
Simply speaking, event is a function with or without payload. 
TS will help us to understand do we need payload or not. I gave a payload as a number and now, when I'm going to use this event, it's waiting for number payload.

```ts
export const setHover = createEvent<number>()

```

### Third step
This is a magic time - connect our event to store.
Let's try to understand - what's going on here?
We connected our $hover (store) with setHover (event), and when we fire  event our store will change. 
We put callback as second argument in .on method.
This callback has two arguments - state and event payload. If we don't need store data, we name first argument as underscore ('_')

When we call our event setHover with some payload, our store will change. You can do any logic as you wish, but remember our callback MUST BE A PURE FUNCTION.


```ts
$hover.on(setHover, (_, rating) => rating)

```

### Some tips

If you check model.ts you'll find functions debug with stores and events. Try to change rating and check it out in your
console.

### What we've done?

1) Created a store
2) Connect event with this store

### Congratulation. Now, you can start this project and check, how it works!

