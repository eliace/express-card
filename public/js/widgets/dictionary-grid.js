


Dino.declare('Medic.widgets.DictionaryGrid', 'Dino.widgets.Grid', {
	
	defaultOptions: {
		cls: 'dino-border-all',
		content: {
			height: 'auto'
		},
		components: {
			controls: {
				weight: 1,
				dtype: 'control-box',
      	cls: 'dino-border-bottom',
				defaultItem: {
					dtype: 'text-button',
					cls: 'plain'
				},
				items: [{
					text: 'Добавить',
					icon: 'led-icon-add'
				}, {
					text: 'Удалить',
					icon: 'led-icon-delete'
				}, {
					text: 'Обновить',
					icon: 'led-icon-refresh'
				}]
			},					
			pager: {
				dtype: 'pager',
      	cls: 'dino-border-top'
			}					
		}				
	}
	
}, 'dictionary-grid');
