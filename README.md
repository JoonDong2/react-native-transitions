# react-native-transitions

Swipeable screen transition component for React Native.

[한국어](docs/README.ko.md)

## Why?

### Rendering Optimization

`react-native-transitions` uses [react-native-screens](https://github.com/software-mansion/react-native-screens) and [react-freeze](https://github.com/software-mansion/react-freeze) internally to optimize rendering.

Each child screen is assigned an `activityState`:

| Value | State | Description |
|---|---|---|
| `2` | `FULL_ACTIVE` | Currently focused screen. Renders normally. |
| `1` | `PARTIAL_ACTIVE` | Screen in transition (about to be focused or departing). Rendered but does not receive touch events. |
| `0` | `INACTIVE` | Inactive screen. Rendering is frozen by `react-freeze` and detached from the native view hierarchy by `react-native-screens`. |

This prevents unnecessary re-renders of off-screen children and reduces native view hierarchy overhead.

### FlatList Integration

The `Transitions` component can be used as a FlatList item, making it easy to build tab-based UIs with sticky headers. See the [example](example/src/App.tsx).

## Installation

```sh
yarn add react-native-transitions react-native-screens react-freeze
```

or

```sh
npm install react-native-transitions react-native-screens react-freeze
```

> Native setup for `react-native-screens` is required. See the [react-native-screens installation guide](https://github.com/software-mansion/react-native-screens#installation).

## Usage

### Basic

```tsx
import { useState } from 'react';
import Transitions from 'react-native-transitions';

function App() {
  const [index, setIndex] = useState(0);

  return (
    <Transitions index={index} onIndexChange={setIndex}>
      <ScreenA />
      <ScreenB />
      <ScreenC />
    </Transitions>
  );
}
```

### Render Function

Pass children as functions to receive `activityState`, `priority`, and `diff`:

```tsx
<Transitions index={index} onIndexChange={setIndex}>
  {({ activityState, diff }) => <ScreenA activityState={activityState} />}
  {({ activityState, diff }) => <ScreenB activityState={activityState} />}
</Transitions>
```

### With FlatList

An example of building a sticky tab bar with FlatList:

```tsx
import { useCallback, useRef, useState } from 'react';
import { Animated, FlatList, View } from 'react-native';
import Transitions from 'react-native-transitions';

const ITEMS = ['header', 'tab', 'transitions'] as const;

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const animatedIndex = useRef(new Animated.Value(0)).current;

  const renderItem = useCallback(
    ({ item }: { item: (typeof ITEMS)[number] }) => {
      switch (item) {
        case 'header':
          return <Header />;
        case 'tab':
          return <TabBar index={tabIndex} animatedIndex={animatedIndex} onPress={setTabIndex} />;
        case 'transitions':
          return (
            <Transitions
              index={tabIndex}
              onIndexChange={setTabIndex}
              animatedIndex={animatedIndex}
            >
              <ScreenA />
              <ScreenB />
            </Transitions>
          );
      }
    },
    [tabIndex, animatedIndex]
  );

  return (
    <FlatList
      data={ITEMS as unknown as (typeof ITEMS)[number][]}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      stickyHeaderIndices={[1]}
    />
  );
}
```

Passing `animatedIndex` externally allows you to synchronize it with tab indicator animations, etc.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ScreenType[]` | *required* | Screens to transition between. ReactElement or render function. |
| `index` | `number` | `0` | Currently active screen index. |
| `onIndexChange` | `(index: number) => void` | - | Called when the index changes via swipe. |
| `transitionType` | `'view' \| 'screens'` | `'view'` | Set to `'screens'` to use `ScreenContainer` from `react-native-screens`. |
| `animationType` | `'slide' \| 'fade' \| 'fade-slide' \| 'none'` | `'slide'` | Transition animation type. |
| `swipeEnabled` | `boolean` | `true` | Whether swipe gestures are enabled. |
| `vertical` | `boolean` | `false` | Set to `true` to transition vertically. |
| `animatedIndex` | `Animated.Value` | - | Externally controlled animated index. Useful for syncing tab indicators. |
| `keepAlive` | `number` | `undefined` (unlimited) | Maximum number of screens to keep mounted. Used for memory optimization. |
| `freeze` | `boolean` | `true` | Whether to apply `react-freeze` to inactive screens. |
| `layout` | `{ width?: number; height?: number }` | - | Manually specify container size. Auto-measured via `onLayout` if not provided. |
| `style` | `StyleProp<ViewStyle>` | - | Container style. |
| `onSwipeStart` | `() => void` | - | Called when a swipe gesture starts. |
| `onSwipeEnd` | `(index: number) => void` | - | Called after the swipe animation completes. |
| `onLayout` | `(event: LayoutChangeEvent) => void` | - | Container layout event. |

## Ref Methods

Access imperative methods via `ref`:

| Method | Type | Description |
|---|---|---|
| `goTo` | `(index: number, animated?: boolean) => void` | Navigate to the given index. |
| `animatedIndex` | `Animated.Value` | Current animated index value. |

## Exports

```ts
import Transitions, {
  ActivityState,
  type TransitionType,
  type AnimationType,
  type TransitionsInstance,
} from 'react-native-transitions';
```

## License

MIT
