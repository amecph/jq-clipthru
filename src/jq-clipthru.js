// Generated by CoffeeScript 1.3.3
(function() {

  (function($) {
    return $.widget("salsita.clipthru", {
      options: {
        method: ['clip', 'clip-path'],
        dataAttribute: 'jq-clipthru',
        simpleMode: false,
        collisionTarget: null,
        cloneOnCollision: false,
        keepClonesInHTML: false,
        blockSource: null,
        angularScope: null,
        angularCompile: null,
        updateOnScroll: true,
        updateOnResize: true,
        updateOnZoom: true,
        updateOnCSSTransitionEnd: false,
        autoUpdate: false,
        autoUpdateInterval: 100,
        debug: false
      },
      _create: function() {
        this.overlayOffset = null;
        if (this.options.collisionTarget) {
          this.collisionTarget = this.element.find(this.options.collisionTarget).get(0);
        } else {
          this.collisionTarget = this.element;
        }
        this.collisionTargetOffset = null;
        this.allBlocks = null;
        this.allClones = null;
        this.collidingBlocks = [];
        this._getAllBlocks();
        if (this.allBlocks.length > 0) {
          this.collisionTarget.addClass("" + this.options.dataAttribute + "-origin");
          this._addIdToBlocks();
          this._createOverlayClones();
          this._attachListeners();
          this.refresh();
          clearInterval(this.autoUpdateTimer != null);
          if (this.options.autoUpdate) {
            return this.autoUpdateTimer = setInterval((function() {
              return this.refresh();
            }), this.options.autoUpdateInterval);
          }
        }
      },
      _getAllBlocks: function() {
        var block, _i, _len, _ref, _results;
        if (this.options.blockSource) {
          _ref = this.options.blockSource;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            block = _ref[_i];
            if (this.allBlocks) {
              _results.push(this.allBlocks = this.allBlocks.add($(block)));
            } else {
              _results.push(this.allBlocks = $(block));
            }
          }
          return _results;
        } else {
          return this.allBlocks = $("[data-" + this.options.dataAttribute + "]");
        }
      },
      _getOverlayOffset: function() {
        this.overlayOffset = this.element.get(0).getBoundingClientRect();
        return this.collisionTargetOffset = this.collisionTarget.get(0).getBoundingClientRect();
      },
      _addIdToBlocks: function() {
        var i, _self;
        i = 0;
        _self = this;
        return this.allBlocks.each(function() {
          $(this).data("" + _self.options.dataAttribute + "-id", i);
          return i++;
        });
      },
      _createOverlayClones: function() {
        var _self;
        _self = this;
        this.allBlocks.each(function() {
          var clone;
          clone = _self.element.clone();
          clone.addClass("" + _self.options.dataAttribute + "-clone");
          clone.addClass($(this).data(_self.options.dataAttribute));
          clone.data("" + _self.options.dataAttribute + "-id", $(this).data("" + _self.options.dataAttribute + "-id"));
          if (_self.allClones) {
            return _self.allClones = _self.allClones.add(clone);
          } else {
            return _self.allClones = clone;
          }
        });
        if (this.options.keepClonesInHTML) {
          this.allClones.insertAfter(this.element);
          if (this.options.angularScope) {
            return this.options.angularCompile(this.allClones)(this.options.angularScope);
          }
        }
      },
      _updateOverlayClones: function() {
        var _self;
        _self = this;
        this.allClones.each(function() {
          var id;
          id = $(this).data("" + _self.options.dataAttribute + "-id");
          if (_self.collidingBlocks.hasOwnProperty(id)) {
            if (_self.options.keepClonesInHTML) {
              $(this).css({
                display: _self.element.css('display')
              });
            } else {
              if (!document.body.contains(this)) {
                $(this).insertAfter(_self.element);
                if (_self.options.angularScope) {
                  _self.options.angularCompile($(this).contents())(_self.options.angularScope);
                }
              }
            }
            _self._clipOverlayClone(this, _self._getCollisionArea(_self.collidingBlocks[id]));
            if (_self.options.simpleMode === 'vertical') {
              return _self._clipOverlayOriginal(_self._getRelativeCollision(_self.collidingBlocks[id]));
            }
          } else {
            if (_self.options.keepClonesInHTML) {
              return $(this).css({
                display: 'none'
              });
            } else {
              return $(this).detach();
            }
          }
        });
        if (this.collidingBlocks.length === 0) {
          return this.element.css({
            'clip': 'rect(auto auto auto auto)'
          });
        }
      },
      _getCollisionArea: function(blockOffset) {
        var clipOffset;
        clipOffset = [];
        clipOffset.push(this.overlayOffset.height - (this.overlayOffset.bottom - blockOffset.top));
        clipOffset.push(blockOffset.right - this.overlayOffset.left);
        clipOffset.push(blockOffset.bottom - this.overlayOffset.top);
        clipOffset.push(this.overlayOffset.width - (this.overlayOffset.right - blockOffset.left));
        return clipOffset;
      },
      _getRelativeCollision: function(blockOffset) {
        var clipOffset;
        clipOffset = [];
        if (this.collisionTargetOffset.top <= blockOffset.top) {
          clipOffset.push(0);
          clipOffset.push(blockOffset.top - this.overlayOffset.top);
        } else if (this.collisionTargetOffset.bottom >= blockOffset.bottom) {
          clipOffset.push(this.overlayOffset.height - (this.overlayOffset.bottom - blockOffset.bottom));
          clipOffset.push(this.overlayOffset.bottom);
        } else {
          clipOffset = [0, 0];
        }
        return clipOffset;
      },
      _getCollidingBlocks: function() {
        var _self;
        _self = this;
        this.collidingBlocks = [];
        return this.allBlocks.each(function() {
          var blockOffset;
          blockOffset = this.getBoundingClientRect();
          if ((blockOffset.bottom >= _self.collisionTargetOffset.top) && (blockOffset.top <= _self.collisionTargetOffset.bottom) && (blockOffset.left <= _self.collisionTargetOffset.right) && (blockOffset.right >= _self.collisionTargetOffset.left)) {
            return _self.collidingBlocks[$(this).data("" + _self.options.dataAttribute + "-id")] = blockOffset;
          }
        });
      },
      _clipOverlayClone: function(clone, offset) {
        if (this.options.simpleMode === 'vertical') {
          return $(clone).css({
            'clip': "rect(" + offset[0] + "px auto " + offset[2] + "px auto)"
          });
        } else {
          return $(clone).css({
            'clip': "rect(" + offset[0] + "px " + offset[1] + "px " + offset[2] + "px " + offset[3] + "px)"
          });
        }
      },
      _clipOverlayOriginal: function(offset) {
        return this.element.css({
          'clip': "rect(" + offset[0] + "px auto " + offset[1] + "px auto)"
        });
      },
      _attachListeners: function() {
        var _self;
        _self = this;
        $(window).on("" + (this.options.updateOnResize ? 'resize' : void 0) + " " + (this.options.updateOnScroll ? 'scroll' : void 0), function() {
          return _self.refresh();
        });
        if (this.options.updateOnCSSTransitionEnd) {
          return this.element._on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(event) {
            if (event.originalEvent.propertyName === _self.options.updateOnCSSTransitionEnd) {
              return _self.refresh();
            }
          });
        }
      },
      refresh: function() {
        this._getOverlayOffset();
        this._getCollidingBlocks();
        return this._updateOverlayClones();
      },
      destroy: function() {
        return console.log("destroy method called");
      }
    });
  })(jQuery);

}).call(this);
