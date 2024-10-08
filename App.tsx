import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Linking } from "react-native";
import PianoKeyboard from "./PianoKeyboard";
import { MidiProvider } from "./MidiProvider";
import { useState } from "react";

export default function App() {
  const [keyPressed, setKeyPressed] = useState<string[]>([]);
  const onPressKey = (note: string) => {
    console.log("Key pressed:", note);
    setKeyPressed((prev) => [...prev, note]);
  };

  const onLink1 = () => {
    Linking.openURL("https://www.onlinepianist.com/virtual-piano");
  };

  const onLink2 = () => {
    Linking.openURL("https://tonejs.github.io/");
  };

  return (
    <MidiProvider>
      <View style={styles.container}>
        <Text style={styles.title}>React Native Piano KeyBoard</Text>
        <Text style={styles.piano}>🎹</Text>
        <Text style={styles.description}>
          Get inspired from{" "}
          <Text style={styles.link} onPress={onLink1}>
            ONLINE PIANIST
          </Text>
        </Text>
        <Text style={styles.description}>
          Sounds by{" "}
          <Text style={styles.link} onPress={onLink2}>
            Tone.js
          </Text>
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.keylog}>Key pressed: {keyPressed.join(", ")}</Text>
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
  },
  title: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 80,
  },
  piano: {
    fontSize: 80,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
  keylog: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
});
