import {translate} from '../common/services/translate';

export const SNAPFOODERS = [
    {
        type: 'user',
        avatar: 'https://i.pravatar.cc/150?img=7',
        gender: 'male',
        name: 'Jose Jackson',
        latitude: 41.329919,
        longitude: 19.816644,
    },
    {
        type: 'user',
        avatar: 'https://i.pravatar.cc/150?img=56',
        name: 'Mary Ann Miller',
        gender: 'female',
        latitude: 41.329574,
        longitude: 19.823534,
    },
    {
        type: 'user',
        avatar: 'https://i.pravatar.cc/150?img=32',
        name: 'Jerry Stewart',
        gender: 'male',
        latitude: 41.325589,
        longitude: 19.823024
    },
    {
        type: 'user',
        avatar: 'https://i.pravatar.cc/150?img=13',
        name: 'Alan Matthews',
        gender: 'female',
        latitude: 41.325972,
        longitude: 19.814858
    },
    {
        type: 'restaurant',
        avatar: 'https://i.pravatar.cc/150?img=13',
        name: 'Test Restaurant',
        latitude: 41.332257,
        longitude: 19.819349
    },
];

export const CHAT_HISTORY = [
    {
        avatar: 'https://i.pravatar.cc/150?img=7',
        name: 'Jose Jackson',
        time: '2:30 PM',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 2
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=56',
        name: 'Mary Ann Miller',
        time: '2:00 PM',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 2
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=32',
        name: 'Jerry Stewart',
        time: 'Wednesday',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 1
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=13',
        name: 'Alan Matthews',
        time: 'Wednesday',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 0
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=33',
        name: 'Amanda Diaz',
        time: 'Tuesday',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 0
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=1',
        name: 'Aaron Hoffman',
        time: '10/3/2021',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 0
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=67',
        name: 'Aaron Hoffman',
        time: '10/3/2021',
        lastMessage: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eir...',
        unreadCount: 0
    }
];

export const CALL_HISTORY = [
    {
        avatar: 'https://i.pravatar.cc/150?img=67',
        name: 'Jose Jackson',
        time: '2:30 PM',
        lastCall: 'Incoming',
        missedCount: 3
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=1',
        name: 'Joan Palmer',
        time: '2:00 PM',
        lastCall: 'Incoming',
        missedCount: 0
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=33',
        name: 'Jerry Stewart',
        time: 'Wednesday',
        lastCall: 'Incoming',
        missedCount: 1
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=13',
        name: 'Alan Matthews',
        time: 'Wednesday',
        lastCall: 'Incoming',
        missedCount: 0
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=32',
        name: 'Amanda Diaz',
        time: 'Tuesday',
        lastCall: 'Outgoing',
        missedCount: 0
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=56',
        name: 'Aaron Hoffman',
        time: '10/3/2021',
        lastCall: 'Incoming',
        missedCount: 1
    },
    {
        avatar: 'https://i.pravatar.cc/150?img=7',
        name: 'Aaron Hoffman',
        time: '10/3/2021',
        lastCall: 'Incoming',
        missedCount: 0
    }
];

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
