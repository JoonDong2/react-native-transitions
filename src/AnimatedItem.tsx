import { isValidElement, memo, useMemo } from 'react';
import { Animated } from 'react-native';
import { Screen } from 'react-native-screens';
import { Freeze } from 'react-freeze';
import { ActivityState, type AnimatedItemProps } from './types';
import { styles } from './styles';

const AnimatedScreen = Animated.createAnimatedComponent(Screen);

export const AnimatedItem = memo(
  ({
    children,
    itemIndex,
    animatedIndex,
    isActive,
    offset,
    animationType,
    activityState,
    priority,
    vertical,
    containerSize,
    useNativeScreens = true,
    freeze = true,
  }: AnimatedItemProps) => {
    const effectiveIndex = useMemo(
      () => Animated.add(itemIndex, offset),
      [itemIndex, offset]
    );
    const diff = useMemo(
      () => Animated.subtract(effectiveIndex, animatedIndex),
      [effectiveIndex, animatedIndex]
    );

    const animatedStyle = useMemo(() => {
      if (animationType === 'none') return {};

      const style:
        | {
            opacity?: Animated.AnimatedInterpolation<number>;
            transform?: {
              translateX: Animated.AnimatedInterpolation<number>;
            }[];
          }
        | {
            opacity?: Animated.AnimatedInterpolation<number>;
            transform?: {
              translateY: Animated.AnimatedInterpolation<number>;
            }[];
          } = {};

      if (animationType === 'fade' || animationType === 'fade-slide') {
        style.opacity = diff.interpolate({
          inputRange: [-1, -0.5, 0, 0.5, 1],
          outputRange: [0, 0.5, 1, 0.5, 0],
          extrapolate: 'clamp',
        });
      }

      if (animationType === 'slide' || animationType === 'fade-slide') {
        const translate = Animated.multiply(diff, containerSize);
        if (vertical) {
          style.transform = [{ translateY: translate }];
        } else {
          style.transform = [{ translateX: translate }];
        }
      }

      return style;
    }, [animationType, diff, containerSize, vertical]);

    const containerStyle = {
      zIndex: priority,
      [vertical ? 'height' : 'width']: containerSize,
    };

    const commonStyle = [
      !isActive && styles.inactiveItem,
      animatedStyle,
      styles.itemContainer,
      containerStyle,
    ];

    const childContent = isValidElement(children)
      ? children
      : children({ activityState, priority, diff });

    const shouldFreeze = freeze && activityState !== ActivityState.FULL_ACTIVE;

    if (useNativeScreens) {
      return (
        <AnimatedScreen
          shouldFreeze={shouldFreeze}
          activityState={activityState}
          style={commonStyle}
          pointerEvents={
            activityState === ActivityState.FULL_ACTIVE ? 'auto' : 'none'
          }
        >
          {childContent}
        </AnimatedScreen>
      );
    }

    return (
      <Freeze freeze={shouldFreeze}>
        <Animated.View
          style={commonStyle}
          pointerEvents={activityState === 2 ? 'auto' : 'none'}
        >
          {childContent}
        </Animated.View>
      </Freeze>
    );
  }
);
