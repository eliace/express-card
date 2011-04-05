


Dino.declare('Medic.widgets.DictionaryGrid', 'Dino.widgets.Grid', {
	
	defaultOptions: {
		cls: 'dino-border-all',
		content: {
			height: 'auto'
		},
		tableModel: {
			cell: {
				extensions: [Dino.Editable],
				events: {
					'dblclick': function(e, w) {
						if(w.options.editable) w.startEdit();
					}
				}
			}
		},
		components: {
			controls: {
				weight: 1,
				dtype: 'control-box',
      	cls: 'dino-border-bottom',
				defaultItem: {
					dtype: 'text-button',
					cls: 'plain',
					onAction: function() {
						this.parent.parent.events.fire('on'+this.tag);
					}
				},
				items: [{
					text: 'Добавить',
					icon: 'led-icon-add',
					tag: 'Add'
				}, {
					text: 'Удалить',
					icon: 'led-icon-delete',
					tag: 'Delete'
				}, {
					text: 'Обновить',
					icon: 'led-icon-refresh',
					tag: 'Refresh'
				}]
			},					
			pager: {
				dtype: 'pager',
      	cls: 'dino-border-top'
			}					
		}				
	},
	
	$init: function() {
		Medic.widgets.DictionaryGrid.superclass.$init.apply(this, arguments);
		
		this.editBuffer = new Dino.utils.UpdateBuffer();
	}
	
}, 'dictionary-grid');
