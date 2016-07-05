;
(function ($, _, hlf) {
    'use strict';

    hlf.calendar = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $ia = null, // input alt
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
            className: '',
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
            inline: false,
            mobileMode: hlf.config.mobileMode,
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
            relationSuperior: false, // 1 - superior, 0 - inferior
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
        function show(flag) {
            isAutoShown = !!flag;
            if ( config.mobileMode === true ) {
                $i.focus();

            } else {
                setTimeout(function () { // jquery.ui.datepicker show cheat
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
            if (relation && relation.getStamp() && getStamp() && getDate()) {
                // for superior relation set to 1 day more
                if (config.relationSuperior) {
                    if (relation.getStamp() <= getStamp()) {
                        relation.setAnotherDate(getDate(), 1);
                    }
                }
                // for inferior relation set to -1 day
                else {
                    if (relation.getStamp() >= getStamp()) {
                        relation.setAnotherDate(getDate(), -1);
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
            if (relation && !relation.getStamp() && config.relationAutoSet && getDate()) {
                relation.setAnotherDate(getDate(), config.relationSuperior ? 1 : -1);
            }
        }

        /**
         * Auto show relation calendar
         */
        function relationAutoShow(date) {
            var relation = controls[config.relationCalendar];
            if (relation && config.relationAutoShow && !isAutoShown) { // if this calendar has been shown by its
                relation.show(true, date);
            }
        }

        function getStamp() {
            var date=config.mobileMode?$i[0].value:$i.datepicker('getDate');

            if (date) {
                return (new Date(date)).getTime();
            }
            return null;
        }

        function getDate(i) { //argument for this function - input; if function called without argument, it uses the default input

            var input;
            input= i ? i : $i;
            var date;
            date=config.mobileMode?input[0].value:input.datepicker("getDate");
            if (date) {
                return new Date(date);
            }

            return null;
        }

        function setAnotherDate(date, modify) {
            var newDateStamp = new Date();
            newDateStamp.setTime(date.getTime() + ((modify || 0) * 86400000));
            var newDate = new Date(newDateStamp);
            if (config.mobileMode) {
                $i[0].value= dateToString(newDate)
            } else {
                $i.datepicker('setDate', newDate);
            }
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
                cfg[2] = details.formatter(details.dates[dateAsStr].price);
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

        function dateToString(date) {
            var str;
            var tM = (date.getUTCMonth()+1)
            var tD = date.getUTCDate();
            tM<10&&(tM="0"+tM);
            tD<10&&(tD="0"+tD);
            str = date.getUTCFullYear()+"-"+tM+"-"+tD;
            return str;
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
        return function (name, $f, c, ti, $pl) {

            controls = c || {};
            config.tabIndex = ti || 0;
            $c = hlf.getContainer($f, 'calendar', name);
            $c.html(config.tplInput(config));

            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $ia = hlf.getEl($c, 'alt-input');
            $h = hlf.getEl($c, 'hint');
            config.className&&$iw.addClass(config.className);
            $pl = hlf.getEl($c, 'placeholder');
            if ( config.mobileMode === true && $i[0]) {
                // initialization native date input
                $i[0].type = 'date';
                $iw.addClass('html5date');

                var today=new Date,mindate=new Date;mindate.setDate(today.getDate()+config.min);
                $i[0].min =  dateToString(mindate);

            } else {
                // draw ui control
                $i.datepicker({
                    minDate: config.min,
                    numberOfMonths: config.months,
                    altField: $ia,
                    onSelect: function (date, e) {
                        relationAdjust();
                        relationAutoSet();
                        relationAutoShow( $.datepicker.formatDate(config.format, getDate()));
                        config.onSelect(date, $.datepicker.formatDate(config.format, getDate()), e);
                        hlf.goal(config.goalSelectDate);
                        $iw.removeClass('hlf-state--error');
                    },
                    beforeShowDay: function (date) {
                        updateRange();
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
                                    'points': _.map(details.points, details.formatterLegend)
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
              if ( config.mobileMode === true && $i[0]) {
                $i[0].value =  dateToString(config.value || '');
                $pl.addClass('hidden');
              } else {

                  // correct date by timezone offset
                  config.value.setTime(config.value.getTime() + config.value.getTimezoneOffset() * 60 * 1000);
                  $i.datepicker('setDate', config.value);
              }
            }

            // customize datepicker with locale, unfortunately only this method works well
            if (config.locale) {
                $i.datepicker('option', $.datepicker.regional[config.locale]);
            }

            $i.on('focus', function () {
                $c.addClass('hlf-state--focus');
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
                $pl.addClass('hidden');
            });

            $i.on('blur', function () {
                $c.removeClass('hlf-state--focus');
                $iw.removeClass('hlf-state--focus');

                if (config.mobileMode === true) {
                    relationAdjust();   //check the correct date in inputs
                    relationAutoSet();
                }

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
                setAnotherDate: setAnotherDate,
                getParams: getParams,
                setDetails: setDetails,
                getDetails: getDetails,
                resetDetails: resetDetails,
                validate: validate,
                input: $i,
                inputAlt: $ia,
                placeholder: $pl
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
        altFormat: 'D, d M',
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
        dateFormat: 'D, MM d yy', firstDay: 0,
        altFormat: 'D, MM d',
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
        altFormat: 'd M',
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
        altFormat: 'd MM',
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
        altFormat: 'd MM',
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
        altFormat: 'd MM',
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
        altFormat: 'd MM',
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
        altFormat: 'd M',
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['id-ID'] = {
        closeText: 'Tutup',
        prevText: '&#x3C;mundur',
        nextText: 'maju&#x3E;',
        currentText: 'hari ini',
        monthNames: ['Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','Nopember','Desember'],
        monthNamesShort: ['Jan','Feb','Mar','Apr','Mei','Jun',
            'Jul','Agus','Sep','Okt','Nop','Des'],
        dayNames: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
        dayNamesShort: ['Min','Sen','Sel','Rab','kam','Jum','Sab'],
        dayNamesMin: ['Mg','Sn','Sl','Rb','Km','jm','Sb'],
        weekHeader: 'Mg',
        dateFormat: 'dd/mm/yy',
        altFormat: 'dd/mm',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['pt-BR'] = {
        closeText: 'Fechar',
        prevText: '&#x3C;Anterior',
        nextText: 'Próximo&#x3E;',
        currentText: 'Hoje',
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun',
            'Jul','Ago','Set','Out','Nov','Dez'],
        dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['pt-PT'] = {
        closeText: 'Fechar',
        prevText: 'Anterior',
        nextText: 'Seguinte',
        currentText: 'Hoje',
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun',
            'Jul','Ago','Set','Out','Nov','Dez'],
        dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        weekHeader: 'Sem',
        dateFormat: 'dd/mm/yy',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };

    $.datepicker.setDefaults($.datepicker.regional['en-US']);

})(jQuery, _, hlf);
