;(function ($, _, hlf) {
    'use strict';

    hlf.ac = function (config) {

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
            name: 'destination', // getParams() param name in case
                                 // you select nothing in autocomplete
            text: '', // default input value
            type: '', // default type
            id: 0, // default id
            limit: 5,
            locale: 'en-US',
            autoFocus: false, // auto focus if field is empty
            hint: 'panic!', // this control always required, its hint text
            onSelect: function() {},
            onSelectShowCalendar: null,
            onReset: function() {},
            avgPricesUrl: 'http://search.hotellook.com/ajax/location-avg-prices.json?locationId={id}',
            avgPricesCalendars: [], // names if controls
            avgPricesFormatter: function(v) {
                return '' + Math.round(v);
            },
            samplesText: 'For example: {list}',
            samplesList: [], // [{id: 15542, type: 'location', text: 'Paris, France', sample: 'Paris'}]
            tplInput: _.template('<div class="hlf-input hlf-input--ac" hlf-role="input-wrap"><input type="text" placeholder="<%= placeholder %>" value="<%= text %>" hlf-role="input" /><div class="loader" hlf-role="loader"></div><div class="hint" hlf-role="hint"><%= hint %></div></div>'),
            tplSamples: _.template('<div class="hlf-input--ac-samples" hlf-role="samples"><%= samplesText %></div>'),
            tplSamplesLink: _.template('<a href="#" hlf-role="samples-link" data-type="<%= type %>" data-id="<%= id %>" data-text="<%= text %>"><%= sample %></a>')
        });

        function avgPricesRequest (id) {
            if(config.avgPricesCalendars.length) {
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
            $iw.addClass('hlf-state--loading');
            $.ajax({
                dataType: 'jsonp',
                type: 'get',
                url: config.url,
                data: {
                    lang: config.locale,
                    limit: config.limit,
                    term: request.term
                },
                jsonpCallback: 'hlf_ac_callback',
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
                    $iw.removeClass('hlf-state--loading');
                },
                error: function() {
                    $iw.removeClass('hlf-state--loading');
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
            $iw.removeClass('hlf-state--error');
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

            if(config.id) {
                avgPricesRequest(config.id);
            }

            controls = c || {};
            $c = hlf.getEl($f, 'ac', name);
            $c.html(config.tplInput(config));
            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');
            $l = hlf.getEl($c, 'loader');

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
                $iw.removeClass('hlf-state--error');
            });

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

            if(config.autoFocus && !config.text.length) {
                $i.focus();
            }

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
                $sc = hlf.getEl($c, 'samples');
                $sl = hlf.getEl($sc, 'samples-link');

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
            $iw.addClass('hlf-state--error');
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
    function hlf_ac_callback() {}

    /**
     * Extension for jQuery.ui.autocomplete
     */
    $.widget('custom.reachAutocomplete', $.ui.autocomplete, {
        _create: function() {
            this._super();
            this.widget().menu('option', 'items', '> :not(.ui-autocomplete-category)');
        },
        _renderMenu: function( ul, items ) {
            ul.addClass('hlf-ac');
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

})(jQuery, _, hlf);