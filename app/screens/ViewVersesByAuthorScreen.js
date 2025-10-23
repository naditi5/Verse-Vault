// ViewVersesByAuthorScreen.js
import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Button, Alert 
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from '@expo/vector-icons';

export default function ViewVersesByAuthorScreen({ route }) {
  const { author } = route.params;
  const db = useSQLiteContext();

  const [verses, setVerses] = useState([]);
  const [filteredVerses, setFilteredVerses] = useState([]);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all verses by author
  const fetchVerses = async () => {
    const result = await db.getAllAsync(`
      SELECT v.id, v.content, v.page_number, v.date_time, v.tags, t.title
      FROM verses v
      JOIN titles t ON v.title_id = t.id
      WHERE t.author = ?
      ORDER BY v.date_time DESC
    `, [author]);
    setVerses(result);
    setFilteredVerses(result);
  };

  useEffect(() => { fetchVerses(); }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredVerses(verses);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredVerses(
        verses.filter(v =>
          (v.content && v.content.toLowerCase().includes(lowerQuery)) ||
          (v.tags && v.tags.toLowerCase().includes(lowerQuery)) ||
          (v.page_number && v.page_number.toString().includes(lowerQuery)) ||
          (v.title && v.title.toLowerCase().includes(lowerQuery)) ||
          (v.date_time && new Date(v.date_time).toLocaleString().toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [searchQuery, verses]);

  // Toggle verse selection for bulk delete
  const toggleSelect = (id) => {
    setSelectedVerses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Delete single verse
  const deleteVerse = (id) => {
    Alert.alert("Delete Verse", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await db.runAsync("DELETE FROM verses WHERE id=?", [id]);
        fetchVerses();
      }}
    ]);
  };

  // Bulk delete
  const bulkDelete = () => {
    if (!selectedVerses.length) return;
    Alert.alert("Delete Verses", `Delete ${selectedVerses.length} selected?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const placeholders = selectedVerses.map(() => "?").join(",");
        await db.runAsync(`DELETE FROM verses WHERE id IN (${placeholders})`, selectedVerses);
        setSelectedVerses([]);
        fetchVerses();
      }}
    ]);
  };

  const renderItem = ({ item }) => {
    const tagsArray = item.tags ? item.tags.split(",") : [];
    return (
      <TouchableOpacity 
        style={[styles.card, selectedVerses.includes(item.id) && { backgroundColor: "#E1BEE7" }]}
        onLongPress={() => toggleSelect(item.id)}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={() => deleteVerse(item.id)}>
            <Ionicons name="trash" size={20} color="red" />
          </TouchableOpacity>
        </View>
        <Text style={styles.content}>{item.content}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
          <Text style={styles.page}>Page {item.page_number || "-"}</Text>
          <Text style={styles.date}>{item.date_time ? new Date(item.date_time).toLocaleString() : ""}</Text>
        </View>
        <View style={styles.tagsContainer}>
          {tagsArray.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search by title, content, tags, page, or date"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {/* Bulk Delete */}
      {selectedVerses.length > 0 && (
        <View style={{ padding: 10 }}>
          <Button title={`Delete ${selectedVerses.length} selected`} color="red" onPress={bulkDelete} />
        </View>
      )}

      <FlatList
        data={filteredVerses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No verses by this author yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6", padding: 10 },
  searchInput: { borderWidth: 1, borderColor: "#B39DDB", backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 8, borderRadius: 10, borderColor: "#D1C4E9", borderWidth: 1 },
  title: { fontWeight: "bold", fontSize: 16, color: "#4A148C" },
  content: { fontSize: 16, marginVertical: 5 },
  page: { fontSize: 14, color: "#757575" },
  date: { fontSize: 12, color: "#757575" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: { backgroundColor: "#6200EE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 5, marginTop: 5 },
  tagText: { color: "#fff", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#757575" },
});
