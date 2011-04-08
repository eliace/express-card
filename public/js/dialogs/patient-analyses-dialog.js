
var analysesClassification = new Dino.data.ArrayDataSource();

var intervalList = [{id: 1, name: 'ежедневно'}, {id: 2, name: 'раз в 2 дня'}];

Dialogs.PatientAnalysesDialog = $.dino({
	dtype: 'dialog',
	title: 'Анализы',
	content: {
		dtype: 'box',
		width: 800,
		components: {
			controls: {
				dtype: 'control-box',
				items: [{
					dtype: 'dropdown-button',
					cls: 'plain',
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
						DataSources.PatientAnalyses.add(obj);
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
											dataId: 'analyses',
											binding: function(val) {
												if(val && val.length > 0) this.parent.states.set('submenu');
											}
										}
									}
								}
							}
						}
					}
				}]
			},
			content: {
				dtype: 'grid',
				cls: 'dino-border-all',
				content: {
					height: 500					
				},
				data: DataSources.PatientAnalyses,
				tableModel: {
					columns: [{
						header: 'Наименование',
						dataId: 'analysis_name'
					}, {
						header: 'Регулярность',
						width: 120,
						dataId: 'interval',
						format: function(val) { return Dino.find(intervalList, function(v) { return (v.id == val); }).name; }
					}, {
						header: 'Начиная с',
						width: 120,
						dataId: 'from_date'
					}/*, {
						width: 30,
						content: {
							dtype: 'action-icon',
							cls: 'led-icon-delete dino-clickable',
							style: {'margin': '0 auto'}
						}
					}*/]
				} 
			}
		}
	},
	headerButtons: ['close'],
	buttons: ['save', 'cancel'],
	onOpen: function() {
//		Remote.PatientAnalyses.load_all().to(DataSources.PatientAnalyses);
		
		Remote.Analyses.load('classification', {}, function(json){
			analysesClassification.set(json);
		});
		
	}
});

