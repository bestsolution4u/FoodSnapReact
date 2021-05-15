import React from 'react';
import {connect} from 'react-redux';
import {getLanguage, translate} from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import BlockSpinner from '../../../common/components/BlockSpinner';
import {ActivityIndicator, FlatList, RefreshControl, ScrollView, View} from 'react-native';
import BlogItem from '../components/BlogItem';
import Theme from '../../../theme';
import alerts from '../../../common/services/alerts';
import AppSearch from '../../../common/components/AppSearch';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import RouteNames from '../../../routes/names';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppListItem from '../../../common/components/AppListItem';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNext';

class BlogScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            language: getLanguage(),
            [IS_LOADING]: true,
            [IS_REFRESHING]: false,
            [IS_LOADING_NEXT]: false,
            blog: [],
            categories: [],
            selectedCategory: {},
            title: '',
            page: 1,
            totalPages: 1,
        };
    }

    static navigationOptions = () => {
        return {
            title: translate('account.blog_menu'),
        };
    };

    componentDidMount (): void {
        this.getBlog();
        this.getCategories();
    }

    getBlog = async (propToLoad = IS_LOADING) => {
        const {title, page, selectedCategory} = this.state;
        const params = [
            `title=${title}`,
            `page=${page}`,
            `category_id=${selectedCategory && selectedCategory.id ? selectedCategory.id : ''}`,
        ];
        await this.setState({[propToLoad]: true});
        apiFactory.get(`blogs?${params.join('&')}`).then(({data}) => {
            const blog = data['blogs'];
            let blogItems = this.state.blog;
            if ([IS_LOADING, IS_LOADING_NEXT].indexOf(propToLoad) > -1) {
                blogItems = [
                    ...blogItems,
                    ...blog['data'],
                ];
            } else {
                blogItems = blog['data'];
            }
            this.setState({
                blog: blogItems,
                page: blog['current_page'],
                totalPages: blog['last_page'],
                [propToLoad]: false,
            });
        }, (error) => {
            const message = error.message || translate('generic_error');
            this.setState({
                [propToLoad]: false,
            });
            alerts.error(translate('alerts.error'), message);
        });
    };

    getCategories = () => {
        apiFactory.get('blogs/categories').then(({data}) => {
            this.setState({
                categories: data.categories,
            });
        });
    };

    loadNextPage = async () => {
        const {page, totalPages} = this.state;
        if (!this.state[IS_LOADING_NEXT] && page < totalPages) {
            await this.setState({
                page: page + 1,
            });
            this.getBlog(IS_LOADING_NEXT);
        }
    };

    renderNextLoader = () => {
        if (this.state.loadingNextVendors) {
            return <ActivityIndicator size={Theme.sizes.xLarge} color={Theme.colors.primary}/>;
        }
        return null;
    };

    changeQuery = async (title) => {
        await this.setState({title});
        this.getBlog('none');
    };

    onActionClick = () => {
        this.bottomMenu.open();
    };

    renderSearch = () => {
        const {title} = this.state;
        return <AppSearch
            text={title}
            onChangeText={this.changeQuery}
            onActionClick={this.onActionClick}
            containerStyle={{
                margin: 10,
            }}
        />;
    };

    renderNoData = () => {
        return <View style={{marginTop: 50, marginBottom: 300}}>
            <View style={Theme.styles.noData.imageContainer}>
                <FastImage
                    resizeMode={FastImage.resizeMode.contain}
                    source={require('../../../common/assets/images/noblog.png')}
                    style={Theme.styles.noData.noImage}
                />
            </View>
            <AppText style={Theme.styles.noData.noTitle}>
                {translate('blog.no_blog')}
            </AppText>
            <AppText style={Theme.styles.noData.noDescription}>
                {translate('blog.no_blog_message')}
            </AppText>
        </View>;
    };

    onCategorySelect = async (category) => {
        await this.setState({
            page: 1,
            selectedCategory: category,
        });
        this.bottomMenu.close();
        this.getBlog(IS_REFRESHING);
    };

    renderBottomMenu = () => {
        const {categories, selectedCategory} = this.state;
        const {safeAreaDims} = this.props;

        return <RBSheet ref={ref => this.bottomMenu = ref}
                        closeOnDragDown={true}
                        duration={300}
                        closeOnPressBack={true}
                        height={260}
                        customStyles={{
                            container: {
                                paddingHorizontal: 15,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                alignItems: 'center',
                            },
                        }}>
            <ScrollView style={{width: '100%'}}>
                <AppListItem
                    title={translate('blog.all')}
                    icon={!selectedCategory || !selectedCategory.id ? 'ok-1' : null}
                    iconSize={Theme.icons.small}
                    color={Theme.colors.text}
                    iconColor={Theme.colors.cyan2}
                    fontSize={17}
                    type={Theme.sizes.xTiny}
                    onPress={() => this.onCategorySelect({})}/>
                {
                    categories.map(cat => {
                        return <AppListItem
                            key={cat.id}
                            title={cat.title}
                            icon={cat.id === selectedCategory.id ? 'ok-1' : null}
                            iconSize={Theme.icons.small}
                            color={Theme.colors.text}
                            iconColor={Theme.colors.cyan2}
                            fontSize={17}
                            type={Theme.sizes.xTiny}
                            customStyles={cat.id === categories[categories.length - 1].id ? {
                                marginBottom: safeAreaDims.bottom,
                            } : {}}
                            onPress={() => this.onCategorySelect(cat)}/>;
                    })
                }
            </ScrollView>
        </RBSheet>;
    };

    render () {
        const {isLoading, blog} = this.state;

        if (isLoading) {
            return <BlockSpinner/>;
        }

        const isRefreshing = this.state[IS_REFRESHING];

        return <View>
            <FlatList
                keyExtractor={item => item.id.toString()}
                onEndReachedThreshold={0.3}
                data={blog}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => this.getBlog(IS_REFRESHING)}
                    />
                }
                ListHeaderComponent={this.renderSearch}
                ListEmptyComponent={this.renderNoData()}
                ListFooterComponent={this.renderNextLoader()}
                onEndReached={this.loadNextPage}
                renderItem={({item}) => (
                    <BlogItem key={item.id.toString()}
                              onPress={() => {
                                  this.props.navigation.push(RouteNames.BlogDetailsScreen, {
                                      blog: item,
                                  });
                              }}
                              item={item}
                    />
                )}
            />
            {this.renderBottomMenu()}
        </View>;

    }
}

function mapStateToProps ({app}) {
    return {
        safeAreaDims: app.safeAreaDims,
    };
}

export default connect(
    mapStateToProps,
    {},
)(BlogScreen);
