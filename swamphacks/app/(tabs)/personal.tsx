import { StyleSheet } from "react-native";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function PersonalScreen() {
  return (
    // <ThemedView style={styles.titleContainer}>
    //         <ThemedText
    //           type="title"
    //           style={{
    //             fontFamily: Fonts.rounded,
    //           }}>
    //           Your Closet
    //         </ThemedText>
    //         <ThemedText type="title">Your Closet</ThemedText>
    //       </ThemedView>
    <ThemedView
        style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 24,
        }}
    >
    <ThemedText>Your Closet</ThemedText>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
        headerImage: {
            color: '#808080',
            bottom: -90,
            left: -35,
            position: 'absolute',
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
});