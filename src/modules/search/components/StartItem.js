import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styles from '../styles/styles';
import AppText from '../../../common/components/AppText';
import Icon from "react-native-vector-icons/Feather"

const FoodItem = ({ title, cat, onPress }) => {
  return (
    <TouchableOpacity style={styles.cat} onPress={onPress}>
      <View style={styles.catImageContainer}>
        <Icon name={cat === "recents" ? "arrow-up-right" : "search"} size={18} color={'lightgray'} />
      </View>
      <View style={styles.catTitleContainer}>
        <AppText style={styles.catTitle}>{title}</AppText>
      </View>
    </TouchableOpacity>
  );
};

export default FoodItem;