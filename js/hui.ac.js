;(function ($, _, hui) {
    'use strict';

    hui.ac = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint
            $l = null, // loader
            $sc = null, // samples container
            $sl = null, // samples links
            controls = {};

        config = _.defaults(config || {}, {
            url: 'http://yasen.hotellook.com/autocomplete',
            name: 'destination',
            text: '', // default input value
            type: '', // default type
            id: 0, // default id
            limit: 5,
            locale: 'en-US',
            hint: 'panic!',
            agvPricesUrl: null,
            onSelect: function() {},
            onSelectShowCalendar: null,
            onReset: function() {},
            avgPricesUrl: null,
            avgPricesCalendars: [],
            avgPricesFormatter: function(v) {
                return '' + Math.round(v);
            },
            samplesText: 'For example: {list}',
            samplesList: [],
            tplInput: hui.getTpl('hui-input--ac'),
            tplSamples: hui.getTpl('hui-input--ac-samples'),
            tplSamplesLink: hui.getTpl('hui-input--ac-samples-link')
        });

        function avgPricesRequest (id) {
            if(config.avgPricesUrl) {
                $.ajax({
                    dataType: 'json',
                    type: 'get',
                    url: config.avgPricesUrl.replace('{id}', id),
                    success: avgPricesRequestSuccess
                });
            }
        }

        function avgPricesRequestSuccess(data) {
            if(_.size(data)) {
                var first = null;
                _.each(config.avgPricesCalendars, function(name) {
                    if(!first) {
                        controls[name].specify(data, config.avgPricesFormatter);
                        controls[name].refresh();
                        first = controls[name];
                    } else {
                        controls[name].setDetails(first.getDetails());
                        controls[name].refresh();
                    }
                });
            }
        }

        /**
         * Get params string
         * @returns {string | null}
         */
        function getParams() {
            if(!!config.id && config.type) {
                return config.type + 'Id=' + config.id;
            }
            if(config.text) {
                return config.name + '=' + config.text;
            }
            return null;
        }

        function source(request, response) {
            $iw.addClass('hui-state--loading');
            $.ajax({
                dataType: 'jsonp',
                type: 'get',
                url: config.url,
                data: {
                    lang: config.locale,
                    limit: config.limit,
                    term: request.term
                },
                jsonpCallback: 'hui_ac_callback',
                success: function(data) {
                    var cities = _.map(data.cities, function(item) {
                        return {
                            id: item.id,
                            category: 'Locations',
                            type: 'location',
                            value: item.fullname,
                            text: item.city,
                            clar: (item.state ? item.state + ', ' : '') + item.country,
                            comment: item.hotelsCount + ' hotels'
                        }
                    });
                    var hotels = _.map(data.hotels, function(item) {
                        return {
                            id: item.id,
                            category: 'Hotels',
                            type: 'hotel',
                            value: item.name + ', ' + item.city + ', ' + item.country,
                            text: item.name,
                            clar: item.city + ', ' + item.country
                        }
                    });
                    response(_.union(cities, hotels));
                    $iw.removeClass('hui-state--loading');
                },
                error: function() {
                    $iw.removeClass('hui-state--loading');
                }
            });
        }

        function onReset() {
            if(config.avgPricesUrl) {
                _.each(config.avgPricesCalendars, function(name) {
                    controls[name].resetDetails();
                });
            }
            config.onReset();
        }

        function select(type, id, text) {
            $iw.removeClass('hui-state--error');
            config.type = type;
            config.id = id;
            if(text) {
                $i.val(text);
            }
            avgPricesRequest(id);
            config.onSelect(type, id);
            if(config.onSelectShowCalendar) {
                if(!controls[config.onSelectShowCalendar].getStamp()) {
                    controls[config.onSelectShowCalendar].show();
                }
            }
        }

        function draw(name, $f, c) {
            controls = c || {};
            $c = hui.getEl($f, 'ac', name);
            $c.html(config.tplInput(config));
            $iw = hui.getEl($c, 'input-wrap');
            $i = hui.getEl($c, 'input');
            $h = hui.getEl($c, 'hint');
            $l = hui.getEl($c, 'loader');

            if(config.id) {
                avgPricesRequest(config.id);
            }

            $i.reachAutocomplete({
                source: source,
                select: function(ev, data) {
                    select(data.item.type, data.item.id);
                },
                minLength: 3
            });

            $i.on('keyup', function() {
                config.text = $i.val();
            });

            $i.on('keydown', function(e) {
                // ignore enter & tab key
                if(e.keyCode !== 13 && e.keyCode !== 9) {
                    config.type = '';
                    config.id = 0;
                    onReset();
                }
                $iw.removeClass('hui-state--error');
            });

            $i.on('focus', function() {
                $iw.addClass('hui-state--focus');
                $iw.removeClass('hui-state--error');
            });

            $i.on('blur', function() {
                $iw.removeClass('hui-state--focus');
            });

            $h.on('click', function() {
                $iw.removeClass('hui-state--error');
            });

            if(config.samplesList.length) {

                var links = _.map(config.samplesList, function(i) {
                    return config.tplSamplesLink(i);
                });
                var samples = config.tplSamples(
                    _.defaults({
                        samplesText: config.samplesText.replace('{list}', links.join(', '))
                    }, config)
                );
                $c.append(samples);
                $sc = hui.getEl($c, 'samples');
                $sl = hui.getEl($sc, 'samples-link');

                $sl.on('click', function() {
                    var $this = $(this);
                    select($this.data('type'), $this.data('id'), $this.data('text'));
                    return false;
                });

            }

        }

        function getConfig() {
            return config;
        }

        function validate() {
            if(getParams()) {
                return true;
            }
            $i.focus();
            $iw.addClass('hui-state--error');
            return false;
        }

        return {
            draw: draw,
            select: select,
            getParams: getParams,
            getConfig: getConfig,
            validate: validate
        };

    };

    // jsonp callback cheat
    function hui_ac_callback() {}

    /**
     * Extension for jQuery.ui.autocomplete
     */
    $.widget('custom.reachAutocomplete', $.ui.autocomplete, {
        _create: function() {
            this._super();
            this.widget().menu('option', 'items', '> :not(.ui-autocomplete-category)');
        },
        _renderMenu: function( ul, items ) {
            ul.addClass('hl-ui-autocomplete');
            var that = this,
                currentCategory = "";
            $.each( items, function( index, item ) {
                var li;
                if ( item.category != currentCategory ) {
                    ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                    currentCategory = item.category;
                }
                li = that._renderItemData( ul, item );
                if ( item.category ) {
                    li.attr( "aria-label", item.category + " : " + item.label );
                }
            });
        },
        _renderItem: function (ul, item) {
            var label = '<span class="ui-menu-item-text">' + item.text + '</span>';
            if (item.clar)
                label += '<span class="ui-menu-item-clar">, ' + item.clar + '</span>';
            if (item.comment)
                label += '<span class="ui-menu-item-comment">' + item.comment + '</span>';
            return $("<li>")
                .append($("<a>").html(label))
                .appendTo(ul);
        }
    });

})(jQuery, _, hui);