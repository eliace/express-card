

var analysesClassification = new Dino.data.ArrayDataSource();


var intervalList = [
	{id: 1, name: 'ежедневно'}, 
	{id: 2, name: 'раз в 2 дня'},
	{id: 3, name: 'раз в 3 дня'},
	{id: 4, name: 'раз в 4 дня'},
	{id: 5, name: 'раз в 5 дней'},
	{id: 6, name: 'раз в 6 дней'},
	{id: 7, name: 'раз в неделю'}
];



Snippets.AnalysesTab = {
	dtype: 'dictionary-grid',
	
	width: 600,
	
//	data: DataSources.ExpressCardAnalyses,
	dataId: 'analyses',
	
	cls: 'dino-border-all',
	tag: 'analyses',
	
	components: {
		controls: {
			items: [{
				dtype: 'dropdown-button',
				tag: 'add-analysis',
				xicon: 'dino-icon-down',
				text: 'Назначить анализ',
				onSelect: function(e) {
					var val = e.target.data.val();
					var obj = {
						analysis_id: val.id,
						analysis_name: val.name,
						interval: 1,
						from_date: Dino.format_date(new Date())
					};
					DataSources.ExpressCardAnalyses.add(obj);
				},
				components: {
					dropdown: {
						data: analysesClassification,
						menuModel: {
							item: {
								'content!': {
									dtype: 'text',
									format: function(val) { return val.name ? val.name : 'другой'; }
								},
								components: {
									submenu: {
										dataId: 'analyses'
									}
								}
							}
						}
					}
				}
			}]
		},
		pager: {
			state: 'hidden'
		}
	},
	
	tableModel: {
		columns: [{
			header: 'Наименование',
			dataId: 'analysis_name',
			editable: false
		}, {
			header: 'Регулярность',
			width: 120,
			dataId: 'interval',
			format: function(val) { return Dino.find(intervalList, function(v) { return (v.id == val); }).name; },
			editor: {
        dtype: 'dropdown-editor',
				dropdownOnFocus: true,
        components: {
					input: {
						format: function(val) { return Dino.find(intervalList, function(v) { return (v.id == val); }).name; }
					},
          button: {
            cls: 'dino-icon-down',
						height: 10
          },
					dropdown: {
						data: intervalList,
						content: {
							defaultItem: {content: {format: '#{name}'}}
						}
					}
        },
				selectValue: function(w){ return w.data.get('id'); },
			}									
		}, {
			header: 'Начиная с',
			width: 120,
			dataId: 'from_date',
			editor: 'date-editor'
		}]
	}
};
