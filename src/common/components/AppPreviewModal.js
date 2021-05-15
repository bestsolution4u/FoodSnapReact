import React, {PureComponent} from 'react';
import {Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import AppImage from './AppImage';
import Theme from '../../theme';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

class AppPreviewModal extends PureComponent {

    _renderPreview = (src) => {
        return <AppImage style={{width: screenWidth, height: screenHeight}} resizeMode={'contain'}
                         src={src}/>;
    };

    _closeButtonPressed = () => {
        this.props.onClose();
    };

    render () {
        const {visible, src} = this.props;

        return <Modal animationType={'fade'}
                      backdropOpacity={1}
                      backdropColor={Theme.colors.blackPrimary}
                      onSwipeComplete={this._closeButtonPressed}
                      swipeDirection={['up', 'down']}
                      animationOutTiming={100}
                      style={{flex: 1, margin: 0, padding: 0}}
                      onBackButtonPress={this._closeButtonPressed}
                      presentationStyle={'overFullScreen'}
                      transparent={true}
                      isVisible={visible}>
            {this._renderPreview(src)}
        </Modal>;
    }

}

export default AppPreviewModal;

AppPreviewModal.propTypes = {
    src: PropTypes.string,
};
