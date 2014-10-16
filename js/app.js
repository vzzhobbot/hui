$(function() {
    hlf.form('form111', {

        destination: hlf.ac({
            id: 15542,
            type: 'location',
            text: 'Париж, Франция',
            locale: 'ru-RU',
            gaEvent: ['form111', 'query'],
            placeholder: 'Введите город или название отеля...',
            onSelectShowCalendar: 'checkIn',
            avgPricesCalendars: ['checkIn'],
            hint: 'Напишите хоть что-нибудь!',
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
            gaEvent: ['form111', 'checkIn'],
            required: true,
            head: 'Дата заезда',
            placeholder: 'Дата заезда',
            hintEmpty: 'Нужно указать дату заезда и выезда',
            name: 'checkIn',
            relationCalendar: 'checkOut',
            relationSuperior: true,
            relationAutoSet: true,
            relationAutoShow: true,
            locale: 'ru-RU',
            min: -1
        }),

        checkOut: hlf.calendar({
            gaEvent: ['form111', 'checkOut'],
            required: true,
            head: 'Дата выезда',
            placeholder: 'Дата выезда',
            hintEmpty: 'Нужно указать дату заезда и выезда',
            name: 'checkOut',
            relationCalendar: 'checkIn',
            relationSuperior: false,
            relationAutoSet: true,
            relationAutoShow: true,
            locale: 'ru-RU',
            min: 0
        }),

        noDates: hlf.noDates({
            text: 'Я еще не знаю дат',
            calendars: ['checkIn', 'checkOut'],
            gaEvent: ['form111', 'noDates']
        }),

        guests: hlf.guests({
            adults: 2,
            children: [12],
            gaEvent: ['form111', 'guests'],
            adultsTitle: 'Взрослых',
            childrenTitle: 'Детей',
            childHint: 'Укажите возраст ребенка (0-17 лет)',
            summary: function(adults, children) {
                return 'Гостей ' + (adults + children.length);
            }
        }),

        submit: hlf.submit({
            text: 'Узнать цены',
            gaEvent: ['form111', 'button']
        })

    }, {
        language: 'ru-ru',
        currency: 'rub'
    }, ['form111', 'submit']);
});