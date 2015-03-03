;
(function ($, _, hlf) {
    'use strict';

    hlf.calendar = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint

            controls = {},
            uid = _.uniqueId('hlf.calendar'), /* Unique id for "refresh" cheating.
         * $i.datepicker('widget') returns any opened datepicker,
         * that means we need to mark this calendar with uid
         * to check uid in refresh function */
            details = {}, // day details
            range = {
                'in': null, // if you use relation calendar here is inferior date value
                'out': null // ... and here superior date value
            },
            isAutoShown = false; // it means calendar been shown automatically (not by user)

        config = _.defaults(config || {}, {

            required: false,
            name: 'date', // getParams() param name
            value: null, // default date Date()
            format: 'yy-mm-dd', // getParams() param value format
            min: 0, // min selectable date (in days from today)
            months: (function () {
                if (window.innerWidth <= 700) {
                    return 1
                } else {
                    return 2
                }
            })(), // num of months visible in datepicker
            locale: 'en-US',

            placeholder: 'Choose date...',
            hintEmpty: 'Its required field', // hint text if required calendar field is empty
            head: null, // datepicker head text
            legend: 'Days colored by average price for the night',
            // todo hint text if relation calendar date >30 days
            // hintPeriod: 'period-panica!',

            goalSelectDate: {}, // goal on select date
            onSelect: function () {
            },

            relationCalendar: null, // name of control
            relationSuperior: true, // 1 - superior, 0 - inferior
            relationAutoSet: false,
            relationAutoShow: false,

            tplInput: hlf.getTpl('calendar.input'),
            tplHead: hlf.getTpl('calendar.head'),
            tplLegend: hlf.getTpl('calendar.legend')

        });

        function disable() {
            $i.datepicker('option', 'disabled', true);
            $iw.addClass('hlf-state--disabled');
            $iw.removeClass('hlf-state--error');
        }

        function enable() {
            $i.datepicker('option', 'disabled', false);
            $iw.removeClass('hlf-state--disabled');
        }

        /**
         * Show calendar
         * @param flag it means calendar has been shown automatically (by another control)
         */
        function show(flag, date) {
            if (window.calendar) {
                return false
            } else {
                isAutoShown = !!flag;
                setTimeout(function () { // jquery.ui.datepicker show cheat
                    if (flag && date) {
                        var givenDate = new Date(date);
                        if (($i.datepicker("getDate")==null) || ($i.datepicker("getDate")).getTime() < givenDate.getTime() ) {
                            $i.datepicker( "setDate", givenDate );
                        };
                    }
                    $i.datepicker('show');

                }, 16);
            }

        }

        /**
         * Hide calendar
         */
        function hide() {
            $i.datepicker('hide');
        }

        /**
         * Refresh calendar
         */
        function refresh() {
            var $widget = $i.datepicker('widget');
            if ($widget.is(':visible') && $widget.attr('__cheat') == uid) { // use __cheat to refresh this own calendar
                // because in $widget may be any calendar
                $i.datepicker('refresh');
            }
        }

        /**
         * Adjust relation calendar
         */
        function relationAdjust() {
            var relation = controls[config.relationCalendar];
            // is it has value?
            if (relation && relation.getStamp()) {
                // for superior relation set to 1 day more
                if (config.relationSuperior) {
                    if (relation.getStamp() <= getStamp()) {
                        relation.setDate(getDate(), 1);
                    }
                }
                // for inferior relation set to -1 day
                else {
                    if (relation.getStamp() >= getStamp()) {
                        relation.setDate(getDate(), -1);
                    }
                }
            }
        }

        /**
         * Auto set relation calendar value
         */
        function relationAutoSet() {
            var relation = controls[config.relationCalendar];
            // auto set value only if there is no value & relationAutoSet = true
            if (relation && !relation.getStamp() && config.relationAutoSet) {
                relation.setDate(getDate(), config.relationSuperior ? 1 : -1);
            }
        }

        /**
         * Auto show relation calendar
         */
        function relationAutoShow(date) {
            var relation = controls[config.relationCalendar];
            if (relation && config.relationAutoShow && !isAutoShown) { // if this calendar has been shown by its
                // relation (isAutoShown=true), we dont
                // show first one
                relation.show(true, date);
            }
        }

        function getStamp() {
            var date = $i.datepicker('getDate');
            if (date) {
                return (new Date($i.datepicker('getDate'))).getTime();
            }
            return null;
        }

        function getDate() {
            var date;
            if (window.calendar) {
                date = $i[0].value;
            } else {
                date = $i.datepicker('getDate');
            }
            if (date) {
                return new Date(date);
            }
            return null;
        }

        function setDate(date, modify) {
            $i.datepicker('setDate', date.setDate(date.getDate() + (modify || 0)));
            $iw.removeClass('hlf-state--error');
        }

        function validate() {
            if (!config.required || $i.datepicker('option', 'disabled') || _.size(getParams())) {
                return true;
            }
            $iw.addClass('hlf-state--error');
            $h.html(config.hintEmpty);
            return false;
        }

        /**
         * Process each date average price & calculate day details
         * todo fix it strange logic
         * @param data
         * @param formatter function
         */
        function specifyDetails(data, formatter) {
            if (!_.size(data))
                return false;
            var count = 0,
                sum = 0,
                min = 0,
                max = 0;
            _.each(data, function (v) {
                if (!min || v < min)
                    min = v;
                if (!max || v > max)
                    max = v;
                sum += v;
                count++;
            });
            // calculate average and diff with min & max
            var average = sum / count,
                diffMax = max - average,
                diffMin = average - min,
                dates = {};
            _.each(data, function (v, date) {
                // price more than average?
                var diff = v - average,
                    up = true;
                if (diff < 0) {
                    up = false;
                    diff = Math.abs(diff);
                }
                // choose closest position
                var percent = diff * 100 / (up ? diffMax : diffMin),
                    rate = 2;
                if (up) {
                    if (percent > 20)
                        rate = 3;
                    if (percent > 60)
                        rate = 4;
                } else {
                    if (percent > 20)
                        rate = 1;
                    if (percent > 60)
                        rate = 0;
                }
                dates[date] = {
                    'value': v, // average price
                    'rate': rate // rate for this price (0 - cheap, 4 - expensive)
                };
            }, this);
            setDetails({
                dates: dates,
                points: [ // price points for legend
                        average - diffMin * 0.8,
                    average,
                        average + diffMax * 0.8
                ],
                formatter: formatter || function (v) {
                    return v
                }
            });
            return true;
        }

        function setDetails(d) {
            $iw.addClass('hlf-state--detailed');
            details = d;
        }

        function getDetails() {
            return details;
        }

        function resetDetails() {
            $iw.removeClass('hlf-state--detailed');
            details = {};
        }

        /**
         * Returns cfg for each date cell in calendar
         *
         * @param date
         * @returns {*[]}
         */
        function getDayCfg(date) {
            var dateAsStr = $.datepicker.formatDate('yy-mm-dd', date),
                cfg = [true, '', ''];

            // fill cfg with date details
            if (!_.isUndefined(details.dates) && details.dates[dateAsStr]) {
                cfg[1] += ' ui-datepicker-dayType ui-datepicker-dayType--' + details.dates[dateAsStr].rate; // cell class
                cfg[2] = details.formatter(details.dates[dateAsStr].value);
            }

            // fill cfg with range details
            if (controls[config.relationCalendar]) {
                // in range
                cfg[1] += range['in'] && range['out'] && (range['in'].getTime() <= date.getTime() && date.getTime() <= range['out'].getTime()) ?
                    ' ui-datepicker-dayRange' :
                    '';
                // it is in or out date?
                cfg[1] += range['in'] && range['in'].getTime() == date.getTime() ? ' ui-datepicker-dayRange-in' : '';
                cfg[1] += range['out'] && range['out'].getTime() == date.getTime() ? ' ui-datepicker-dayRange-out' : '';
            }

            return cfg;
        }

        /**
         * On mouse hover calendar cell
         * @param e event
         * @param i datepicker instance
         */
        function dateMouseEnter(e, i) {

            var $hover = $(this),
                hoverDate = new Date($hover.data('year') + '-' + ($hover.data('month') + 1) + '-' + $hover.data('day') + ' 00:00:00');
            $hover.addClass('ui-datepicker-dayRange-hover--' + (config.relationSuperior ? 'in' : 'out'));

            // highlight range on hover
            $('[data-handler=selectDay]', i.dpDiv).each(function () {
                var $cell = $(this),
                    cellDate = new Date($cell.data('year') + '-' + ($cell.data('month') + 1) + '-' + $cell.data('day') + ' 00:00:00');
                if (config.relationSuperior ?
                    range['out'] && cellDate.getTime() >= hoverDate.getTime() && cellDate.getTime() <= range['out'].getTime() :
                    range['in'] && cellDate.getTime() <= hoverDate.getTime() && cellDate.getTime() >= range['in'].getTime()) {
                    $cell.addClass('ui-datepicker-dayRange-hover');
                }
            });
        }

        /**
         * On mouse over from calendar cell
         * @param e event
         * @param i datepicker instance
         */
        function dateMouseLeave(e, i) {
            // remove all hover classes
            $('[data-handler=selectDay]', i.dpDiv).each(function () {
                $(this).removeClass('ui-datepicker-dayRange-hover');
                $(this).removeClass('ui-datepicker-dayRange-hover--in');
                $(this).removeClass('ui-datepicker-dayRange-hover--out');
            });
        }

        function getParams() {
            var r = {};
            if ($i.datepicker('option', 'disabled')) {
                return r;
            }
            var date = getDate();
            if (date) {
                r[config.name] = $.datepicker.formatDate(config.format, date);
            }

            return r;
        }

        // todo something wrong here
        function updateRange() {
            var rel = controls[config.relationCalendar];
            if (rel) {
                range['in'] = getDate();
                range['out'] = rel.getDate();
                if (!config.relationSuperior) {
                    var tmp = range['in'];
                    range['in'] = range['out'];
                    range['out'] = tmp;
                }
            }
        }

        function selectMonth(date, f) {
            $c = hlf.getContainer(f, 'calendar', config.relationCalendar);
            $i = hlf.getEl($c, 'input');
            $($i).datepicker( "setDate", date );
        }

        /**
         * Draw
         *
         * @param name
         * @returns {*[]}
         */
        return function (name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'calendar', name);
            $c.html(config.tplInput(config));

            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');


            var x = document.createElement('input'); x.setAttribute('type', 'date');
            if (x.type == 'date' && window.innerWidth <= 500 && document.body.clientWidth <= 500) {
                // native date input
                $i.parent().addClass('html5date');
                window.calendar = true;
                var div = document.createElement('div');
                div.className = 'pseudo-placeholder';
                div.innerHTML = $i[0].placeholder;
                $(div).insertAfter($($i));

                var elements = document.getElementsByClassName('pseudo-placeholder');

                for (var i = 0; i < elements.length; i++) {
                    elements[i].addEventListener('click', (function(i) {
                        return function() {
                            this.style.display = 'none';
                           this.previousSibling.focus();
                        };
                    })(i), false);
                }

                var today = new Date();
                var yesterday = new Date();
                yesterday.setDate(today.getDate()-1);

                var tM = (yesterday.getUTCMonth()+1)
                var tD = yesterday.getUTCDate();
                tM<10&&(tM="0"+tM);
                tD<10&&(tD="0"+tD);
                $i[0].min = yesterday.getUTCFullYear()+"-"+tM+"-"+tD;

                $i[0].addEventListener('focus', function(e){
                    $i[0].nextSibling.style.display = 'none';
                    if ($(e.target).closest('[hlf-calendar=checkOut]').length > 0 && ( $('[hlf-calendar=checkIn]').find('input')[0].value)){
                        var dateIn = new Date( $('[hlf-calendar=checkIn]').find('input')[0].value) ;
                        var nextDay = new Date();
                        nextDay.setDate(dateIn.getDate()+1);
                        var d = nextDay.getUTCDate();
                        var m = nextDay.getUTCMonth()+1;
                        m<10&&(m="0"+m);
                        d<10&&(d="0"+d);
                        e.target.min = nextDay.getUTCFullYear()+"-"+m+"-"+d;
                        e.target.value.length==0&&(e.target.value=nextDay.getUTCFullYear()+"-"+m+"-"+d);
                    };
                }, false);

                $i[0].addEventListener('blur', function(e){
                    var form = $(e.target).closest('form');
                    if ($(e.target).closest('[hlf-calendar=checkIn]').length > 0 && ( form.find('[hlf-calendar=checkIn]').find('input')[0].value) && ( form.find('[hlf-calendar=checkOut]').find('input')[0].value.length==0)){
                        var dateIn = new Date( form.find('[hlf-calendar=checkIn]').find('input')[0].value) ;
                        var nextDay = new Date();
                        nextDay.setDate(dateIn.getDate()+1);
                        var d = nextDay.getUTCDate();
                        var m = nextDay.getUTCMonth()+1;
                        m<10&&(m="0"+m);
                        d<10&&(d="0"+d);
                        form.find('[hlf-calendar=checkOut]').find('input')[0].min=nextDay.getUTCFullYear()+"-"+m+"-"+d;
                        form.find('[hlf-calendar=checkOut]').find('input')[0].value=nextDay.getUTCFullYear()+"-"+m+"-"+d;
                    };

                    if ($(e.target).closest('[hlf-calendar=checkOut]').length > 0 && ( form.find('[hlf-calendar=checkOut]').find('input')[0].value)) {
                        var maxdate = form.find('[hlf-calendar=checkOut]').find('input')[0].value;
                        form.find('[hlf-calendar=checkIn]').find('input')[0].max=maxdate;

                    }
                    }, false);
            } else {
                // draw ui control

                $i[0].type = 'text';
                $i.datepicker({
                    minDate: config.min,
                    numberOfMonths: config.months,
                    onSelect: function (date, e) {
                        relationAdjust();
                        relationAutoSet();
                        relationAutoShow( $.datepicker.formatDate(config.format, getDate()));
                        config.onSelect(date, $.datepicker.formatDate(config.format, getDate()), e);
                        hlf.goal(config.goalSelectDate);
                        $iw.removeClass('hlf-state--error');
                    },
                    beforeShowDay: function (date) {
                        return getDayCfg(date);
                    },
                    beforeShow: function (e, i) {
                        i.dpDiv.attr('__cheat', uid);
                        updateRange();
                    },
                    afterShow: function (i) {
                        if (config.head) {
                            i.dpDiv.prepend(config.tplHead({
                                head: config.head
                            }));
                        }
                        if (_.isArray(details.points) && details.points.length) {
                            $(i.dpDiv).append(
                                config.tplLegend({
                                    'legend': config.legend,
                                    'points': _.map(details.points, details.formatter)
                                })
                            );
                        }
                        if (controls[config.relationCalendar]) {
                            $('[data-handler=selectDay]', i.dpDiv)
                                .on('mouseenter', _.partialRight(dateMouseEnter, i))
                                .on('mouseleave', _.partialRight(dateMouseLeave, i));
                        }
                    },
                    onClose: function (date, i) {
                        $('[data-handler=selectDay]', i.dpDiv).off('mouseenter mouseleave');
                        isAutoShown = false;
                    }
                });
            }
            // maybe set a default value?
            if (_.isDate(config.value)) {
                // correct date by timezone offset
                config.value.setTime(config.value.getTime() + config.value.getTimezoneOffset() * 60 * 1000);
                $i.datepicker('setDate', config.value);
            }

            // customize datepicker with locale, unfortunately only this method works well
            if (config.locale) {
                $i.datepicker('option', $.datepicker.regional[config.locale]);
            }

            $i.on('focus', function () {
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
            });

            $i.on('blur', function () {
                $iw.removeClass('hlf-state--focus');
            });

            $h.on('click', function () {
                $iw.removeClass('hlf-state--error');
            });

            return {
                config: config,
                disable: disable,
                enable: enable,
                refresh: refresh,
                show: show,
                hide: hide,
                getStamp: getStamp,
                getDate: getDate,
                setDate: setDate,
                getParams: getParams,
                setDetails: setDetails,
                getDetails: getDetails,
                resetDetails: resetDetails,
                specifyDetails: specifyDetails,
                validate: validate
            };

        };

    };

    /**
     * Extension for jQuery.ui.datepicker
     */
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function (inst) {
        $.datepicker._updateDatepicker_original(inst);

        // add data-day attr to day cell
        if (typeof inst.settings.beforeShowDay == 'function') {
            // wrap beforeShowDay function and...
            inst.settings.beforeShowDay = _.wrap(inst.settings.beforeShowDay, function (func, date) {
                var dayConfig = func(date); // call user function
                dayConfig[1] += "' data-day='" + date.getDate(); // use quote cheat :)
                return dayConfig;
            });
        }

        // after show extension
        // todo fix it: works bad, calls too often
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow) {
            afterShow.apply(null, [inst]);
        }

    };

    $.datepicker.regional['ru-RU'] = {clearText: 'Удалить', clearStatus: '',
        closeText: 'Закрыть', closeStatus: 'Закрыть без изменений',
        prevText: '< Предыдущие', prevStatus: 'Посмотреть предыдущие месяцы',
        nextText: 'Следующие >', nextStatus: 'Посмотреть следующие месяцы',
        currentText: 'Текущий', currentStatus: 'Посмотреть текущий месяц',
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesShort: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        monthStatus: 'Посмотреть другой месяц', yearStatus: 'Посмотреть другой год',
        weekHeader: 'Sm', weekStatus: '',
        dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        dayStatus: 'Использовать DD как первый день недели', dateStatus: 'Выбрать DD, MM d',
        dateFormat: 'D, d M yy', firstDay: 1,
        initStatus: 'Выбрать дату', isRTL: false
    };
    $.datepicker.regional['en-US'] = {
        closeText: 'Done',
        prevText: 'Prev',
        nextText: 'Next',
        currentText: 'Today',
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        weekHeader: 'Wk',
        dateFormat: 'D, MM d, yy', firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['en-GB'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['en-CA'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['en-IE'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['en-AU'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['fr-FR'] = {
        closeText: 'Fermer',
        prevText: 'Précédent',
        nextText: 'Suivant',
        currentText: 'Aujourd\'hlf',
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthNamesShort: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
        dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        weekHeader: 'Sem.',
        dateFormat: 'd M yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['es-ES'] = {
        closeText: 'Cerrar',
        prevText: '&#x3C;Ant',
        nextText: 'Sig&#x3E;',
        currentText: 'Hoy',
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        weekHeader: 'Sm',
        dateFormat: 'd MM yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['de-DE'] = {
        closeText: 'Schließen',
        prevText: '&#x3C;Zurück',
        nextText: 'Vor&#x3E;',
        currentText: 'Heute',
        monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
            'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        weekHeader: 'KW',
        dateFormat: 'd MM yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['th-TH'] = {
        closeText: 'ปิด',
        prevText: '&#xAB;&#xA0;ย้อน',
        nextText: 'ถัดไป&#xA0;&#xBB;',
        currentText: 'วันนี้',
        monthNames: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
        monthNamesShort: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        dayNames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
        dayNamesShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        dayNamesMin: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        weekHeader: 'Wk',
        dateFormat: 'd MM yy', firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['it-IT'] = {
        closeText: 'Chiudi',
        prevText: '&#x3C;Prec',
        nextText: 'Succ&#x3E;',
        currentText: 'Oggi',
        monthNames: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        monthNamesShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
            'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        dayNames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
        weekHeader: 'Sm',
        dateFormat: 'd MM yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['pl-PL'] = {
        closeText: 'Zamknij',
        prevText: '&#x3C;Poprzedni',
        nextText: 'Następny&#x3E;',
        currentText: 'Dziś',
        monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
        monthNamesShort: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
            'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
        dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
        dayNamesShort: ['Nie', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'],
        dayNamesMin: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
        weekHeader: 'Tydz',
        dateFormat: 'd M yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };

    $.datepicker.setDefaults($.datepicker.regional['en-US']);

})(jQuery, _, hlf);