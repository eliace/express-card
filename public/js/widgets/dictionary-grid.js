


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
				onEdit: function(e){
					var grid = this.getParent(Dino.widgets.Grid);
					grid.editBuffer.upd(this.getRow().data.get());
					
					if(e.reason == 'enterKey') {
						var nextCell = this.getRow().getColumn(this.index+1);
						if(nextCell && nextCell.options.editable) nextCell.startEdit();
					}
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
						
						var grid = this.parent.parent;
						
//						grid.events.fire('on'+this.tag);
						
						if(this.tag == 'Add') {
							var obj = grid.options.objectFactory();
							
							grid.data.add(obj);
							grid.editBuffer.add(obj);							
						}
						else if(this.tag == 'Delete') {
		          grid.selection.each(function(item){
		            var val = item.data.val();
		            grid.editBuffer.del(val);
		            item.data.del();
		          });
							grid.selection.clear();							
						}
						
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
