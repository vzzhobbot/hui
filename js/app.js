$(function() {
    hui.form('form111', {

        destination: hui.ac({
            id: 15542,
            type: 'location',
            text: 'Париж, Франция',
            locale: 'ru-RU',
            placeholder: 'Введите город или название отеля...',
            onSelectShowCalendar: 'checkIn',
            avgPricesUrl: 'http://hotellook2.local/ajax/location-avg-prices.json?locationId={id}',
            avgPricesCalendars: ['checkIn', 'checkOut'],
            hintText: 'Напишите хоть что-нибудь!',
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

        checkIn: hui.calendar({
            required: true,
            placeholder: 'Дата заезда',
            hintText: 'Нужно указать дату заезда и выезда',
            name: 'checkIn',
            lessThan: 'checkOut',
            locale: 'ru-RU',
            min: -1
        }),

        checkOut: hui.calendar({
            required: true,
            placeholder: 'Дата выезда',
            hintText: 'Нужно указать дату заезда и выезда',
            name: 'checkOut',
            moreThan: 'checkIn',
            locale: 'ru-RU',
            min: 0
        }),

        noDates: hui.noDates({
            text: 'Я еще не знаю дат',
            calendars: ['checkIn', 'checkOut']
        }),

        guests: hui.guests({
            adults: 2,
            adultsTitle: 'Взрослых',
            childrenTitle: 'Детей',
            childHintText: 'Укажите возраст ребенка (0-17 лет)',
            summary: function(adults, children) {
                return 'Гостей ' + (adults + children.length);
            }
        }),

        submit: hui.submit({
            text: 'Узнать цены'
        })

    }, {
        language: 'ru-ru',
        currency: 'rub'
    });
});