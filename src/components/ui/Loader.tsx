import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

type LoaderProps = {
  color: string;
  size?: number;
};

type OrbitDotProps = LoaderProps & {
  size: number;
  index: number;
  progress: SharedValue<number>;
};

function OrbitDot({ color, size, index, progress }: OrbitDotProps) {
  const diameter = size * 0.26;
  const radius = size * 0.3;
  const offset = (index * Math.PI * 2) / 3;

  const animatedStyle = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2 + offset;
    const scale = 0.72 + Math.sin(angle + (index * Math.PI) / 3 + 100) * 0.28;

    return {
      transform: [
        { translateX: Math.cos(angle) * radius },
        { translateY: Math.sin(angle) * radius },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      className="absolute"
      style={[
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

const items = [0, 1, 2];

export function Loader({ color, size = 22 }: LoaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  return (
    <View
      className="items-center justify-center"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ width: size, height: size }}
    >
      {items.map((index) => (
        <OrbitDot
          key={index}
          index={index}
          color={color}
          size={size}
          progress={progress}
        />
      ))}
    </View>
  );
}
