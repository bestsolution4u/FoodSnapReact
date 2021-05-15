import {Platform, StyleSheet} from 'react-native';
import Theme from '../../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Theme.specifications.statusBarHeight,
        backgroundColor: '#ffffff',
    },

    /* Category Item style properties */

    cat: {
        flexDirection: 'row',
        marginVertical: 5,
        marginLeft: 23,
        marginTop: 15,
        justifyContent: 'center'
    },
    cat1: {
        flexDirection: 'row',
        marginVertical: 5,
        marginLeft: 10,
        marginTop: 15,
        justifyContent: 'center'
    },
    catImageContainer: {

    },
    catImage: {
        width: 23,
        height: 23
    },
    ItemImage: {
        width: 55,
        height: 55,
        borderWidth:0.1,
        borderRadius:4,
        marginRight: 20,
        marginTop: 2.5
    },
    ItemImage1: {
        width: 45,
        height: 45,
        borderWidth:0.1,
        borderRadius:4,
        marginRight: 20,
    },
    catTitleContainer: {
        flex: 6,
        marginLeft: 10,
        justifyContent: 'center',
        borderBottomColor: Theme.colors.listBorderColor,
    },
    catTitle: {
        color: '#25252D',
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,

    },
    items: {
        color: '#7E7E7E',
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 13,
        paddingVertical: 2,

    },
    rate: {
        color: '#25252D',
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 13,
        //paddingVertical: 3,
        marginLeft: 4
    },
    /* Search bar style properties */

    searchContainer: {
        backgroundColor: Theme.colors.white,
    },
    search: {
        backgroundColor: Theme.colors.white,
        flex: 1,
        margin: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icoContainer: {
        marginLeft: 5,
        marginRight: 7,
        justifyContent: 'center',
    },
    ico: {
        width: Platform.OS === 'ios' ? 20 : 18,
        height: Platform.OS === 'ios' ? 20 : 18,
    },
    placeholderContainer: {
        flex: 1,
    },
    placeholder: {
        fontSize: 18,
        fontFamily: 'SanFranciscoDisplay-Medium',
        color: Theme.colors.white,
    },
    buttonPrimaryStyle: {
        backgroundColor: "blue",
        width: '80%',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default styles;