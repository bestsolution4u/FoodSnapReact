import React from 'react';
import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import StarRating from 'react-native-star-rating';
import colors from '../../styles/Colors';
import {StackActions} from 'react-navigation';

const popAction = StackActions.pop({
    n: 2,
});
export default class ReviewChatScreen extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            starCount: 1,
        };
    }

    static navigationOptions = (props) => {
        return {
            headerLeft: <TouchableOpacity onPress={() => {
                props.navigation.dispatch(popAction);
                props.navigation.replace('WelcomeChat');
            }}>
                <Image style={{width: 18, height: 18, marginLeft: 15, padding: 4}}
                       source={require('./../../assets/images/orders/close.png')}
                />
            </TouchableOpacity>,
            title: 'Vlerëso bisedën',
            headerTitleStyle: {
                color: '#000',
                fontFamily: 'SF_medium',
                fontSize: 18,
                textAlign: 'center',
                justifyContent: 'center',
            },
            headerStyle: {
                flex: 1,
                shadowOpacity: 0,
                shadowOffset: {
                    height: 0,
                },
                shadowRadius: 0,
                elevation: 0,
            },
        };
    };

    onStarRatingPress (rating) {
        this.setState({
            starCount: rating,
        });
    }

    renderTextStar () {

        if (this.state.starCount === 1) {
            return <Text style={{marginTop: 13, fontFamily: 'SF_semiBold', fontSize: 13.5, color: 'black'}}>I pa
                kënaqur</Text>;
        } else if (this.state.starCount === 2) {
            return <Text style={{marginTop: 13, fontFamily: 'SF_semiBold', fontSize: 13.5, color: 'black'}}>Jo
                mjaftueshëm i kënaqur</Text>;
        } else if (this.state.starCount === 3) {
            return <Text style={{marginTop: 13, fontFamily: 'SF_semiBold', fontSize: 13.5, color: 'black'}}>Mesatarisht
                i
                kënaqur</Text>;
        } else if (this.state.starCount === 4) {
            return <Text style={{marginTop: 13, fontFamily: 'SF_semiBold', fontSize: 13.5, color: 'black'}}>Mjaftueshem
                i
                kënaqur</Text>;
        } else if (this.state.starCount === 5) {
            return <Text style={{marginTop: 13, fontFamily: 'SF_semiBold', fontSize: 13.5, color: 'black'}}>Shumë i
                kënaqur</Text>;
        }
    }

    render () {
        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
            }}>
                <View style={{
                    flexDirection: 'column', marginTop: 12, alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        fontFamily: 'SF_bold',
                        fontSize: 17,
                        color: 'blask',
                        marginTop: 10,
                    }}>
                        Biseda ka përfunduar, ju faleminderit.
                    </Text>
                    <Text style={{
                        marginTop: 12,
                        fontFamily: 'SF_semiBold',
                        fontSize: 13,
                        color: '#28CAD7',
                        textAlign: 'center',
                        paddingHorizontal: 20,
                    }}>
                        Ju lutemi, vlerësoni bisedën më poshtë, pasi për ne është
                    </Text>
                    <Text style={{
                        fontFamily: 'SF_semiBold',
                        fontSize: 13,
                        color: '#28CAD7',
                        textAlign: 'center',
                        paddingHorizontal: 20,
                    }}>
                        shumë e rëndësishme mardhënia me klientin.
                    </Text>
                    <StarRating
                        containerStyle={{width: 160, marginTop: 30}}
                        starSize={30}
                        emptyStar={require('./../../assets/images/chat/unfilled-star.png')}
                        fullStar={require('./../../assets/images/chat/filled-star.png')}
                        disabled={false}
                        maxStars={5}
                        rating={this.state.starCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                    />
                    <View>
                        {this.renderTextStar()}
                    </View>
                    <TextInput
                        underlineColorAndroid='transparent'
                        style={{
                            marginTop: 30,
                            width: 260,
                            padding: 10,
                            color: '#C8C8C8',
                            margin: 8,
                            fontSize: 15,
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: '#C8C8C8',
                            textAlign: 'left',
                            backgroundColor: 'rgba(0,0,0,0)',
                        }}
                        multiline={true}
                        numberOfLines={5}
                        placeholder="Mesazhi"
                    />
                    <TouchableOpacity style={{
                        backgroundColor: colors.cyan2,
                        width: 260,
                        height: 40,
                        marginTop: 12,
                        marginBottom: 12,
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                    }} onPress={this.register}>
                        <Text style={{
                            fontFamily: 'SF_medium',
                            color: colors.white,
                            fontSize: 16,
                            textAlign: 'center',
                        }}>Dergo</Text>
                    </TouchableOpacity>
                </View>

            </View>

        );
    }
}
