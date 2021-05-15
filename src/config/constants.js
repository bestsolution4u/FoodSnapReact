import {translate} from '../common/services/translate';

export const REACTIONS = [
    {
        emotion: 1,
        src: require('./../common/assets/images/dashboard_review/sadinactive.png'),
        bigSrc: require('./../common/assets/images/dashboard_review/sad.png'),
    },
    {
        emotion: 2,
        src: require('./../common/assets/images/dashboard_review/neutralinactive.png'),
        bigSrc: require('./../common/assets/images/dashboard_review/neutral.png'),
    },
    {
        emotion: 3,
        src: require('./../common/assets/images/dashboard_review/okinactive.png'),
        bigSrc: require('./../common/assets/images/dashboard_review/ok.png'),
    },

    {
        emotion: 4,
        src: require('./../common/assets/images/dashboard_review/happyinactive.png'),
        bigSrc: require('./../common/assets/images/dashboard_review/happy.png'),
    },
    {
        emotion: 5,
        src: require('./../common/assets/images/dashboard_review/heartinactive.png'),
        bigSrc: require('./../common/assets/images/dashboard_review/heart.png'),
    },
];

export const days = [
    {
        day: 1,
        text: translate('vendor_profile_info.monday'),
    },
    {
        day: 2,
        text: translate('vendor_profile_info.tuesday'),
    },
    {
        day: 3,
        text: translate('vendor_profile_info.wednesday'),
    },
    {
        day: 4,
        text: translate('vendor_profile_info.thursday'),
    },
    {
        day: 5,
        text: translate('vendor_profile_info.friday'),
    },
    {
        day: 6,
        text: translate('vendor_profile_info.saturday'),
    },
    {
        day: 7,
        text: translate('vendor_profile_info.sunday'),
    },
];

export const SNAP_FOOD_SUPPORT = 'SNAP_FOOD_SUPPORT';
