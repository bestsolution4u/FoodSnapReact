import React, {memo} from 'react';
import {TextInput, StyleSheet, View} from 'react-native';
import {default as EvilIcon} from 'react-native-vector-icons/EvilIcons';

const SearchBox = memo(({onChangeText, hint = 'Search'}) => {
    return (
        <View style={styles.container}>
            <EvilIcon name="search" size={32} color={'#D5D4E0'}/>
            <TextInput
                placeholder={hint}
                placeholderTextColor='#D5D4E0'
                onChangeText={(val) => onChangeText(val)}
                style={styles.input}/>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10
    },
    input: {
        margin: 0,
        flex: 1,
        color: 'black',
        fontSize: 16,
        height: 40
    }
});

export default SearchBox;
