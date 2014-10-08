$(function() {
    hui.form('form111', {

        destination: hui.ac({
            id: 15542,
            type: 'location',
            text: 'Paris, France',
            locale: 'ru-RU',
            placeholder: 'Type location or hotel name...',
            onSelectShowCalendar: 'checkIn',
            avgPricesUrl: 'http://hotellook2.local/ajax/location-avg-prices.json?locationId={id}',
            avgPricesCalendars: ['checkIn', 'checkOut'],
            samplesList: [
                {
                    id: 15542,
                    type: 'location',
                    text: 'Paris, France',
                    sample: 'Paris'
                },
                {
                    id: 12153,
                    type: 'location',
                    text: 'Moscow, Russia',
                    sample: 'Moscow'
                }
            ]
        }),

        checkIn: hui.calendar({
            required: true,
            placeholder: 'Check-in',
            name: 'checkIn',
            lessThan: 'checkOut',
            locale: 'ru-RU',
            min: -1
        }),

        checkOut: hui.calendar({
            required: true,
            placeholder: 'Check-out',
            name: 'checkOut',
            moreThan: 'checkIn',
            locale: 'ru-RU',
            min: 0
        }),

        noDates: hui.noDates({
            text: 'No dates',
            calendars: ['checkIn', 'checkOut']
        }),

        guests: hui.guests({
            adults: 2,
            summary: function(adults, children) {
                return 'guests ' + (adults + children.length);
            }
        }),

        submit: hui.submit({
            text: 'go-go-go!'
        })

    }, {
        language: 'ru-ru',
        currency: 'rub'
    });
});