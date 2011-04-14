



Dino.declare('Dino.widgets.DropdownGridColumn', 'Dino.widgets.TableCell', {
	
	defaultOptions: {
		dropdownData: [],
		format: function(val) {
			if(val === '' || val === null || val === undefined) return '';
			return this.options.dropdownData.get_by_id(val)['name'];
		},
		editor: {
			dtype: 'dropdown-editor',
			components: {
				input: {
					format: function(val) {
						if(val === '' || val === null || val === undefined) return '';
						return this.parent.dropdown.data.get_by_id(val)['name'];
					}					
				},
				button: {
					cls: 'dino-icon-spinner-down',
					height: 10
				},
				dropdown: {
					content: {
						defaultItem: {
							dataId: 'name'
						}
					}
				}
			},
			selectValue: function(w) { return w.data.source.get('id'); }
		}
	},
	
	
	
	$init: function(o) {
		Dino.widgets.DropdownGridColumn.superclass.$init.apply(this, arguments);
		
		o.editor.components.dropdown.data = o.dropdownData;
	}
	
	
	
}, 'dropdown-grid-column');
