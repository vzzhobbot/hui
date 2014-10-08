$(function() {

    var y = new Date();
    y.setDate(y.getDate() - 1);

    var t = new Date();
    t.setDate(t.getDate() + 1);

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
            head: 'Дата заезда',
            placeholder: 'Дата заезда',
            hintEmpty: 'Нужно указать дату заезда и выезда',
            name: 'checkIn',
            relationCalendar: 'checkOut',
            relationSuperior: true,
            relationAutoSet: true,
            locale: 'ru-RU',
            min: -1
        }),

        checkOut: hui.calendar({
            required: true,
            head: 'Дата выезда',
            placeholder: 'Дата выезда',
            hintEmpty: 'Нужно указать дату заезда и выезда',
            name: 'checkOut',
            relationCalendar: 'checkIn',
            relationSuperior: false,
            relationAutoSet: true,
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