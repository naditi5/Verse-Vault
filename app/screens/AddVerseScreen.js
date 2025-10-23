import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity, Text } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

export default function AddVerseScreen({ navigation }) {
  const db = useSQLiteContext();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState("");
  const [pageNumber, setPageNumber] = useState("");

  // Fetch suggestions from database as user types
  useEffect(() => {
    if (title) {
      db.getAllAsync("SELECT DISTINCT title FROM titles WHERE title LIKE ? LIMIT 5;", [`%${title}%`])
        .then(res => setTitleSuggestions(res.map(r => r.title)));
    } else setTitleSuggestions([]);
  }, [title]);

  useEffect(() => {
    if (author) {
      db.getAllAsync("SELECT DISTINCT author FROM titles WHERE author LIKE ? LIMIT 5;", [`%${author}%`])
        .then(res => setAuthorSuggestions(res.map(r => r.author)));
    } else setAuthorSuggestions([]);
  }, [author]);

  const addTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addVerse = async () => {
    if (!title || !content) {
      Alert.alert("Missing Fields", "Please fill in title and content.");
      return;
    }

    const pageNumInt = parseInt(pageNumber) || 1; // you can add input
    const dateTime = new Date().toISOString();
    const tagsStr = tags.join(",");

    // Check if title exists
    let titleRecord = await db.getFirstAsync("SELECT id FROM titles WHERE title = ? and author = ?", [title, author]);
    
    let titleId;
    
    if (titleRecord != null) {
      titleId = titleRecord.id;
    //   if (!titleRecord.author && author) {
    //     await db.runAsync("UPDATE titles SET author=? WHERE id=?", [author, titleId]);
    //   }
      console.log("Found existing Title ID:", titleId);
    } else {
      const result = await db.runAsync("INSERT INTO titles (title, author) VALUES (?, ?);", [title, author]);
      const resId = await db.getFirstAsync("SELECT last_insert_rowid() as id;");
      titleId = resId.id;
      console.log("Inserted Title ID:", resId.id, " ", resId);
    }

    // Insert verse
    await db.runAsync(
      "INSERT INTO verses (title_id, content, page_number, date_time, tags) VALUES (?, ?, ?, ?, ?);",
      [titleId, content, pageNumInt, dateTime, tagsStr]
    );

    Alert.alert("Success!", "Verse added successfully.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      {/* Title suggestions */}
      {titleSuggestions.length > 0 && (
        <FlatList
          data={titleSuggestions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setTitle(item); setTitleSuggestions([]); }}>
              <Text style={styles.suggestion}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        placeholder="Enter author"
        value={author}
        onChangeText={setAuthor}
        style={styles.input}
      />
      {/* Author suggestions */}
      {authorSuggestions.length > 0 && (
        <FlatList
          data={authorSuggestions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setAuthor(item); setAuthorSuggestions([]); }}>
              <Text style={styles.suggestion}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        placeholder="Page number"
        value={pageNumber}
        onChangeText={setPageNumber}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Enter verse content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
        style={[styles.input, { height: 120 }]}
      />

      {/* Tags input */}
      <View style={{ flexDirection: "row", marginBottom: 10, flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <TouchableOpacity key={tag} onPress={() => removeTag(tag)} style={styles.tag}>
            <Text style={{ color: "#fff" }}>{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", marginBottom: 15 }}>
        <TextInput
          placeholder="Add tag"
          value={inputTag}
          onChangeText={setInputTag}
          style={[styles.input, { flex: 1, marginRight: 5 }]}
        />
        <Button title="Add" onPress={addTag} color="#6200EE" />
      </View>

      <Button title="Save Verse" onPress={addVerse} color="#6200EE" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#EDE7F6" },
  input: { borderWidth: 1, borderColor: "#B39DDB", backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 10 },
  suggestion: { padding: 8, backgroundColor: "#D1C4E9", marginBottom: 2, borderRadius: 5 },
  tag: { backgroundColor: "#6200EE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 5, marginBottom: 5 },
});
