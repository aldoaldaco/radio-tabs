{
  const KEYS = {
    SPACE: 32,
    ENTER: 13
  };

  /**
   * @summary displays a list of tabs from its `options` property.
   * @customElement
   * @polymer
   * @extends {Polymer.Element}
   */
  class RadioTabs extends Polymer.Element {
    static get is() {
      return 'radio-tabs';
    }

    static get properties() {
      return {
        /**
         * List of options.
         * Can be an array of Strings used as labels for each tab or Objects with a "label" key and and optional "icon" key to display
         * an icon to the left of the text.
         * @type {Array}
         */
        options: {
          type: Array,
          observer: '_optionsChanged',
          value: function() {
            return [];
          }
        },

        /**
         * Size for the icons.
         */
        iconSize: {
          type: Number,
          value: 24
        },

        /**
         * Index of the selected option.
         */
        selected: {
          type: Number,
          value: 0,
          notify: true
        },

        _uniqueID: {
          type: Number,
          value: function() {
            return new Date().valueOf();
          }
        },
        _hasLabels: {
          type: Boolean,
          computed: '_computeHasLabels(options)'
        },
        /**
         * Set to true to fire `tab-mouseevent` event when a tab receives mouseenter / mouseleave.
         */
        notifyMouseEvents: {
          type: Boolean,
          value: false
        }
      };
    }

    static get observers() {
      return [ '_selectedChanged(selected, options)' ];
    }

    _optionsChanged(newValue, previousValue) {
      if (previousValue && previousValue.length !== newValue.length) {
        this._updateTabStylesAfterResettingSelected();
      } else {
        this._setTabStyles();
      }
    }

    // Prevents changing the width and the position of the indicator at the same time.
    _updateTabStylesAfterResettingSelected() {
      this.classList.add('indicator-hidden');
      this._resetSelected().then(() => {
        this._setTabStyles();
        this.classList.remove('indicator-hidden');
      });
    }

    _resetSelected() {
      return new Promise(resolve => {
        const selectedDoesNotExist = this.options.indexOf(this.options[this.selected]) === -1;
        const timeout = selectedDoesNotExist ? 200 : 0;
        if (selectedDoesNotExist) {
          this.selected = 0;
        }
        setTimeout(resolve, timeout);
      });
    }

    _setTabStyles() {
      this.updateStyles({
        '--radio-tabs-item-width': 100 / this.options.length + '%'
      });
      /**
       * Fired after updating the tab styles.
       * @event cells-radio-tabs-styles-updated
       * @param {Object} detail.itemWidth width applied to each tab
       */
      this.dispatchEvent(new CustomEvent('cells-radio-tabs-styles-updated', {
        bubbles: true,
        composed: true,
        detail: {
          itemWidth: 100 / this.options.length + '%'
        }
      }));
    }

    /**
     * Selects the item on click event and on keydown only if the key pressed is space or enter.
     * Prevents selecting an item while navigating through tabs using the tab key.
     */
    _setSelected(e) {
      const keyShouldActiveTab = [KEYS.SPACE, KEYS.ENTER].indexOf(e.keyCode) !== -1;
      if (e.type !== 'keydown' || keyShouldActiveTab) {
        this.selected = e.model.index;
      }
    }

    _computeChecked(selected, index) {
      return Number(selected) === index;
    }

    _selectedChanged(selected, options) {
      const selectedItemExists = options.indexOf(options[selected]) !== -1;
      if (selectedItemExists) {
        this.$.indicator.style.transform = `translateX(calc(100% * ${ selected }))`;
      }
    }

    _computeHasLabels(options) {
      return options.some(option => option.label);
    }

    _onMouseEvent(e) {
      /**
       * Fired on tab mouseenter / mouseleave
       * @event tab-mouseevent
       * @param {Number} 'index' Index of the event.target tab
       * @param {String} 'type' Event type (mouseenter | mouseleave)
       */
      if (this.notifyMouseEvents) {
        this.dispatchEvent(new CustomEvent('tab-mouseevent', {
          bubbles: false,
          composed: true,
          detail: {
            index: e.model.index,
            type: e.type
          }
        }));
      }
    }
  }

  window.customElements.define(RadioTabs.is, RadioTabs);
}

