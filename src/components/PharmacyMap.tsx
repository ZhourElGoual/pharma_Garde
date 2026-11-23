import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  pharmacies: any[];
};

const PharmacyMap = forwardRef<any, Props>(
  ({ pharmacies }, _ref) => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Carte des pharmacies
        </Text>

        <Text style={styles.subtitle}>
          {pharmacies.length} pharmacie(s) affichée(s)
        </Text>

        {pharmacies.map((p) => (
          <View key={p.id} style={styles.item}>
            <Text style={styles.name}>{p.name}</Text>
            <Text>{p.address}</Text>
          </View>
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    marginVertical: 8,
    color: '#16A34A',
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
  },
});

export default PharmacyMap;