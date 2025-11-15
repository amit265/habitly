import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import SafeScreen from '../../components/SafeScreen';


export default function HomeScreen() {
    return (
        <SafeScreen>
            <View style={{ paddingHorizontal: 12}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>Habitly</Text>
                    <Pressable onPress={() => { /* open settings route */ }}>
                        <Text style={{ fontSize: 20 }}>⚙️</Text>
                    </Pressable>
                </View>


                <View style={{ marginTop: 12 }}>
                    <Text style={{ color: '#666' }}>Tuesday, Nov 12</Text>
                    <Text style={{ fontSize: 16, marginTop: 6 }}>Good Morning, Amit 👋</Text>
                </View>
            </View>


            {/* List area (block-level placeholders) */}
            <View style={{ padding: 16, flex: 1 }}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={{
                        borderWidth: 1,
                        borderColor: '#eee',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        backgroundColor: '#fff',
                    }}>
                        <Text style={{ marginBottom: 8 }}>Habit Card ({i}) — block placeholder</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text>Emoji • Name • Goal • Reminder • Streak</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text>✅</Text>
                                <Text>⏭️</Text>
                                <Text>➗</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </SafeScreen>
    );
}