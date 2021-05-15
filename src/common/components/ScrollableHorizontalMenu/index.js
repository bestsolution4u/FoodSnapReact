import React, { useState, useRef, useEffect } from 'react';
import { Text, ScrollView, TouchableOpacity } from 'react-native';

import GestureRecognizer from 'react-native-swipe-gestures';

import styles from './styles';

const ScrollableHorizontalMenu = ({ items = [], onItemSelected = () => {}, selectedItem = 0, style = {} }) => {
  const [selected, setSelected] = useState(0);
  const [categoriesDimensions, setCategoriesDimensions] = useState([]);
  const scrollView = useRef(null);

  useEffect(() => {
    if (categoriesDimensions[selectedItem]) {
      setSelected(selectedItem);
      const { x } = categoriesDimensions[selectedItem];
      scrollView.current && scrollView.current.scrollTo({ x: x - 10 <= 0 ? x : x - 10 });
    }
  }, [selectedItem]);

  const renderMenuItems = () => {
    return items.map((item, index) => (
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: selected === index ? '#f1f6f7' : '#fff' }]}
        onLayout={(event) => {
          const { width, x } = event.nativeEvent.layout;
          const newCategDimensions = [...categoriesDimensions];
          newCategDimensions[index] = { index, width, x };
          setCategoriesDimensions(newCategDimensions);
        }}
        activeOpacity={1}
        key={index}
        onPress={() => {
          setSelected(index);
          onItemSelected(index);
          const { x } = categoriesDimensions[index];
          scrollView.current &&
          scrollView.current.scrollTo({
            x: x - 10 <= 0 ? x : x - 10,
            animated: true,
          });
        }}
      >
        <Text style={[styles.itemName, { color: selected === index ? '#21adc4' : '#000' }]}>{item.title}</Text>
      </TouchableOpacity>
    ));
  };

  const onSwipe = (gestureName, gestureState) => {
    const { dx } = gestureState;
    let index = selected;
    if (dx > 0) {
      //LEFT SCROLL
      if (index > 0) {
        index = selected - 1;
        if (!!categoriesDimensions[index]) {
          setSelected(index);
          onItemSelected(index);
          const { x } = categoriesDimensions[index];
          scrollView.current &&
          scrollView.current.scrollTo({
            x: x - 10 <= 0 ? x : x - 10,
            animated: true,
          });
        }
      }
    } else if (dx < 0) {
      //RIGHT SCROLL
      if (index < items.length) {
        index = selected + 1;
        if (!!categoriesDimensions[index]) {
          setSelected(index);
          onItemSelected(index);
          const { x } = categoriesDimensions[index];
          scrollView.current &&
          scrollView.current.scrollTo({
            x: x - 10 <= 0 ? x : x - 10,
            animated: true,
          });
        }
      }
    }
  };

  return (
    <GestureRecognizer
      style={[styles.container, style.container]}
      onSwipe={(direction, state) => onSwipe(direction, state)}
    >
      <ScrollView
        horizontal
        scrollEnabled={false}
        contentContainerStyle={styles.scrollViewContentContainer}
        ref={scrollView}
      >
        {renderMenuItems()}
      </ScrollView>
    </GestureRecognizer>
  );
};

export default ScrollableHorizontalMenu;
