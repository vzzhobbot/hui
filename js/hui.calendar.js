;(function ($, _, hui) {
    'use strict';

    hui.calendar = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint
            controls = {},
            uid = _.uniqueId('hui.calendar'); /* Unique id for "refresh" cheating.
                                               * $i.datepicker('widget') returns any opened datepicker,
                                               * that means we need to mark this calendar with uid
                                               * to check uid in refresh function */
        var details = {};

        config = _.defaults(config || {}, {
            required: false, // todo
            placeholder: 'Choose date...',
            name: 'date',
            value: null, // Date()
            format: 'yy-mm-dd',
            min: 0, //
            months: 2,
            hintText: 'panica!',
            onSelect: function() {}
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
            $h.hide();
        }

        function enable() {
            $i.datepicker('option', 'disabled', false);
        }

        function draw(name, $f, c) {
            controls = c || {};
            $c = hui.getEl($f, 'calendar', name);
            $c.html(hui.getTpl('hui-input--calendar')(config));
            $iw = hui.getEl($c, 'input-wrap');
            $i = hui.getEl($c, 'input');
            $h = hui.getEl($c, 'hint');

            $i.datepicker({
                minDate: config.min,
                numberOfMonths: config.months,
                //showOn: 'both',
                //buttonText: '',
                onSelect: function(date, e) {
                    config.onSelect(date, $.datepicker.formatDate(config.format, getDate()), e);
                    $h.hide();
                },
                beforeShowDay: function(date) {
                    return getDayCfg(date);
                },
                beforeShow: function(e, i) {
                    i.dpDiv.attr('__cheat', uid);
                },
                afterShow: function() {
                    if(_.isArray(details.points) && details.points.length) {
                        $('.ui-datepicker-row-break').html(
                            hui.getTpl('hui-input--calendar-legend')({
                                'points': _.map(details.points, details.formatter)
                            })
                        );
                    }
                }
            });
            // maybe set a date?
            if(_.isDate(config.value)) {
                // correct date by timezone offset
                config.value.setTime(config.value.getTime() + config.value.getTimezoneOffset() * 60 * 1000);
                $i.datepicker('setDate', config.value);
            }

            $i.on('focus', function() {
                $h.hide();
            });

            // todo doesnt work, fix it
            $i.on('change', function() {
                $h.hide();
            });

        }

        function show() {
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
        }

        function getConfig() {
            return config;
        }

        function validate() {
            if(!config.required || $i.datepicker('option', 'disabled') || !!getParams()) {
                return true;
            }
            $h.show();
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
            $iw.addClass('hui-state--detailed');
            details = d;
        }

        function getDetails() {
            return _.clone(details, true);
        }

        function resetDetails() {
            $iw.removeClass('hui-state--detailed');
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

})(jQuery, _, hui);