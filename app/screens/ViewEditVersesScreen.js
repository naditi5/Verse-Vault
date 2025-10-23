import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

export default function ViewEditVersesScreen({ navigation }) {
  const db = useSQLiteContext();
  const [verses, setVerses] = useState([]);

  const fetchVerses = async () => {
    const result = await db.getAllAsync(`
      SELECT v.id, t.title, t.author, v.content, v.page_number, v.date_time, v.tags
      FROM verses v
      JOIN titles t ON v.title_id = t.id
      ORDER BY v.id DESC;
    `);
    setVerses(result);
  };

  // Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchVerses();
    }, [])
  );

  const renderItem = ({ item }) => {
    const tagsArray = item.tags ? item.tags.split(",") : [];
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("EditVerse", { verse: item })}>
            <Ionicons name="pencil" size={22} color="#6200EE" />
          </TouchableOpacity>
        </View>
        {item.author ? <Text style={styles.author}>by {item.author}</Text> : null}
        <Text style={styles.content}>{item.content}</Text>

        <View style={styles.tagsContainer}>
          {tagsArray.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.page}>Page {item.page_number || "-"}</Text>
        <Text style={styles.dateTime}>{item.date_time ? new Date(item.date_time).toLocaleString() : ""}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={verses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No verses to edit.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6", padding: 10 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 8, borderRadius: 10, borderColor: "#D1C4E9", borderWidth: 1 },
  title: { fontWeight: "bold", fontSize: 18, color: "#4A148C" },
  author: { fontSize: 14, color: "#6A1B9A", marginBottom: 5 },
  content: { fontSize: 16, marginVertical: 5 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: { backgroundColor: "#6200EE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 5, marginTop: 5 },
  tagText: { color: "#fff", fontSize: 12 },
  page: { fontSize: 14, color: "#757575", marginTop: 5 },
  dateTime: { fontSize: 12, color: "#757575", marginTop: 3 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#757575" },
});
