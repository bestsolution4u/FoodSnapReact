import React from 'react';
import {Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppText from '../AppText';
import Theme from '../../../theme';
import {translate} from '../../services/translate';
import {connect} from 'react-redux';
import {CheckboxRow, TableView, ThemeProvider} from 'react-native-ios-kit';
import {formatPrice} from '../../services/utility';

const {width} = Dimensions.get('window');

class RestaurantProductModal extends React.PureComponent {

    constructor () {
        super();

        this.state = {
            isFocused: false,
            selectedOptions: [],
            quantity: 0,
            item_instructions: '',
            hasChangedQuantity: false,
        };
    }

    componentDidUpdate (prevProps, prevState, snapshot): void {
        const {product} = this.props;
        if (prevProps.product.id !== product.id) {
            this.setState({
                quantity: product.quantity ? product.quantity : 0,
                item_instructions: product.item_instructions ? product.item_instructions : '',
                hasChangedQuantity: !!product.quantity,
                selectedOptions: product.options ? product.options : [],
            });
        }
    }

    calculateCurrentProductTotalPrice = () => {
        const {product} = this.props;
        const {quantity, selectedOptions} = this.state;
        let pricePerItem = product.price;
        selectedOptions.map(x => {
            pricePerItem += x.price;
        });
        return parseFloat(pricePerItem) * quantity;
    };

    onAddToCartPressed = () => {
        this.modal.close();
        const {selectedOptions} = this.state;
        this.props.product.options = selectedOptions;
        this.props.updateCart({
            product: this.props.product,
            quantity: this.state['quantity'],
            item_instructions: this.state['item_instructions'],
            options: selectedOptions,
        });
    };

    increment = () => {
        this.setState((state) => ({
            quantity: state.quantity + 1,
            hasChangedQuantity: true,
        }));
    };

    decrement = () => {
        this.setState((state) => ({
            quantity: Math.max(state.quantity - 1, 0),
        }));
    };

    renderAddToCartButton = () => {
        if (this.state['hasChangedQuantity']) {
            return <TouchableOpacity
                style={[styles.button]}
                onPress={() => this.onAddToCartPressed()}>
                <AppText style={styles.buttonText}>
                    {this.state['quantity'] > 0 ? translate('restaurant_details.add_to_cart_for') : translate('restaurant_details.remove_from_cart')}
                    {' '}{this.calculateCurrentProductTotalPrice()} {this.props.currency}</AppText>
            </TouchableOpacity>;
        }
        return <TouchableOpacity
            style={[styles.button]}
            onPress={() => this.modal.close()}>
            <AppText style={styles.buttonText}>
                Close
            </AppText>
        </TouchableOpacity>;
    };

    calculateModalHeight = () => {
        const {isFocused} = this.state;
        const {product} = this.props;
        if (isFocused && product['image_thumbnail_path']) {
            return 200;
        }
        let optionsHeight = 0;
        const options = product['product_options'];
        if (options && options.length > 0) {
            optionsHeight = Math.min(options.length, 3) * 50 + 55;
        }
        const pieces = [190 + optionsHeight + this.props.safeAreaDims.bottom + 80];
        if (this.props.product['image_thumbnail_path']) {
            pieces.push(300);
        }
        return pieces.reduce((a, b) => a + b, 0);
    };

    checkIfOptionSelected = (id) => {
        let {selectedOptions} = this.state;
        return selectedOptions.findIndex(x => x.id === id) > -1;
    };

    selectOption = (option) => {
        const {product} = this.props;
        let {selectedOptions} = this.state;

        // If option exists in array
        const index = selectedOptions.findIndex(opt => opt.id === option.id);

        if (index > -1) {
            selectedOptions.splice(index, 1);
            this.setState({
                selectedOptions,
            });
            this.forceUpdate();
            return;
        }

        // Check multiple for addition
        if (option.type === 'addition' && product['addition_selected_type'] === 1) {
            selectedOptions = selectedOptions.filter(opt => opt.type !== 'addition');
        }

        // Check multiple for option
        if (option.type === 'option' && product['option_selected_type'] === 1) {
            selectedOptions = selectedOptions.filter(opt => opt.type !== 'option');
        }

        selectedOptions.push(option);
        this.setState({selectedOptions});
        this.forceUpdate();
    };

    renderProductOptions = () => {
        const {product, currency} = this.props;

        const additions = [];
        const options = [];

        if (product['product_options'] && product['product_options'].length > 0) {
            product['product_options'].map(option => {
                if (option.type === 'addition') {
                    additions.push(option);
                } else if (option.type === 'option') {
                    options.push(option);
                }
            });
        }

        return <ThemeProvider>
            <View>
                {
                    additions.length > 0 && <TableView header={translate('restaurant_details.extras')}>
                        {
                            additions.map(option => {
                                return (
                                    <CheckboxRow
                                        key={option.id}
                                        selected={this.checkIfOptionSelected(option.id)}
                                        onPress={() => this.selectOption(option)}
                                        title={option.title}
                                        subtitle={`+ ${formatPrice(option.price, 0)} ${currency}`}
                                    />
                                );
                            })
                        }
                    </TableView>
                }

                {
                    options.length > 0 && <TableView header={translate('restaurant_details.options')}>
                        {
                            options.map(option => {
                                return (
                                    <CheckboxRow
                                        key={option.id}
                                        selected={this.checkIfOptionSelected(option.id)}
                                        onPress={() => this.selectOption(option)}
                                        title={option.title}
                                        subtitle={`+ ${formatPrice(option.price)} ${currency}`}
                                    />
                                );
                            })}
                    </TableView>
                }

            </View>
        </ThemeProvider>;

    };

    focusReceived = () => {
        this.setState({
            isFocused: true,
        });
    };

    focusLost = () => {
        this.setState({
            isFocused: false,
        });
    };

    renderInstructionsInput = (autoFocus) => {
        const {item_instructions} = this.state;
        const customStyles = {};
        if (autoFocus) {
            customStyles.height =  200;
        }

        return <View style={{flex: 1}}>
            <View style={styles.instructionsHeader}>
                <AppText style={styles.instructionsHeaderText}>
                    {translate('restaurant_details.instructionsTitle')}
                </AppText>
            </View>
            <View style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.backgroundTransparent4,
            }}>
                <TextInput
                    ref={ref => this.instructionInput = ref}
                    onFocus={() => this.focusReceived()}
                    onBlur={() => this.focusLost()}
                    returnKeyType={'done'}
                    onSubmitEditing={() => this.instructionInput && this.instructionInput.blur()}
                    autoFocus={autoFocus}
                    style={[styles.instructions, customStyles]}
                    underlineColorAndroid="transparent"
                    multiline={true}
                    autoCorrect={false}
                    placeholder={translate('restaurant_details.instructions')}
                    onChangeText={item_instructions => {
                        this.setState({item_instructions: item_instructions.replace('\n', '')});
                    }}
                    value={item_instructions}
                />
            </View>
        </View>;
    };

    renderModalContent = () => {
        const {product, currency} = this.props;
        const {quantity, isFocused} = this.state;

        if (isFocused) {
            return this.renderInstructionsInput(true);
        }

        return (
            <View>
                {
                    !!product['image_thumbnail_path'] &&
                    <FastImage
                        style={styles.modalImageContainer}
                        source={{
                            uri: `https://snapfoodal.imgix.net/${product['image_thumbnail_path']}?w=600&h=600`,
                        }}/>
                }

                {this.renderProductOptions()}

                <View style={styles.modalInfoContainer}>
                    <View style={{flex: 4}}>
                        <AppText style={styles.modalInfoTitle}>
                            {product.title}
                        </AppText>
                    </View>
                    <View style={{flex: 1}}>
                        <AppText style={styles.modalInfoPrice}>
                            {formatPrice(product.price, 0)} {currency}
                        </AppText>
                    </View>
                </View>

                {this.renderInstructionsInput()}

                <View style={styles.modalNrContainer}>
                    <TouchableOpacity onPress={() => this.decrement()}>
                        <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.cyan2}}>
                            <AppText style={{
                                textAlign: 'center',
                                fontSize: 30,
                                lineHeight: 30,
                                color: 'white',
                            }}>-</AppText>
                        </View>
                    </TouchableOpacity>
                    <AppText style={styles.modalInfoTitle}>
                        {'       '}
                        {quantity}
                        {'       '}
                    </AppText>
                    <TouchableOpacity onPress={() => this.increment()}>
                        <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.cyan2}}>
                            <AppText style={{
                                textAlign: 'center',
                                fontSize: 30,
                                lineHeight: 30,
                                color: 'white',
                            }}>+</AppText>
                        </View>
                    </TouchableOpacity>
                </View>
                {this.renderAddToCartButton()}
            </View>
        );
    };

    render () {
        const {product, setRef, onDismiss} = this.props;
        const {isFocused} = this.state;
        const height = this.calculateModalHeight();
        const containerStyles = {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            alignItems: 'center',
        };
        if (isFocused && product['image_thumbnail_path']) {
            containerStyles.marginBottom = -300;
        }

        return <RBSheet
            hasScrollView={true}
            onClose={onDismiss}
            closeOnDragDown={true}
            height={height}
            closeOnPressBack={true}
            duration={300}
            customStyles={{
                container: containerStyles,
            }}
            ref={ref => {
                this.modal = ref;
                setRef(ref);
            }}>
            <ScrollView style={[styles.modalView, {height}]}>
                {this.renderModalContent()}
            </ScrollView>
        </RBSheet>;
    }

}


const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        width: '100%',
        backgroundColor: Theme.colors.white,
    },
    modalImageContainer: {
        width: width,
        height: 300,
    },
    modalInfoContainer: {
        padding: 10,
        flexDirection: 'row',
    },
    modalInfoTitle: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    modalInfoPrice: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 15,
        textAlign: 'right',
    },
    modalNrContainer: {
        padding: 20,
        paddingBottom: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalNrImage: {
        width: 30,
        height: 30,
    },
    button: {
        backgroundColor: Theme.colors.cyan2,
        margin: 30,
        marginTop: 0,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    buttonText: {
        fontFamily: 'SanFranciscoDisplay-Medium',
        color: Theme.colors.white,
        fontSize: 18,
        textAlign: 'center',
        minWidth: width * 0.75,
    },
    instructionsHeader: {
        backgroundColor: Theme.colors.backgroundTransparent4,
        padding: 10,
    },
    instructionsHeaderText: {
        fontSize: 15,
        color: Theme.colors.text,
    },
    instructions: {
        paddingHorizontal: 10,
        flex: 1,
        fontSize: 15,
        backgroundColor: Theme.colors.transparent,
    },
});

const mapStateToProps = ({app}) => ({
    safeAreaDims: app.safeAreaDims,
});

export default connect(
    mapStateToProps,
    {},
)(RestaurantProductModal);

