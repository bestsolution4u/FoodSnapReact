import React, {memo} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'

const BackButton = memo(({onPress}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress()}>
            <Ionicons name='ios-arrow-back' color={'#000000'} size={20} style={styles.icon} />
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        height: 20
    },

});

export default BackButton;
