window.maForm = hlf.form({
    id: 'form111',
    controls: {
        destination: hlf.ac({
            id: 15542,
            type: 'location',
            text: 'Париж, Франция',
            onlyLocations: true,
            needLocationPhotos: true,
            locationPhotoSize: '240x75',
            locale: 'ru-RU',
            goalUseInput: {
                ga: 'form111.goalUseInput',
                yam: 'form111-goalUseInput',
                as: 'hlf-form111-goalUseInput'
            },
            goalAcSelect: {
                ga: 'form111.goalAcSelect',
                yam: 'form111-goalAcSelect',
                as: 'hlf-form111-goalAcSelect'
            },
            goalAcSelectType: {
                ga: 'form111.goalAcSelectType',
                yam: 'form111-goalAcSelectType',
                as: 'hlf-form111-goalAcSelectType'
            },
            goalUseSamples: {
                ga: 'form111.goalUseSamples',
                yam: 'form111-goalUseSamples',
                as: 'hlf-form111-goalUseSamples'
            },
            placeholder: 'Введите город или название отеля...',
            onSelectShowCalendar: 'checkIn',
            hint: 'Напишите хоть что-нибудь!',
            className: 'super-puper-input',
            avgPricesCalendars: ['checkIn'],
            samplesText: 'Например, {list}',
            samplesList: [
                {
                    id: 15542,
                    type: 'location',
                    text: 'Париж, Франция',
                    sample: 'Париж'
                },
                {
                    id: 12153,
                    type: 'location',
                    text: 'Москва, Россия',
                    sample: 'Москва'
                }
            ]
        }),
        checkIn: hlf.calendar({
            goalSelectDate: {
                ga: 'form111.checkInSelectDate',
                yam: 'form111-checkInSelectDate',
                as: 'hlf-form111-checkInSelectDate'
            },
            required: false,
            head: 'Дата заезда',
            placeholder: 'Дата заезда',
            hintEmpty: 'Нужно указать дату заезда и выезда',
            name: 'checkIn',
            className: 'super-puper-checkin',
            relationCalendar: 'checkOut',
            relationSuperior: true,
            relationAutoSet: true,
            relationAutoShow: true,
            locale: 'ru-RU',
            value: '',
            inline: false,
            isAutoShown: true,
            min: -1
        }),
        checkOut: hlf.calendar({
            required: false,
            head: 'Дата выезда',
            placeholder: 'Дата выезда',
            hintEmpty: 'Нужно указать дату заезда и выезда',
            className: 'super-puper-checkout',
            name: 'checkOut',
            relationCalendar: 'checkIn',
            relationSuperior: false,
            relationAutoSet: true,
            relationAutoShow: true,
            inline: false,
            isAutoShown: true,
            locale: 'ru-RU',
            //value: new Date((new Date()).getTime() + 6 * 24 * 60 * 60 * 1000),
            min: 0
        }),
        noDates: hlf.noDates({
            text: 'Я еще не знаю дат',
            calendars: ['checkIn', 'checkOut'],
            goalChange: {
                as: 'sadsas'
            }
        }),
        guests: hlf.guests({
            adults: 2,
            goalOpen: {
                ga: 'hlfcat.guestsitem',
                as: 'hlf-guests'
            },
            adultsTitle: function(adults) {
                var string = 'Взрослый';
                if (adults > 1) {
                    string = 'Взрослых'
                }
                return string;
            },
            childrenTitle: function(children) {
                return 'Детей';
            },
            className: 'super-puper-quests',
            titlesPosInside: true,
            decControlContent: '&minus;',
            incControlContent: '&plus;',
            decControlContentChld: 'bebebe',
            incControlContentChld: 'rrrrr',
            childValSep: true,
            childHint: 'Укажите возраст ребенка (0-17 лет)',
            summary: function (adults, children) {
                return 'Гостей ' + (adults + children.length);
            }
        }),
        submit: hlf.submit({
            className: 'super-puper-submit',
            text: 'Узнать цены',
            goalClick: {
                as: 'form111--------button'
            }
        })
    },
    target: '_blank',
    params: {
        language: 'es-ES',
        currency: 'rub'
    },
    hash: 'asdsd=asdasds',
    goalSubmit: {
        yam: 'sumbimt!',
        as: 'form0submit----------!'
    }
});