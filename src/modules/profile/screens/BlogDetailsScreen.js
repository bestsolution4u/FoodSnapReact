import React from 'react';
import { BackHandler, Dimensions, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import { appMoment, getLanguage, translate } from '../../../common/services/translate';
import AppText from '../../../common/components/AppText';
import apiFactory from '../../../common/services/apiFactory';
import FastImage from 'react-native-fast-image';
import styles from '../styles/blog';
import HTML from 'react-native-render-html';
import { openExternalUrl } from '../../../common/services/utility';
import BlockSpinner from '../../../common/components/BlockSpinner';
import Theme from '../../../theme';
import FontelloIcon from '../../../common/components/FontelloIcon';
import RouteName from '../../../routes/names';
import Config from '../../../config';

const handleBackPress = (navigation) => {
	const backRoute = navigation.getParam('backScreenView');
	if (backRoute) {
		navigation.replace(RouteName.BlogScreen);
	} else {
		navigation.pop(1);
	}
	return true;
};

class BlogDetailsScreen extends React.Component {
	constructor(props) {
		super(props);

		const blog = props.navigation.getParam('blog', {});

		this.state = {
			language: getLanguage(),
			blog,
		};
	}

	async componentDidMount(): void {
		this.backHandlerListener = BackHandler.addEventListener('hardwareBackPress', async () =>
			handleBackPress(this.props.navigation)
		);
		const blog = await apiFactory.get(`blogs/${this.state.blog.id}`);
		if (blog.data.blog) {
			this.setState({ blog: blog.data.blog });
			this.props.navigation.setParameter('blog', blog);
		}
	}

	componentWillUnmount(): void {
		if (this.backHandlerListener) {
			this.backHandlerListener.remove();
		}
	}

	static navigationOptions = ({ navigation }) => {
		const backRoute = navigation.getParam('backScreenView');
		return {
			headerLeft: () => {
				return (
					<TouchableOpacity
						onPress={() => {
							handleBackPress(navigation);
						}}
					>
						<FontelloIcon
							icon='left-open'
							size={Theme.icons.base}
							color={Theme.colors.text}
							style={{ marginRight: 25 }}
						/>
					</TouchableOpacity>
				);
			},
			headerRight: () => {
				return (
					<TouchableOpacity onPress={() => this.share({ navigation })}>
						<FastImage
							source={require('../../../common/assets/images/restaurant/black_share.png')}
							resizeMode={FastImage.resizeMode.contain}
							style={{ width: 25, height: 25 }}
						/>
					</TouchableOpacity>
				);
			},
			gesturesEnabled: !backRoute,
			title: translate('account.blog_menu'),
		};
	};

	static share = async ({ navigation }) => {
		const blog = navigation.getParam('blog', {});
		const url = `${Config.WEB_PAGE_URL}blogs/${blog['hash_id']}/${blog['slug']}`;
		const shareOptions = {
			title: 'Snapfood Blog',
			message: Platform.OS === 'android' ? url : '',
			url: url,
			subject: 'Link for Snapfood',
		};
		await Share.share(shareOptions);
	};

	parseStyles = (styles) => {
		const results = {
			width: Dimensions.get('screen').width,
			height: 200,
		};
		if (styles) {
			styles.split(';').map((style) => {
				const p = style.replace(' ', '').replace('px', '').split(':');
				if (['height', 'width'].indexOf(p[0]) !== -1) {
					results[p[0]] = parseInt(p[1]);
				}
			});
		}
		const screenWidth = Dimensions.get('screen').width - 30;
		const diff = results.width / screenWidth;
		results.width = screenWidth;
		results.height = results.height / diff;
		return results;
	};

	parseTags = () => {
		return {
			img: (props) => {
				return (
					<FastImage
						key={props.src}
						source={{ uri: props.src }}
						resizeMode={FastImage.resizeMode.contain}
						style={this.parseStyles(props.style)}
					/>
				);
			},
		};
	};

	render() {
		const { blog } = this.state;

		if (!blog.title) {
			return <BlockSpinner />;
		}

		return (
			<ScrollView>
				<FastImage
					source={{ uri: `https://snapfoodal.imgix.net/${blog['image_cover']}?h=250` }}
					resizeMode={FastImage.resizeMode.cover}
					style={styles.image}
				/>
				<View style={{ margin: 15 }}>
					<AppText style={styles.titleDetails}>{blog.title}</AppText>
					<View style={{ height: 15 }} />
					<View style={styles.rowFlex}>
						<AppText style={styles.categoryDetails}>
							{blog.categories.map((x) => x.title).join(', ')}
						</AppText>
						<AppText style={styles.dateDetails}>{appMoment(blog['created_at']).fromNow()}</AppText>
					</View>
					<View style={styles.hr} />
					<HTML
						html={blog.content}
						renderers={this.parseTags()}
						imagesMaxWidth={Dimensions.get('window').width}
						onLinkPress={(event, href) => openExternalUrl(href)}
					/>
					<View style={styles.hr} />
					<AppText style={styles.author}>
						{translate('blog.author')} {blog['author']}
					</AppText>
				</View>
			</ScrollView>
		);
	}
}

export default BlogDetailsScreen;
