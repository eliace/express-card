


Dino.declare('Medic.widgets.MainMenu', 'Dino.containers.Box', {
	
	defaultOptions: {
		cls: 'main-menu',
		defaultItem: {
			dtype: 'text',
			cls: 'main-menu-item dino-corner-all',
			events: {
				'click': function(e, w) {
					
					if(!w.options.dropdownModel.items) return;
					
					var dd = $.dino(Dino.merge({
						onShow: function() {
							w.states.set('active');
						},
						onHide: function(){
							w.states.clear('active');
						}
					}, w.options.dropdownModel));
					
					dd.menuItem = w;
					
					var offset = w.el.offset();
					
					dd.show(offset.left, offset.top + w.el.outerHeight());
				}
			},
			dropdownModel: {
				dtype: 'dropdown-box',
				renderTo: 'body',
//				hideOn: 'hoverOut',
				cls: 'menu-dropdown dino-dropdown-shadow',
				offset: [0, 1],
				defaultItem: {
					dtype: 'text-item',
					cls: 'menu-dropdown-item',
					onAction: function() {
						this.parent.hide();
						this.parent.menuItem.parent.events.fire('onAction', {'target': this});
					}
				}
			}
		}
	}
	
	
}, 'main-menu');
