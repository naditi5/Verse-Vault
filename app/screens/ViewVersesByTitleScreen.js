import React, {useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Button, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from '@expo/vector-icons';

export default function ViewVersesByTitleScreen({ route }) {
  const { titleId } = route.params;
  const db = useSQLiteContext();
  const [verses, setVerses] = useState([]);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [filteredVerses, setFilteredVerses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  
  const fetchVerses = async () => {
    const result = await db.getAllAsync(`
      SELECT id, content, page_number, date_time, tags
      FROM verses
      WHERE title_id = ?
      ORDER BY date_time ${sortOrder}
    `, [titleId]);
    setVerses(result);
    setFilteredVerses(result);

    // Extract unique tags
    const allTags = result.flatMap(v => v.tags ? v.tags.split(",") : []);
    const uniqueTags = Array.from(new Set(allTags));
    setTags(uniqueTags);
  };

  useEffect(() => { fetchVerses(); }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredVerses(verses);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredVerses(
        verses.filter(v => v.content.toLowerCase().includes(lowerQuery) || (v.tags && v.tags.toLowerCase().includes(lowerQuery)) || (v.page_number && v.page_number.toString().includes(lowerQuery)) || (v.date_time && new Date(v.date_time).toLocaleString().toLowerCase().includes(lowerQuery)))
      );
    }
  }, [searchQuery, verses]);

  useEffect(() => {
  if (selectedTag === null) {
    setFilteredVerses(verses);
  } else {
    setFilteredVerses(
      verses.filter(v => v.tags && v.tags.split(",").includes(selectedTag))
    );
  }
}, [selectedTag, verses]);

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedVerses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  //toggle sort order
  const toggleSort = async () => {
    const newOrder = sortOrder === "DESC" ? "ASC" : "DESC";
    setSortOrder(newOrder);
    const result = await db.getAllAsync(`
      SELECT id, content, page_number, date_time, tags
      FROM verses
      WHERE title_id = ?
      ORDER BY date_time ${newOrder}
    `, [titleId]);
    setVerses(result);
    setFilteredVerses(result);
  };

  const deleteVerse = (id) => {
    Alert.alert("Delete Verse", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await db.runAsync("DELETE FROM verses WHERE id=?", [id]);
        fetchVerses();
      }}
    ]);
  };

  const bulkDelete = () => {
      if (selectedVerses.length === 0) return;
      Alert.alert("Delete Verses", `Are you sure you want to delete ${selectedVerses.length} verses?`, [
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.content}>{item.content}</Text>
            <TouchableOpacity onPress={() => deleteVerse(item.id)}>
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
        </View>
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

      {/* Search Bar + Sort Icon */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by content, tags, page number, or date"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={toggleSort} style={styles.sortIcon}>
          <Ionicons
            name={sortOrder === "DESC" ? "arrow-down" : "arrow-up"}
            size={22}
            color="#6200EE"
          />
        </TouchableOpacity>
      </View>

      {/* Bulk Delete Button */}
      {selectedVerses.length > 0 && (
        <View style={{ padding: 10 }}>
            <Button title={`Delete ${selectedVerses.length} selected`} color="red" onPress={bulkDelete} />
          </View>
      )}

      {/* Horizontal Tag Scroll */}
      <View style={{ paddingVertical : 5, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <TouchableOpacity
            style={[styles.filterTag, selectedTag === null && { backgroundColor: "#6200EE" }]}
            onPress={() => setSelectedTag(null)}
          >
            <Text style={{ color: selectedTag === null ? "#fff" : "#6200EE" }}>All</Text>
          </TouchableOpacity>
          {tags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterTag, selectedTag === tag && { backgroundColor: "#6200EE" }]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={{ color: selectedTag === tag ? "#fff" : "#6200EE" }}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredVerses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No verses for this title yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6", padding: 10 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 8, borderRadius: 10, borderColor: "#D1C4E9", borderWidth: 1 },
  content: { fontSize: 16 },
  page: { fontSize: 14, color: "#757575" },
  date: { fontSize: 12, color: "#757575" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: { backgroundColor: "#6200EE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 5, marginTop: 5 },
  tagText: { color: "#fff", fontSize: 12 },
  filterTag: {
    borderWidth: 1,
    borderColor: "#6200EE",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B39DDB",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  sortIcon: {
    paddingLeft: 8,
  },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#757575" },
});