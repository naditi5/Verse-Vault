// ViewVersesByAuthorScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from '@expo/vector-icons';

export default function ViewAuthorsScreen({ navigation }) {
  const db = useSQLiteContext();
  const [authors, setAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all verses with author
  const fetchAuthors = async () => {
    const result = await db.getAllAsync(`
      SELECT id, author
      FROM titles
      ORDER BY id DESC
    `);
    setAuthors(result);
  };

  useEffect(() => { fetchAuthors(); }, []);

  // Filter based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAuthors(authors);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredAuthors(
        authors.filter(a =>
          (a.author && a.author.toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [searchQuery, authors]);


  // Toggle selection for bulk delete
  const toggleSelect = (id) => {
    setSelectedAuthors(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Delete a author
  const deleteAuthor = (author) => {
    Alert.alert("Delete Author", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        // Fetch all titles by this author
        const titlesByAuthor = await db.getAllAsync("SELECT id FROM titles WHERE author=?", [author]);
        const titleIds = titlesByAuthor.map(t => t.id);
        if (titleIds.length) {
          const placeholders = titleIds.map(() => "?").join(",");
          await db.runAsync(`DELETE FROM verses WHERE title_id IN (${placeholders})`, titleIds);
        }
        await db.runAsync("DELETE FROM titles WHERE author=?", [author]);
        fetchAuthors();
      }}
    ]);
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedAuthors.length === 0) return;
    Alert.alert("Delete Authors", `Delete ${selectedAuthors.length} selected?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const placeholders = selectedAuthors.map(() => "?").join(",");
        await db.runAsync("DELETE FROM verses WHERE author=?)", selectedAuthors);
        await db.runAsync("DELETE FROM titles WHERE author=?)", selectedAuthors);
        setSelectedAuthors([]);
        fetchAuthors();
      }}
    ]);
  };

  const renderItem = ({ item }) => (
      <TouchableOpacity
        style={[styles.card, selectedAuthors.includes(item.id) && { backgroundColor: "#E1BEE7" }]}
        onPress={() => navigation.navigate("ViewVersesByAuthor", { author: item.author })}
        onLongPress={() => toggleSelect(item.id)}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={styles.title}>{item.author}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteAuthor(item.author)}>
            <Ionicons name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  
    return (
      <View style={styles.container}>
  
        {/* Search Bar */}
        <TextInput
          placeholder="Search by author..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
  
        {selectedAuthors.length > 0 && (
          <View style={{ padding: 10 }}>
            <Button title={`Delete ${selectedAuthors.length} selected`} color="red" onPress={bulkDelete} />
          </View>
        )}
  
        <FlatList
          data={filteredAuthors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No authors yet. Add one!</Text>}
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
  