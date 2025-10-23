import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

export default function EditVerseScreen({ route, navigation }) {
  const db = useSQLiteContext();
  const verse = route?.params?.verse || null;

  const [title, setTitle] = useState(verse?.title || "");
  const [author, setAuthor] = useState(verse?.author || "");
  const [content, setContent] = useState(verse?.content || "");
  const [pageNumber, setPageNumber] = useState(verse?.page_number?.toString() || "");
  const [tags, setTags] = useState(verse?.tags ? verse.tags.split(",") : []);

  if (!verse) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No verse data provided!</Text>
      </View>
    );
  }

  const updateVerse = async () => {
    if (!content.trim() || !title.trim()) {
      Alert.alert("Error", "Title and Content cannot be empty");
      return;
    }

    // Update titles table
    await db.runAsync(
      "UPDATE titles SET title = ?, author = ? WHERE id = ?",
      [title, author, verse.title_id]
    );

    // Update verses table
    await db.runAsync(
      "UPDATE verses SET content = ?, page_number = ?, tags = ? WHERE id = ?",
      [content, pageNumber ? parseInt(pageNumber) : null, tags, verse.id]
    );

    Alert.alert("Success", "Verse updated successfully", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Author:</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
      />

      <Text style={styles.label}>Content:</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Text style={styles.label}>Page Number:</Text>
      <TextInput
        style={styles.input}
        value={pageNumber}
        onChangeText={setPageNumber}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Tags (comma separated):</Text>
      <TextInput
        style={styles.input}
        value={tags}
        onChangeText={setTags}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Update Verse" onPress={updateVerse} color="#6200EE" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6", padding: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10, marginBottom: 5, color: "#4A148C" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#B39DDB", borderRadius: 8, padding: 10, fontSize: 16 }
});
