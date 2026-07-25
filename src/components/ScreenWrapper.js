// src/components/ScreenWrapper.jsx
//
// Usage:
//   import ScreenWrapper from '../components/ScreenWrapper';
//
//   <ScreenWrapper>
//     ... your screen content ...
//   </ScreenWrapper>
//
// Props:
//   style        – extra styles on the outer View
//   edges        – which safe-area edges to apply (default: all four)
//   bg           – background color (default: '#F7F7F9')

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenWrapper({
  children,
  style,
  bg = '#F7F7F9',
  edges = ['top', 'bottom', 'left', 'right'],
}) {
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop:    edges.includes('top')    && insets.top    > 0 ? insets.top    : 0,
    paddingBottom: edges.includes('bottom') && insets.bottom > 0 ? insets.bottom : 0,
    paddingLeft:   edges.includes('left')   && insets.left   > 0 ? insets.left   : 0,
    paddingRight:  edges.includes('right')  && insets.right  > 0 ? insets.right  : 0,
  };

  return (
    <View style={[s.root, { backgroundColor: bg }, padding, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});