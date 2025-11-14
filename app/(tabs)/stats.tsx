import React from 'react';
import { View, Text } from 'react-native';

import SafeScreen from '../../components/SafeScreen';

export default function StatsScreen() {
    return (
        <SafeScreen>
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Stats</Text>
            </View>


            <View style={{ padding: 16 }}>
                <View style={{ height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Circular Progress Placeholder</Text>
                </View>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                    <View style={{ flex: 1, marginRight: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12 }}>
                        <Text>Current Streak</Text>
                        <Text style={{ fontSize: 20, fontWeight: '700' }}>3</Text>
                    </View>


                    <View style={{ flex: 1, marginLeft: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12 }}>
                        <Text>Longest Streak</Text>
                        <Text style={{ fontSize: 20, fontWeight: '700' }}>7</Text>
                    </View>
                </View>


                <View style={{ marginTop: 12, height: 120, borderWidth: 1, borderColor: '#eee', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Bar Chart Placeholder — Last 7 Days</Text>
                </View>


                <View style={{ marginTop: 12 }}>
                    <Text>Most consistent: [habit chip] — Least consistent: [habit chip]</Text>
                </View>
            </View>
        </SafeScreen>
    );
}