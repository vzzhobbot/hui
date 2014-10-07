$(function() {
    hui.form('form111', {

        destination: hui.ac({
            id: 15542,
            type: 'location',
            text: 'Paris, France',
            url: 'http://yasen.hotellook.com/autocomplete?lang=en-us&limit=5&term={term}',
            placeholder: 'Type location or hotel name...',
            onSelectShowCalendar: 'checkIn',
            avgPricesUrl: 'http://hotellook2.local/ajax/location-avg-prices.json?locationId={id}',
            avgPricesCalendars: ['checkIn', 'checkOut'],
            samplesList: [
                {
                    id: 15542,
                    text: 'Paris, France',
                    type: 'location',
                    sample: 'Paris'
                },
                {
                    id: 12153,
                    text: 'Moscow, Russia',
                    type: 'location',
                    sample: 'Moscow'
                }
            ]
        }),

        checkIn: hui.calendar({
            required: true,
            placeholder: 'Check-in',
            name: 'checkIn',
            onSelect: function(dateText, dateFormat, e, controls) {
                if (!controls.checkOut.getStamp() || controls.checkIn.getStamp() >= controls.checkOut.getStamp()) {
                    controls.checkOut.setDate(controls.checkIn.getDate(), 1);
                }
            },
            locale: 'ru-RU',
            min: -1
        }),

        checkOut: hui.calendar({
            required: true,
            placeholder: 'Check-out',
            name: 'checkOut',
            onSelect: function(dateText, dateFormat, e, controls) {
                if(!controls.checkIn.getStamp() || controls.checkIn.getStamp() >= controls.checkOut.getStamp()) {
                    controls.checkIn.setDate(controls.checkOut.getDate(), -1);
                }
            },
            locale: 'ru-RU',
            min: 0
        }),

        noDates: hui.checkbox({
            name: 'noDates',
            text: 'No dates',
            onOn: function(e, controls) {
                controls.checkIn.disable();
                controls.checkOut.disable();
            },
            onOff: function(e, controls) {
                controls.checkIn.enable();
                controls.checkOut.enable();
            }
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