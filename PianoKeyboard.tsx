import { Audio } from "expo-av";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { Note } from "tonal";

import { Sounds } from "./Sounds";
import { isWeb } from "./utils";

type TPianoKey = {
  isWhite: boolean;
  midi: number;
  note: string;
  left: number;
};

type TKeyboardState = {
  width: number;
  keys: TPianoKey[];
};

interface IPianoKeyboardProps {
  startKey?: string; // Start key note of the keyboard, ex: C0
  endKey?: string; // End key note of the keyboard, ex: C4
}

// White key image w : h = 107 : 621
const NOTE_WHITE_WIDTH = 31;
const NOTE_WHITE_HEIGHT = 180;
// Black key image w : h = 73 : 404
const NOTE_BLACK_WIDTH = 21.7;
const NOTE_BLACK_HEIGHT = 120;

const PianoKeyboard: React.FC<IPianoKeyboardProps> = ({
  startKey = "C0", // default to C0
  endKey = "C4", // default to C4
}) => {
  const [pianoKeys, setPianoKeys] = useState<TPianoKey[]>([]);
  const [keyboardMetric, setKeyboardMetric] = useState({ width: 0, height: 0 });
  const { width: windowWidth } = useWindowDimensions();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const getOffset = (noteName: string) => {
    var offset = 0;
    switch (noteName[0]) {
      case "D":
        offset = 3.5;
        break;
      case "E":
        offset = -4;
        break;
      case "G":
        offset = 3;
        break;
      case "A":
        offset = 0;
        break;
      case "B":
        offset = -4;
        break;
    }
    return NOTE_BLACK_WIDTH / 2 + offset;
  };

  const getKey = (midi: number, width: number) => {
    const noteName = Note.fromMidi(midi);

    const isChromatic = Note.accidentals(noteName);

    if (isChromatic) {
      return {
        width: 0,
        key: {
          isWhite: false,
          midi: midi,
          note: noteName,
          left: width - getOffset(noteName),
        },
      };
    } else {
      return {
        width: NOTE_WHITE_WIDTH,
        key: {
          isWhite: true,
          midi: midi,
          note: noteName,
          left: width,
        },
      };
    }
  };

  const initializeKeyboard = () => {
    // Convert startKey and endKey to MIDI note numbers
    const startMidi = Note.midi(startKey);
    const endMidi = Note.midi(endKey);

    // Create an array of MIDI note numbers from startMidi to endMidi
    const midiRange = [...Array(endMidi! - startMidi!).keys()].map(
      (_, index) => startMidi! + index
    );

    // Reduce the midiRange array to build the keyboard state
    const { width, keys } = midiRange.reduce<TKeyboardState>(
      (keyboard, midi) => {
        var keys = [...keyboard.keys]; // Create a copy of the current keys array

        // Get the width and key information for the current MIDI note
        const { width, key } = getKey(midi, keyboard.width);

        // Add the new key to the keys array
        keys.push(key);

        // Return the updated state with the new width and keys array
        return {
          width: keyboard.width + width,
          keys: keys,
        };
      },
      { width: 0, keys: [] } // Initial state
    );

    setPianoKeys(keys);
    setKeyboardMetric({ width: width, height: NOTE_WHITE_HEIGHT });
  };

  useEffect(() => {
    initializeKeyboard();
  }, []);

  const getKeyImage = (key: TPianoKey, pressed: boolean) => {
    var image: ImageSourcePropType | undefined = undefined;

    if (key.isWhite) {
      switch (key.note[0]) {
        case "A":
          image = pressed
            ? require("./assets/images/A_pressed.png")
            : require("./assets/images/A.png");
          break;
        case "B":
          image = pressed
            ? require("./assets/images/B_pressed.png")
            : require("./assets/images/B.png");
          break;
        case "C":
          image = pressed
            ? require("./assets/images/C_pressed.png")
            : require("./assets/images/C.png");
          break;
        case "D":
          image = pressed
            ? require("./assets/images/D_pressed.png")
            : require("./assets/images/D.png");
          break;
        case "E":
          image = pressed
            ? require("./assets/images/E_pressed.png")
            : require("./assets/images/E.png");
          break;
        case "F":
          image = pressed
            ? require("./assets/images/F_pressed.png")
            : require("./assets/images/F.png");
          break;
        case "G":
          image = pressed
            ? require("./assets/images/G_pressed.png")
            : require("./assets/images/G.png");
          break;
      }
    } else {
      image = pressed
        ? require("./assets/images/Black_pressed.png")
        : require("./assets/images/Black.png");
    }

    return image;
  };

  const onPressKeyIn = (key: TPianoKey) => async () => {
    if (Sounds[key.note]) {
      const { sound: _sound } = await Audio.Sound.createAsync(Sounds[key.note]);
      setSound(_sound);
      await _sound.replayAsync();
      setTimeout(() => {
        _sound.unloadAsync();
      }, 3000);
    }
  };

  const onPressKeyOut = () => async () => {
    setTimeout(() => {
      if (sound?._loaded) {
        sound?.stopAsync();
      }
    }, 200);
  };

  const renderPianoKey = (key: TPianoKey, index: number): JSX.Element => {
    const width = key.isWhite ? NOTE_WHITE_WIDTH : NOTE_BLACK_WIDTH;
    const height = key.isWhite ? NOTE_WHITE_HEIGHT : NOTE_BLACK_HEIGHT;

    const keyStyle: StyleProp<ViewStyle> = {
      left: key.left,
      width,
      height,
      zIndex: key.isWhite ? 1 : 5,
    };

    return (
      <Pressable
        key={index.toString()}
        style={[styles.key, keyStyle]}
        // onPress={() => onPressKey(key.note)}
        onPressIn={onPressKeyIn(key)}
        onPressOut={onPressKeyOut()}
        android_disableSound
      >
        {({ pressed }) => (
          <View style={styles.keyContent}>
            <Image style={styles.keyImage} source={getKeyImage(key, pressed)} />
            <Text style={styles.keyNote}>{key.isWhite ? key.note : ""}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        style={[styles.topImage]}
        source={require("./assets/images/Top.png")}
        contentFit="fill"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View
          style={{ width: keyboardMetric.width, height: keyboardMetric.height }}
        >
          {pianoKeys.map(renderPianoKey)}
        </View>
      </ScrollView>
      <View style={styles.bottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
  },
  topImage: {
    height: 60,
  },
  scrollView: {
    alignSelf: "center",
  },
  key: {
    position: "absolute",
    borderRightWidth: 0,
  },
  keyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  keyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  keyNote: {
    marginBottom: 5,
    userSelect: "none",
  },
  bottom: {
    height: 10,
    backgroundColor: "#1A1A1A",
  },
});

export default PianoKeyboard;
