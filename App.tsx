import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import PianoKeyboard from "./PianoKeyboard";
import { MidiProvider } from "./MidiProvider";

export default function App() {
  const onPressKey = (note: string) => {
    console.log("Key pressed:", note);
  };

  return (
    <MidiProvider>
      <View style={styles.container}>
        <PianoKeyboard onPressKey={onPressKey} />
        <StatusBar style="auto" />
      </View>
    </MidiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
