import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import SafeScreen from '../../components/SafeScreen';

export default function AddHabitScreen() {
    return (
        <SafeScreen>
            <View style={{ paddingVertical: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>{'<'} Back</Text>
            </View>


            <View style={{ marginTop: 8 }}>
                <TextInput placeholder="Habit name" style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12 }} />


                <View style={{ marginTop: 12 }}>
                    <Text>Emoji Picker Row / Button</Text>
                </View>


                <View style={{ marginTop: 12 }}>
                    <Text style={{ marginBottom: 8 }}>Goal</Text>
                    <Text> ( ) Simple Done ( ) Time Based ( ) Count Based </Text>
                </View>


                <View style={{ marginTop: 12 }}>
                    <Text>Repeat Days: [Su] [Mo] [Tu] [We] [Th] [Fr] [Sa]</Text>
                </View>


                <View style={{ marginTop: 12 }}>
                    <Text>Reminder: [ Toggle ] [ Time Picker ]</Text>
                </View>
            </View>


            <View style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
                <Pressable style={{ backgroundColor: '#111', padding: 14, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>SAVE HABIT</Text>
                </Pressable>
            </View>
        </SafeScreen>
    );
}