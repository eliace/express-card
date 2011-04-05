


Dino.declare('Medic.widgets.DictionaryGrid', 'Dino.widgets.Grid', {
	
	defaultOptions: {
		cls: 'dino-border-all',
		content: {
			height: 'auto'
		},
    extensions: [Dino.Selectable],
		tableModel: {
      row: {
        events: {
          'click': function(e, w) {
            w.getParent(Dino.widgets.Grid).selection.add(w, e.ctrlKey, e.shiftKey);
          },
          'mousedown': function(e) {
            if(e.shiftKey || e.ctrlKey) return false;
          }
        }
      },
			cell: {
				extensions: [Dino.Editable],
				events: {
					'mousedown': function(e) {
						return false;
					},
					'dblclick': function(e, w) {
						if(w.options.editable) w.startEdit();
					}
				},
				onEdit: function(){
					this.getParent(Dino.widgets.Grid).events.fire('onUpdate', {row: this.getRow()});
				}
			}
		},
		components: {
			header: { weight: 5 },
			content: { weight: 6 },
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
				weight: 10,
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
