// app/settings.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import SafeScreen from "../components/SafeScreen";

const STORAGE_KEY_DARK = "habitly:settings:darkMode_v1";
const STORAGE_KEY_LANGUAGE = "habitly:settings:language_v1";
const STORAGE_KEY_NOTIFS = "habitly:settings:notifications_v1";

// small languages list (expandable)
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "id", label: "Bahasa Indonesia" },
];

export default function SettingsScreen() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawDark, rawLang, rawNotifs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_DARK),
          AsyncStorage.getItem(STORAGE_KEY_LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEY_NOTIFS),
        ]);
        if (!mounted) return;
        setDarkMode(coerceBool(rawDark, false));
        setLanguage(rawLang ?? "en");
        setNotificationsEnabled(coerceBool(rawNotifs, true));
      } catch (err) {
        console.warn("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // helpers
  function coerceBool(v: string | null, fallback: boolean) {
    if (v === null) return fallback;
    const s = String(v).trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "1") return true;
    if (s === "0") return false;
    return fallback;
  }

  async function setDarkAndSave(v: boolean) {
    setDarkMode(v);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DARK, JSON.stringify(v));
    } catch (err) {
      console.warn("Failed to save dark mode", err);
    }
  }

  async function setLanguageAndSave(code: string) {
    setLanguage(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, code);
    } catch (err) {
      console.warn("Failed to save language", err);
    }
  }

  async function setNotificationsAndSave(v: boolean) {
    setNotificationsEnabled(v);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(v));
      // optional: integrate expo-notifications permission + scheduling here later
    } catch (err) {
      console.warn("Failed to save notifications", err);
    }
  }

  function openLanguagePicker() {
    // simple in-app picker using Alert for quick implementation
    Alert.alert(
      "Choose language",
      undefined,
      LANGUAGES.map((L) => ({
        text: L.label,
        onPress: () => setLanguageAndSave(L.code),
      })).concat({ text: "Cancel", style: "cancel" })
    );
  }

  function handleSignIn() {
    // placeholder — wire real OAuth later
    Alert.alert("Sign in", "Sign in with Google is not wired yet. Implement OAuth flow when ready.");
  }

  function handleManageNotifications() {
    // placeholder - later open a detailed notifications screen or system settings
    Alert.alert(
      "Manage Notifications",
      "Notification scheduling and channel settings can be implemented using expo-notifications. Open system notification settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            // on Android you could open system settings. For now we navigate to a placeholder screen (if you add it).
            // router.push("/manage-notifications");
            Alert.alert("Not implemented", "System settings integration not configured in this demo.");
          },
        },
      ]
    );
  }

  function handleAbout() {
    Alert.alert(
      "About Habitly",
      "Habitly — a minimal habit tracker.\n\nMade with ❤️.\nVersion: 0.1 (dev)",
      [{ text: "Close" }]
    );
  }

  async function handleLogout() {
    Alert.alert(
      "Clear local data",
      "This will remove all local habits and settings from this device. This cannot be undone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              // clear only known keys to be safe
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter((k) =>
                k.startsWith("habitly:") || k.startsWith("expo.") // adjust as necessary
              );
              if (keysToRemove.length > 0) await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert("Cleared", "Local data cleared.");
              // navigate home / onboarding
              router.replace("/(tabs)");
            } catch (err) {
              console.error("Failed to clear data", err);
              Alert.alert("Failed to clear data. Try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  if (loading) {
    return (
      <SafeScreen>
        <Text style={{ padding: 16 }}>Loading settings…</Text>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={s.container}>
        <Text style={s.title}>Settings</Text>

        <View style={s.row}>
          <View>
            <Text style={s.rowTitle}>Dark mode</Text>
            <Text style={s.rowSubtitle}>Toggle app theme</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkAndSave} />
        </View>

        <TouchableOpacity style={s.rowTouchable} onPress={openLanguagePicker}>
          <View>
            <Text style={s.rowTitle}>Language</Text>
            <Text style={s.rowSubtitle}>{LANGUAGES.find((l) => l.code === language)?.label ?? language}</Text>
          </View>
          <Text style={s.chev}>›</Text>
        </TouchableOpacity>

        <View style={s.row}>
          <View>
            <Text style={s.rowTitle}>Notifications</Text>
            <Text style={s.rowSubtitle}>Allow reminders from Habitly</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsAndSave} />
        </View>

        <TouchableOpacity style={s.rowTouchable} onPress={handleManageNotifications}>
          <View>
            <Text style={s.rowTitle}>Manage notifications</Text>
            <Text style={s.rowSubtitle}>Schedule, channels, and quiet hours</Text>
          </View>
          <Text style={s.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.rowTouchable} onPress={handleSignIn}>
          <View>
            <Text style={s.rowTitle}>Sign in with Google</Text>
            <Text style={s.rowSubtitle}>Optional: sync your habits to the cloud</Text>
          </View>
          <Text style={s.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.rowTouchable} onPress={handleAbout}>
          <View>
            <Text style={s.rowTitle}>About Habitly</Text>
            <Text style={s.rowSubtitle}>Version, legal, and credits</Text>
          </View>
          <Text style={s.chev}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Clear local data</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowTouchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  rowSubtitle: { fontSize: 13, color: "#666", marginTop: 4 },
  chev: { fontSize: 22, color: "#999" },
  logoutBtn: {
    marginTop: 14,
    backgroundColor: "#e53935",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
