import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import styles from '../screens/styles/home';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppText from '../../../common/components/AppText';
import {translate} from '../../../common/services/translate';
import {useSelector} from 'react-redux';

const SelectAddressModal = ({addresses, selectedAddress, setRef, onAddressSelected, onLocationPress, onCreateAddressPress}) => {

    if (!addresses) {
        return null;
    }

    let modal;

    const renderAddressItem = (address, icon, customStyles = {}) => {
        return <TouchableOpacity key={address.id.toString()}
                                 style={[styles.location, customStyles]}
                                 onPress={() => {
                                     if (address.id > 0) {
                                         onAddressSelected(address);
                                     } else if (address.onPress) {
                                         address.onPress();
                                     }
                                 }}>
            <View style={styles.locationIcoContainer}>
                <FastImage source={icon} resizeMode={FastImage.resizeMode.contain}
                           style={styles.locationIco}
                />
            </View>
            <View style={styles.locationTitleContainer}>
                <AppText style={styles.locationTitle}>{address.street}</AppText>
            </View>
        </TouchableOpacity>;
    };

    const safeAreaDims = useSelector(({app}) => {
        return app.safeAreaDims;
    });

    return <RBSheet
        duration={300}
        ref={ref => {
            modal = ref;
            setRef(ref);
        }}
        closeOnDragDown={true}
        closeOnPressBack={true}
        height={300}
        customStyles={{
            container: {
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                alignItems: 'center',
            },
        }}>
        <ScrollView style={{width: '100%'}}>
            {renderAddressItem({
                id: 0,
                isInternal: true,
                onPress: onLocationPress,
                street: translate('current_location'),
            }, (!selectedAddress || !selectedAddress.id) ? require('../../../common/assets/images/location/favorite.png') : require('../../../common/assets/images/location/mylocation.png'))}
            {
                addresses.map(address => {
                    const icon = selectedAddress && selectedAddress.id && selectedAddress.id === address.id ?
                        require('../../../common/assets/images/location/favorite.png')
                        :
                        require('../../../common/assets/images/location/loc.png');
                    return renderAddressItem(address, icon);
                })
            }
            {renderAddressItem({
                id: -1,
                isInternal: true,
                onPress: onCreateAddressPress,
                street: translate('create_new_address'),
            }, require('../../../common/assets/images/location/addlocation.png'), {
                marginBottom: safeAreaDims.bottom,
            })}
        </ScrollView>
    </RBSheet>;
};


export default SelectAddressModal;
