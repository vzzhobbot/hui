$(function() {
    hui.form('form111', {

        destination: hui.ac({
            id: 15542,
            type: 'location',
            text: 'Париж, Франция',
            locale: 'ru-RU',
            placeholder: 'Введите город или название отеля...',
            onSelectShowCalendar: 'checkIn',
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
            min: -1,
            value: new Date()
        }),

        checkOut: hui.calendar({
            required: true,
            placeholder: 'Дата выезда',
            hintText: 'Нужно указать дату заезда и выезда',
            name: 'checkOut',
            moreThan: 'checkIn',
            locale: 'ru-RU',
            min: 0,
            value: new Date()
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