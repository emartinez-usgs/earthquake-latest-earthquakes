/* global chai, describe, it, sinon */
'use strict';


var Catalog = require('latesteqs/Catalog'),
    Collection = require('mvc/Collection'),
    ListView = require('list/ListView'),
    Model = require('mvc/Model');


var expect = chai.expect;


describe('list/ListView', function () {
  describe('constructor', function () {
    it('is defined', function () {
      expect(typeof ListView).to.equal('function');
    });

    it('can be instantiated', function () {
      expect(ListView).to.not.throw(Error);
    });

    it('can be destroyed', function () {
      var view;

      view = ListView();

      expect(view.destroy).to.not.throw(Error);
    });
  });

  describe('createCollectionItemContent', function () {
    it('tries to use the listFormat from the model', function () {
      var view;

      view = ListView();
      sinon.spy(view.model, 'get');

      view.createCollectionItemContent();
      expect(view.model.get.callCount).to.equal(1);

      view.model.get.restore();
      view.destroy();
    });

    it('delegates to the listFormat', function () {
      var feed,
          listFormat,
          view;

      view = ListView();
      listFormat = {
        format: {
          format: sinon.spy()
        }
      };
      feed = {
        'id': '7day_m25',
        'name' : '7 Days, Magnitude 2.5+ Worldwide',
        'url' : '/earthquakes/feed/v1.0/summary/2.5_week.geojson',
        'autoUpdate': 60 * 1000
      };

      view.model.set({
        'feed': feed,
        'listFormat': listFormat
      });
      view.createCollectionItemContent();

      expect(listFormat.format.format.callCount).to.equal(1);

      view.destroy();
    });
  });

  describe('renderFooter', function () {
    it('creates footer markup as expected', function () {
      var view;

      view = ListView();
      view.renderFooter();

      expect(view.footer.innerHTML).to.not.equal('');
      expect(view.footer.querySelectorAll('li').length).to.equal(3);

      view.destroy();
    });
  });

  describe('renderHeader', function () {
    it('creates header markup as expected', function () {
      var collection,
          view;

      collection = Collection();
      collection.metadata = {
        count: 245,
        generated: 1460497846000
      };

      view = ListView({
        collection: collection,
        model: Model({
          feed: {
            'id': '7day_m25',
            'name' : '7 Days, Magnitude 2.5+ Worldwide',
            'url' : '/earthquakes/feed/v1.0/summary/2.5_week.geojson',
            'autoUpdate': 60 * 1000
          }
        })
      });

      view.renderHeader();

      expect(view.header.querySelector('.header-title').innerHTML)
          .to.equal('7 Days, Magnitude 2.5+ Worldwide');
      expect(view.header.querySelector('.header-count').innerHTML)
          .to.equal('245 earthquakes.');
      expect(view.header.querySelector('.header-update-time').innerHTML)
          .to.equal('Updated: 2016-04-12 21:50:46 (UTC)');


      view.destroy();
      collection.destroy();
    });
  });

  describe('formatCountInfo', function () {
    var view;

    view = ListView();

    it('shows X of Y earthquakes if restrict is true', function () {
      expect(view.formatCountInfo(9, 3, true)).to.equal('3 of 9 earthquakes in map area.');
    });

    it('shows Y earthquakes if restrict is False', function () {
      expect(view.formatCountInfo(9, 3, false)).to.equal('9 earthquakes.');
    });

    view.destroy();
  });

  describe('filterEvents', function () {
    var data,
        model,
        view;

    model = Model({
      'mapposition': [
        [10, -130], // southwest
        [30, -110] // northeast
      ],
      'viewModes': [{'id': 'list'}]
    });

    view = ListView({
      model: model
    });

    data = [
      {

        geometry: {
          coordinates: [
            -120, 20, 0
          ]
        }
      },
      {
        geometry: {
          coordinates: [
            -155, 65, 0
          ]
        }
      }
    ];

    it('does NOT filter events when the map is disabled', function () {
      expect(view.filterEvents(data).length).to.equal(2);
    });

    it('filters events when a map is enabled', function () {
      model.set({
        'viewModes': [{'id': 'map'}]
      });
      expect(view.filterEvents(data).length).to.equal(1);
    });
  });

  describe('onRestrictListToMapChange', function () {
    var spy,
        view;

    view = ListView();
    spy = sinon.spy(view, 'onRestrictListToMapChange');
    view.model.set({
      'restrictListToMap': []
    });

    it('is triggered by a setting change', function () {
      expect(spy.callCount).to.equal(1);
    });

    spy.restore();
    view.destroy();
  });

  describe('getDataToRender', function () {
    it('gets the filtered data from the collection to render', function () {
      var collection,
          data,
          view;

      collection = Collection([
        {'id': 'item-1', 'value': 'value-1'},
        {'id': 'item-2', 'value': 'value-2'},
        {'id': 'item-3', 'value': 'value-3'}
      ]);

      view = ListView({collection: collection});
      sinon.stub(view, 'filterEvents', function () {
        return 'filterEvents';
      });

      view.filterEnabled = false;
      data = view.getDataToRender();
      expect(data.length).to.equal(collection.data().length);

      view.filterEnabled = true;
      data = view.getDataToRender();
      expect(data).to.equal('filterEvents');

      view.destroy();
    });
  });

});
