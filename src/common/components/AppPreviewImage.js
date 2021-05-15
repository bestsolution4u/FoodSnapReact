import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import AppImage from './AppImage';
import AppPreviewModal from './AppPreviewModal';

class AppPreviewImage extends PureComponent {

    constructor (props) {
        super(props);

        this.state = {
            isPreviewVisible: false,
        };
    }

    _showModal = async () => {
        await this.setState({
            isPreviewVisible: true,
        });
    };

    _hideModal = async () => {
        await this.setState({
            isPreviewVisible: false,
        });
    };

    render () {
        const {src, style} = this.props;
        const {isPreviewVisible} = this.state;

        return <TouchableOpacity activeOpacity={0.75} onPress={this._showModal} style={style}>
            <AppImage src={src} {...this.props}/>
            {isPreviewVisible && <AppPreviewModal src={src} visible={isPreviewVisible} onClose={this._hideModal}/>}
        </TouchableOpacity>;
    }
}

export default AppPreviewImage;

AppPreviewImage.propTypes = {
    src: PropTypes.string,
};
