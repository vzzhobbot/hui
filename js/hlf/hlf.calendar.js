;(function ($, _, hlf) {
    'use strict';

    hlf.calendar = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint
            controls = {},
            uid = _.uniqueId('hlf.calendar'); /* Unique id for "refresh" cheating.
                                               * $i.datepicker('widget') returns any opened datepicker,
                                               * that means we need to mark this calendar with uid
                                               * to check uid in refresh function */
        var details = {},
            isAutoShown = false;

        config = _.defaults(config || {}, {
            gaEvent: [], // category & event to send to ga, ex: ['formTop'], ['checkIn']
            required: false,
            placeholder: 'Choose date...',
            name: 'date', // getParams param name
            value: null, // Date()
            format: 'yy-mm-dd', // getParams() format
            min: 0, // min selectable date (in days from today)
            months: 2, // num of months visible in datepicker
            hintEmpty: 'empty-panica!', // hint text if required calendar field is empty
            hintPeriod: 'period-panica!', // todo hint text if relation calendar date >30 days
            head: null, // datepicker head text
            legend: 'Days colored by average price for the night',
            onSelect: function() {},
            locale: 'en-US',
            relationCalendar: null, // name of control
            relationSuperior: true, // 1 - superior, 0 - inferior
            relationAutoSet: false,
            relationAutoShow: false,
            tplInput: hlf.getTpl('calendar.input'),
            tplHead: hlf.getTpl('calendar.head'),
            tplLegend: hlf.getTpl('calendar.legend')
        });

        function getParams() {
            if($i.datepicker('option', 'disabled')) {
                return null;
            }
            var date = getDate();
            if(date) {
                return config.name + '=' + $.datepicker.formatDate(config.format, date);
            }
            return null;
        }

        function disable() {
            $i.datepicker('option', 'disabled', true);
            $iw.addClass('hlf-state--disabled');
            $iw.removeClass('hlf-state--error');
        }

        function enable() {
            $i.datepicker('option', 'disabled', false);
            $iw.removeClass('hlf-state--disabled');
        }

        function relationAdjust() {
            var relation = controls[config.relationCalendar];
            if(relation && relation.getStamp()) {
                if(config.relationSuperior) {
                    if(relation.getStamp() <= getStamp()) {
                        relation.setDate(getDate(), 1);
                    }
                } else {
                    if(relation.getStamp() >= getStamp()) {
                        relation.setDate(getDate(), -1);
                    }
                }
            }
        }

        function relationAutoSet() {
            var relation = controls[config.relationCalendar];
            if(relation && !relation.getStamp() && config.relationAutoSet) {
                if(config.relationSuperior) {
                    relation.setDate(getDate(), 1);
                } else {
                    relation.setDate(getDate(), -1);
                }
            }
        }

        function relationAutoShow() {
            var relation = controls[config.relationCalendar];
            if(relation && !isAutoShown) {
                if(config.relationAutoShow) {
                    relation.show(true);
                }
            }
        }

        function draw(name, $f, c) {
            controls = c || {};
            $c = hlf.getContainer($f, 'calendar', name);
            $c.html(config.tplInput(config));
            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');

            $i.datepicker({
                minDate: config.min,
                numberOfMonths: config.months,
                //showOn: 'both', // todo
                //buttonText: '',
                onSelect: function(date, e) {
                    relationAdjust();
                    relationAutoSet();
                    relationAutoShow();
                    config.onSelect(date, $.datepicker.formatDate(config.format, getDate()), e);
                    hlf.ga.event(config.gaEvent);
                    $iw.removeClass('hlf-state--error');
                },
                beforeShowDay: function(date) {
                    return getDayCfg(date);
                },
                beforeShow: function(e, i) {
                    i.dpDiv.attr('__cheat', uid);
                },
                afterShow: function() {
                    if(config.head) {
                        $('#ui-datepicker-div').prepend(config.tplHead({
                            head: config.head
                        }));
                    }
                    if(_.isArray(details.points) && details.points.length) {
                        $('.ui-datepicker-row-break').html(
                            config.tplLegend({
                                'legend': config.legend,
                                'points': _.map(details.points, details.formatter)
                            })
                        );
                    }
                },
                onClose: function() {
                    isAutoShown = false;
                }
            });
            // maybe set a date?
            if(_.isDate(config.value)) {
                // correct date by timezone offset
                config.value.setTime(config.value.getTime() + config.value.getTimezoneOffset() * 60 * 1000);
                $i.datepicker('setDate', config.value);
            }
            // customize datepicker with locale
            if(config.locale) {
                $i.datepicker('option', $.datepicker.regional[config.locale]);
            }

            $i.on('focus', function() {
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
            });

            $i.on('blur', function() {
                $iw.removeClass('hlf-state--focus');
            });

            $h.on('click', function() {
                $iw.removeClass('hlf-state--error');
            });

        }

        function show(v) {
            isAutoShown = !!v;
            setTimeout(function(){ // jquery.ui.datepicker show cheat
                $i.datepicker('show');
            }, 16);
        }

        function hide() {
            $i.datepicker('hide');
        }

        function refresh() {
            var $widget = $i.datepicker('widget');
            if($widget.is(':visible') && $widget.attr('__cheat') == uid) {
                $i.datepicker('refresh');
            }
        }

        function dateModify (date, modify) {
            date.setDate(date.getDate() + modify);
            return date;
        }

        function getStamp () {
            var date = $i.datepicker('getDate');
            if(date) {
                return (new Date($i.datepicker('getDate'))).getTime();
            }
            return null;
        }

        function getDate () {
            var date = $i.datepicker('getDate');
            if(date) {
                return new Date(date);
            }
            return null;
        }

        function setDate (date, modify) {
            $i.datepicker('setDate', dateModify(date, modify));
            $iw.removeClass('hlf-state--error');
        }

        function getConfig() {
            return config;
        }

        function validate() {
            if(!config.required || $i.datepicker('option', 'disabled') || !!getParams()) {
                return true;
            }
            $iw.addClass('hlf-state--error');
            $h.html(config.hintEmpty);
            return false;
        }

        /**
         * Process each date average price & calculate day details
         * @param data
         * @param formatter function
         */
        function specify(data, formatter) { // todo strange logic
            if(!_.size(data))
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
                    if(percent > 60)
                        rate = 4;
                } else {
                    if (percent > 20)
                        rate = 1;
                    if(percent > 60)
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
                formatter: formatter || function(v) {return v}
            });
            return true;
        }

        function setDetails(d) {
            $iw.addClass('hlf-state--detailed');
            details = d;
        }

        function getDetails() {
            return _.clone(details, true);
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
            var month = (date.getMonth() + 1),
                day = date.getDate(),
                dateStr =
                    date.getFullYear() + '-' +
                        (month < 10 ? '0' + month : month) + '-' +
                        (day < 10 ? '0' + day : day),
                cfg = [true, '', ''];
            if(!_.isUndefined(details.dates) && details.dates[dateStr]) {
                cfg = [
                    true, // something :)
                    'ui-datepicker-dayType ui-datepicker-dayType--' + details.dates[dateStr].rate, // cell class
                    details.formatter(details.dates[dateStr].value)
                ];
            }
            return cfg;
        }

        return {
            disable: disable,
            enable: enable,
            draw: draw,
            refresh: refresh,
            show: show,
            hide: hide,
            getStamp: getStamp,
            getDate: getDate,
            setDate: setDate,
            getParams: getParams,
            getConfig: getConfig,
            setDetails: setDetails,
            getDetails: getDetails,
            resetDetails: resetDetails,
            specify: specify,
            validate: validate
        };

    };

    /**
     * Extension for jQuery.ui.datepicker
     */
    $(function () {
        $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
        $.datepicker._updateDatepicker = function (inst) {
            $.datepicker._updateDatepicker_original(inst);
            var afterShow = this._get(inst, 'afterShow');
            if (afterShow)
                afterShow.apply((inst.input ? inst.input[0] : null));
        }
    });

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
        monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin',
            'Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
        monthNamesShort: ['janvier','février','mars','avril','mai','juin',
            'juillet','août','septembre','octobre','novembre','décembre'],
        dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
        dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
        dayNamesMin: ['D','L','M','M','J','V','S'],
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
        monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
            'Jul','Ago','Sep','Oct','Nov','Dic'],
        dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
        dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
        dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
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
        monthNames: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
            'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
        monthNamesShort: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
            'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
        dayNames: ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'],
        dayNamesShort: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],
        dayNamesMin: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],
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
        monthNames: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
            'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
        monthNamesShort: ['Gen','Feb','Mar','Apr','Mag','Giu',
            'Lug','Ago','Set','Ott','Nov','Dic'],
        dayNames: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
        dayNamesShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
        dayNamesMin: ['Do','Lu','Ma','Me','Gi','Ve','Sa'],
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
        monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
            'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
        monthNamesShort: ['stycznia','lutego','marca','kwietnia','maja','czerwca',
            'lipca','sierpnia','września','października','listopada','grudnia'],
        dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
        dayNamesShort: ['Nie','Pn','Wt','Śr','Czw','Pt','So'],
        dayNamesMin: ['N','Pn','Wt','Śr','Cz','Pt','So'],
        weekHeader: 'Tydz',
        dateFormat: 'd M yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };

    $.datepicker.setDefaults($.datepicker.regional['en-US']);

})(jQuery, _, hlf);