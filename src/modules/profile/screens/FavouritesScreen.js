import React from 'react';
import {ScrollView, View} from 'react-native';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import {getLanguage, translate} from '../../../common/services/translate';
import BlockSpinner from '../../../common/components/BlockSpinner';
import apiFactory from '../../../common/services/apiFactory';
import styles from '../styles/favorites';
import Favourite from '../components/Favourite';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppListItem from '../../../common/components/AppListItem';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import {toggleFavourite} from '../../../store/actions/vendors';
import alerts from '../../../common/services/alerts';

class FavouritesScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            language: getLanguage(),
            isLoading: true,
            favorites: [],
            closedFavorites: [],
            selectedRest: {},
        };
    }

    static navigationOptions = () => {
        return {
            title: translate('account.preferred'),
        };
    };

    componentDidMount (): void {
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.getFavorites();
        });
    }

    componentWillUnmount (): void {
        this.focusListener.remove();
    }

    getFavorites = () => {
        apiFactory.get('vendors/favourites').then(({data}) => {
            const favorites = data.vendors.filter(filtered => filtered['is_open']);
            const closedFavorites = data.vendors.filter(filtered => !filtered['is_open']);
            this.setState({
                favorites,
                closedFavorites,
                isLoading: false,
            });
        }, () => {
            this.setState({
                isLoading: false,
            });
        });
    };

    deleteFavorite = () => {
        alerts.confirmation(translate('attention'), translate('account.remove_favourite')).then(async () => {
            let {closedFavorites, favorites, selectedRest} = this.state;
            await this.props.toggleFavourite(selectedRest.id, false);
            favorites = favorites.filter(x => x.id !== selectedRest.id);
            closedFavorites = closedFavorites.filter(x => x.id !== selectedRest.id);
            await this.setState({
                selectedRest: {},
                closedFavorites,
                favorites,
            });
            this.closeBottomMenu();
        });
    };

    seeDetails = () => {
        const restaurant = this.state.selectedRest;
        this.props.navigation.navigate({
            routeName: RouteNames.RestaurantDetailsScreen,
            params: {
                restaurant,
                restaurantTitle: restaurant.title,
                isFavourite: true,
            },
            key: Math.random().toString(),
        });
        this.closeBottomMenu();
    };

    closeBottomMenu = () => {
        this.setState({
            selectedRest: {},
        });
        this.bottomMenu.close();
    };

    showBottomMenu = (item) => {
        this.setState({
            selectedRest: item,
        });
        this.bottomMenu.open();
    };

    renderBottomMenu = () => {
        return <RBSheet ref={ref => this.bottomMenu = ref}
                        closeOnDragDown={true}
                        duration={300}
                        closeOnPressBack={true}
                        height={130 + this.props.safeAreaDims.bottom}
                        customStyles={{
                            container: {
                                paddingHorizontal: 15,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                alignItems: 'center',
                            },
                        }}>
            <AppListItem title={translate('dashboard.see_the_menu')}
                         icon={'right-open'}
                         iconSize={Theme.icons.small}
                         color={Theme.colors.text}
                         iconColor={Theme.colors.text}
                         fontSize={17}
                         type={Theme.sizes.xTiny}
                         onPress={this.seeDetails}/>
            <AppListItem title={translate('address_list.delete')}
                         icon={'snap-trash'}
                         iconSize={Theme.icons.small}
                         color={Theme.colors.text}
                         iconColor={Theme.colors.text}
                         fontSize={17}
                         type={Theme.sizes.xTiny}
                         onPress={this.deleteFavorite}/>
        </RBSheet>;
    };

    render () {
        const {isLoading, favorites, closedFavorites, language} = this.state;

        if (isLoading) {
            return <BlockSpinner/>;
        }

        if ((!favorites.length || favorites.length === 0) && (!closedFavorites || closedFavorites.length === 0)) {
            return (
                <View
                    style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <FastImage resizeMode={FastImage.resizeMode.contain}
                               source={require('../../../common/assets/images/user/star.png')}
                               style={{width: 200, height: 200, resizeMode: 'contain'}}
                    />
                    <AppText style={{fontFamily: 'SanFranciscoDisplay-Medium', paddingTop: 10}}>
                        {translate('account.no_favorites')}
                    </AppText>
                </View>
            );
        }

        return (
            <ScrollView style={styles.container}>
                {
                    favorites.length > 0 && <View>
                        <View style={{paddingVertical: 5, backgroundColor: '#efefef'}}/>
                        <View>
                            <AppText style={styles.mainTitle}>
                                {translate('account.latest')}
                            </AppText>
                            {favorites.map(item => {
                                return (
                                    <Favourite key={item.id}
                                               vendor={item}
                                               onPress={() => this.showBottomMenu(item)}/>
                                );
                            })}
                        </View>
                    </View>
                }

                {
                    closedFavorites.length > 0 && (
                        <View>
                            <View style={{paddingVertical: 5, backgroundColor: '#efefef'}}/>
                            <View>
                                <AppText style={styles.mainTitle}>{translate('vendor_list.closed')}</AppText>
                                {closedFavorites.map(item => {
                                    return (
                                        <Favourite key={item.id}
                                                   vendor={item}
                                                   language={language}
                                                   onPress={() => this.showBottomMenu(item)}/>
                                    );
                                })}
                            </View>
                        </View>
                    )
                }

                {this.renderBottomMenu()}
            </ScrollView>
        );
    }
}

function mapStateToProps ({app}) {
    return {
        safeAreaDims: app.safeAreaDims
    };
}

export default connect(
    mapStateToProps,
    {
        toggleFavourite,
    },
)(FavouritesScreen);
