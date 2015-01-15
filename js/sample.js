var maForm = hlf.form('form111', {

    destination: hlf.ac({
        locale: 'ru-RU',
        placeholder: 'Введите город или название отеля...',
        onSelectShowCalendar: 'checkIn',
        avgPricesCalendars: ['checkIn'],
        hint: 'Напишите хоть что-нибудь!',
        categoryTranslate: function(t) {
            return t == 'Locations' ? 'Города' : 'Отели';
        },
        hotelsCountTranslate: function(n) {
            return n + ' отелей';
        }
    }),

    checkIn: hlf.calendar({
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
        calendars: ['checkIn', 'checkOut']
    }),

    guests: hlf.guests({
        adults: 2,
        adultsTitle: 'Взрослых',
        childrenTitle: 'Детей',
        childAge: 'Возраст',
        childHint: 'Укажите возраст ребенка (0-17 лет)',
        summary: function (adults, children) {
            return 'Гостей ' + (adults + children.length);
        }
    }),

    submit: hlf.submit({
        text: 'Узнать цены'
    })

}, {
    language: 'ru-ru',
    currency: 'rub'
    //... some thing else
});