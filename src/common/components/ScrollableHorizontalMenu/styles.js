import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  itemContainer: {
    paddingHorizontal: 12,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    borderRadius: 18,
  },
  itemName: {
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  container: {
    height: 50,
    flex: 1,
  },
  scrollViewContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
