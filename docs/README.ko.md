# react-native-transitions

React Native을 위한 스와이프 가능한 화면 전환 컴포넌트입니다.

[English](../README.md)

## Why?

### 렌더링 최적화

`react-native-transitions`는 내부적으로 [react-native-screens](https://github.com/software-mansion/react-native-screens)와 [react-freeze](https://github.com/software-mansion/react-freeze)를 사용하여 렌더링을 최적화합니다.

각 자식 화면에는 `activityState`가 부여됩니다:

| 값 | 상태 | 설명 |
|---|---|---|
| `2` | `FULL_ACTIVE` | 현재 포커스된 화면. 정상적으로 렌더링됩니다. |
| `1` | `PARTIAL_ACTIVE` | 전환 중인 화면(포커스 예정 또는 떠나는 중). 렌더링은 되지만 터치 이벤트를 받지 않습니다. |
| `0` | `INACTIVE` | 비활성 화면. `react-freeze`에 의해 렌더링이 동결되고, `react-native-screens`에 의해 네이티브 뷰 계층에서 분리됩니다. |

이 방식으로 현재 보이지 않는 화면의 불필요한 리렌더링을 방지하고, 네이티브 뷰 계층의 부하를 줄입니다.

### FlatList 연동

`Transitions` 컴포넌트는 FlatList의 아이템으로 사용할 수 있어, stickyHeader와 함께 탭 기반 UI를 쉽게 구현할 수 있습니다. [example](../example/src/App.tsx)을 참고하세요.

## 설치

```sh
yarn add react-native-transitions react-native-screens react-freeze
```

또는

```sh
npm install react-native-transitions react-native-screens react-freeze
```

> `react-native-screens`의 네이티브 설정이 필요합니다. [react-native-screens 설치 가이드](https://github.com/software-mansion/react-native-screens#installation)를 참고하세요.

## 사용법

### 기본

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

자식을 함수로 전달하면 `activityState`, `priority`, `diff` 값을 받을 수 있습니다:

```tsx
<Transitions index={index} onIndexChange={setIndex}>
  {({ activityState, diff }) => <ScreenA activityState={activityState} />}
  {({ activityState, diff }) => <ScreenB activityState={activityState} />}
</Transitions>
```

### FlatList 연동

FlatList와 함께 사용하여 sticky 탭 바를 구현하는 예시입니다:

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

`animatedIndex`를 외부에서 전달하면 탭 인디케이터 애니메이션 등과 동기화할 수 있습니다.

## Props

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ScreenType[]` | *필수* | 전환할 화면 목록. ReactElement 또는 render function. |
| `index` | `number` | `0` | 현재 활성 화면의 인덱스. |
| `onIndexChange` | `(index: number) => void` | - | 스와이프로 인덱스가 변경될 때 호출됩니다. |
| `transitionType` | `'view' \| 'screens'` | `'screens'` | `'screens'`로 설정하면 `react-native-screens`의 `ScreenContainer`를 사용합니다. |
| `animationType` | `'slide' \| 'fade' \| 'fade-slide' \| 'none'` | `'slide'` | 전환 애니메이션 종류. |
| `swipeEnabled` | `boolean` | `true` | 스와이프 제스처 활성화 여부. |
| `vertical` | `boolean` | `false` | `true`로 설정하면 세로 방향으로 전환합니다. |
| `animatedIndex` | `Animated.Value` | - | 외부에서 애니메이션 인덱스를 제어할 때 사용합니다. 탭 인디케이터 동기화 등에 유용합니다. |
| `keepAlive` | `number` | `undefined` (무제한) | 마운트 상태를 유지할 최대 화면 수. 메모리 최적화에 사용합니다. |
| `freeze` | `boolean` | `true` | 비활성 화면에 `react-freeze`를 적용할지 여부. |
| `layout` | `{ width?: number; height?: number }` | - | 컨테이너 크기를 직접 지정합니다. 미지정 시 `onLayout`으로 자동 측정됩니다. |
| `style` | `StyleProp<ViewStyle>` | - | 컨테이너 스타일. |
| `onSwipeStart` | `() => void` | - | 스와이프 제스처가 시작될 때 호출됩니다. |
| `onSwipeEnd` | `(index: number) => void` | - | 스와이프 애니메이션이 완료된 후 호출됩니다. |
| `onLayout` | `(event: LayoutChangeEvent) => void` | - | 컨테이너 레이아웃 이벤트. |

## Ref 메서드

`ref`를 통해 명령형 메서드에 접근할 수 있습니다:

| 메서드 | Type | 설명 |
|---|---|---|
| `goTo` | `(index: number, animated?: boolean) => void` | 지정한 인덱스로 이동합니다. |
| `animatedIndex` | `Animated.Value` | 현재 애니메이션 인덱스 값. |

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
