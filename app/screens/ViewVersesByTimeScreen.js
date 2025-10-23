import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, SectionList } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

export default function ViewVersesByTimeScreen() {
  const db = useSQLiteContext();
  const [sections, setSections] = useState([]);

  const fetchVerses = async () => {
    const result = await db.getAllAsync(`
      SELECT v.id, t.title, t.author, v.content, v.page_number, v.date_time, v.tags
      FROM verses v
      JOIN titles t ON v.title_id = t.id
      ORDER BY v.date_time DESC;
    `);

    // Group verses by year and month
    const grouped = {};
    result.forEach(v => {
      if (!v.date_time) return;
      const date = new Date(v.date_time);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });
      const key = `${year}-${month}`;

      if (!grouped[key]) grouped[key] = { year, month, data: [] };
      grouped[key].data.push(v);
    });

    // Convert to array for SectionList
    const groupedArray = Object.values(grouped);
    setSections(groupedArray);
  };

  useEffect(() => {
    fetchVerses();
  }, []);

  const renderVerse = ({ item }) => {
    const tagsArray = item.tags ? item.tags.split(",") : [];
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        {item.author ? <Text style={styles.author}>by {item.author}</Text> : null}
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.page}>Page {item.page_number || "-"}</Text>

        <View style={styles.tagsContainer}>
          {tagsArray.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{`${section.month} ${section.year}`}</Text>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerse}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={<Text style={styles.empty}>No verses yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6", padding: 10 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", color: "#4A148C", marginVertical: 10 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 5, borderRadius: 10, borderColor: "#D1C4E9", borderWidth: 1 },
  title: { fontWeight: "bold", fontSize: 16, color: "#4A148C" },
  author: { fontSize: 14, color: "#6A1B9A", marginBottom: 5 },
  content: { fontSize: 16, marginVertical: 5 },
  page: { fontSize: 14, color: "#757575" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: { backgroundColor: "#6200EE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 5, marginTop: 5 },
  tagText: { color: "#fff", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#757575" },
});
