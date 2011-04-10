
var epressCard = new Dino.data.ObjectDataSource();

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


Dialogs.ExpressCardDialog = $.dino({
	dtype: 'dialog',
	title: 'Экспресс-карта',
	renderTo: 'body',
//	data: DataSources.Express,
	width: '95%',
	height: '90%',
	content: {
		dtype: 'box',
		layout: 'column-layout',
		components: {
			infoPanel: {
				dtype: 'box',
				cls: 'dino-border-all',
				height: 'auto',
				style: {'margin-right': 3},
				width: 300
			},
			tabPanel: {
				dtype: 'tab-panel',
				tabPosition: 'bottom',
			  defaults: {
			    page: {height: 'auto', cls: 'dino-border-all dino-border-no-bottom dino-panel'}
			  },				
				pages: [{
					tab: {text: 'Анализы'},
//					style: {'padding': 3},
					
					components: {
						controls: {
							dtype: 'control-box',
							defaultItem: {
								cls: 'plain'
							},
							items: [{
								dtype: 'dropdown-button',
//								cls: 'plain',
								icon: 'led-icon-add',
								xicon: 'dino-icon-down',
								text: 'Добавить',
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
										hideOn: 'outerClick',
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
							}, {
								dtype: 'text-button',
								text: 'Удалить',
								icon: 'led-icon-delete'
							}]
						},
						content: {
							dtype: 'grid',
							cls: 'dino-border-top',
							content: {
								height: 'auto'
							},
							data: DataSources.PatientAnalyses,
							tableModel: {
								cell: {
									extensions: [Dino.Editable],
									events: {
										'dblclick': function(e, w) {
											if(w.options.editable) w.startEdit();
										}
									}
								},
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
					
				}, {
					tab: {text: 'Назначения'}
				}]
			}
		}
	},
	buttons: ['save', 'cancel'],
	headerButtons: ['close'],
	onOpen: function() {
//		Remote.PatientAnalyses.load_all().to(DataSources.PatientAnalyses);
		
		Remote.Analyses.load('classification', {}, function(json){
			analysesClassification.set(json);
		});
		
	}	
});
