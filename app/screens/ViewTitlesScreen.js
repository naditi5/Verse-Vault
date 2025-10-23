import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Button, TextInput } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from '@expo/vector-icons'; // for delete icon

export default function ViewTitlesScreen({ navigation }) {
  const db = useSQLiteContext();
  const [titles, setTitles] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]); // for bulk delete
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTitles = async () => {
    const result = await db.getAllAsync(`
      SELECT id, title, author
      FROM titles
      ORDER BY id DESC
    `);
    setTitles(result);
  };

  useEffect(() => { fetchTitles(); }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTitles(titles); // show all if search is empty
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredTitles(
        titles.filter(t => t.title.toLowerCase().includes(lowerQuery) || (t.author && t.author.toLowerCase().includes(lowerQuery)))
      );
    }
  }, [searchQuery, titles]);

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedTitles(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Delete single title
  const deleteTitle = (id) => {
    Alert.alert("Delete Title", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await db.runAsync("DELETE FROM verses WHERE title_id=?", [id]); // delete related verses
        await db.runAsync("DELETE FROM titles WHERE id=?", [id]);
        fetchTitles();
      }}
    ]);
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedTitles.length === 0) return;
    Alert.alert("Delete Titles", `Are you sure you want to delete ${selectedTitles.length} titles?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const placeholders = selectedTitles.map(() => "?").join(",");
        await db.runAsync(`DELETE FROM verses WHERE title_id IN (${placeholders})`, selectedTitles);
        await db.runAsync(`DELETE FROM titles WHERE id IN (${placeholders})`, selectedTitles);
        setSelectedTitles([]);
        fetchTitles();
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, selectedTitles.includes(item.id) && { backgroundColor: "#E1BEE7" }]}
      onPress={() => navigation.navigate("ViewVersesByTitle", { titleId: item.id, title: item.title })}
      onLongPress={() => toggleSelect(item.id)}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          {item.author ? <Text style={styles.author}>by {item.author}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => deleteTitle(item.id)}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <TextInput
        placeholder="Search by title or author..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {selectedTitles.length > 0 && (
        <View style={{ padding: 10 }}>
          <Button title={`Delete ${selectedTitles.length} selected`} color="red" onPress={bulkDelete} />
        </View>
      )}

      <FlatList
        data={filteredTitles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No titles yet. Add one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6", padding: 10 },
  searchInput: { borderWidth: 1, borderColor: "#B39DDB", backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 8, borderRadius: 10, borderColor: "#D1C4E9", borderWidth: 1 },
  title: { fontWeight: "bold", fontSize: 18, color: "#4A148C" },
  author: { fontSize: 14, color: "#6A1B9A", marginTop: 4 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#757575" },
});
