// File: App.tsx

import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Required for `expo-router` to work
export function App() {
    const ctx = require.context("./app");
    return (
        <SafeAreaProvider>
            <ExpoRoot context={ctx} />
        </SafeAreaProvider>
    );
}

registerRootComponent(App);
