// app/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Immediately and idiomatically redirect to the tab group.
  return <Redirect href="(tabs)" />;
}
