import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

export default function ViewVersesScreen() {
  const db = useSQLiteContext();
  const [verses, setVerses] = useState([]);

  const fetchVerses = async () => {
    const result = await db.getAllAsync(`
      SELECT v.id, t.title, t.author, v.content, v.page_number, v.date_time, v.tags
      FROM verses v
      JOIN titles t ON v.title_id = t.id
      ORDER BY v.id DESC;
    `)
    setVerses(result);
  };

  // Fetch verses when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchVerses();
    }, [])
  );

  useEffect(() => {
    fetchVerses();
  }, []);

  const renderItem = ({ item }) => {
    const tagsArray = item.tags ? item.tags.split(",") : [];
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.page}>Page {item.page_number || "-"}</Text>
        </View>
        {item.author ? <Text style={styles.author}>by {item.author}</Text> : null}
        <Text style={styles.content}>{item.content}</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tagsArray.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Date & Time */}
        <Text style={styles.dateTime}>
          {item.date_time ? new Date(item.date_time).toLocaleString() : ""}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No verses yet. Add one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE7F6",
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    borderColor: "#D1C4E9",
    borderWidth: 1,
  },
  title: { fontWeight: "bold", fontSize: 18, color: "#4A148C" },
  author: { fontSize: 14, color: "#6A1B9A", marginBottom: 5 },
  content: { fontSize: 16, marginVertical: 5 },
  page: { fontSize: 14, color: "#757575" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: { backgroundColor: "#6200EE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 5, marginTop: 5 },
  tagText: { color: "#fff", fontSize: 12 },
  dateTime: { fontSize: 12, color: "#757575", marginTop: 8 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#757575" },
});

