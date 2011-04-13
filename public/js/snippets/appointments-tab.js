
var drugsClassification = new Dino.data.ArrayDataSource();





function calc_appointment_dose(row) {
	
	// пересчитываем дозировку
	var ec = row.data.source.source.get();
	var val = row.data.get();
	
	var n = 0;
	var total = 0;
	var single = parseFloat(val.single_dose);
	Dino.each(val.dose, function(dose, i){ 
		if (dose === '') {
			total += single;
			n++;
		}
		else if (dose) total += dose;
	});

	row.data.set('weight_dose', total/ec.calc_weight);
	
	row.getColumn(2).states.toggle('disabled', (total > 0 && n == 0));
	
	row.$dataChanged();
	
}		






Snippets.AppointmentsTab = {
	dtype: 'box',
	layout: 'column-layout',
	width: 1000,
	tag: 'appointments',
	items: [{
		dtype: 'box',
		cls: 'dino-border-all',
		height: 'auto',
//		style: {'margin-right': 3},
		width: 200,
		content: {
			dtype: 'box',
			layout: 'simple-form-layout',
			items: [{
				dtype: 'textfield',
				label: 'Расчетный вес',
				rawValueOnFocus: true,
				dataId: 'calc_weight',
				format: function(val) { return (val) ? ''+val+' кг' : ''; },
				onValueChanged: function() {
					this.getParent('appointments').getItem(1).eachRow(function(row){
						calc_appointment_dose(row);
					});
				}
			}]
		}
	}, {
		dtype: 'dictionary-grid',

		cls: 'dino-border-all',
		
//		data: DataSources.ExpressCardAppointments,
		dataId: 'appointments',
		
		components: {
			controls: {
				items: [{
					dtype: 'dropdown-button',
					tag: 'add-appointment',
					xicon: 'dino-icon-down',
					text: 'Назначить препарат',
					onSelect: function(e) {
						var val = e.target.data.val();
						var obj = {
							drug_id: val.id,
							drug_name: val.name,
							appointment_group_id: 2,
							single_dose: 0,
							weight_dose: 0,
							units: val.drug_unit_id,
							dose: new Array(24)
						};
						
						this.data.add(obj);
						
					},
					components: {
						dropdown: {
							data: drugsClassification,
							menuModel: {
								item: {
									'content!': {
										dtype: 'text',
										format: function(val) { return val.name ? val.name : 'другой'; }
									},
									components: {
										submenu: {
											dataId: 'drugs'
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
				dataId: 'drug_name',
				editable: false,
	//			width: 200
			}, {
				header: 'Применение',
				width: 120,
				dataId: 'appointment_group_id',
				format: function(val) { 
					return (val === '' || val === null || val === undefined) ? '' : DataSources.AppointmentGroups.find_by_oid(val)['name']; 
				},
				editor: {
	        dtype: 'dropdown-editor',
					dropdownOnFocus: true,
	        components: {
						input: {
							format: function(val) { return (val === '' || val === null || val === undefined) ? '' : DataSources.AppointmentGroups.find_by_oid(val)['name']; }
						},
	          button: {
	            cls: 'dino-icon-down',
							height: 10
	          },
						dropdown: {
							data: DataSources.AppointmentGroups,
							content: {
								defaultItem: {content: {format: '#{name}'}}
							}
						}
	        },
					selectValue: function(w){ return w.data.get('id'); },
				}									
			}, {
				header: 'Дозировка',
				width: 80,
				dataId: 'single_dose',
				format: function() {
					if(this.states.is('disabled')) return '---';
					var val = this.data.source.val();
					return Dino.format('%s %s', val.single_dose, DataSources.DrugUnits.find_by_oid(val.units)['name']);
				},
				onEdit: function() {
					calc_appointment_dose( this.getRow() );
				}
			}, {
				header: 'По часам',
				width: 320,
				dataId: 'dose',
				updateOnValueChange: true,
				content: {
					dtype: 'box',
					style: {'display': 'inline-block', 'line-height': '8px'},
					cls: 'dino-border-all dino-corner-all dino-bg-3',
					layout: 'hbox-layout',
					defaultItem: {
						width: 12,
						height: 12,
						style: {'line-height': '10px'},
						cls: 'hour-cell',
						events: {
							'dblclick': function(e, w) {
								
								Dialogs.HoursDialog.$bind( Dino.deep_copy(w.data.val()) );
								Dialogs.HoursDialog.$dataChanged();
								Dialogs.HoursDialog.open(function(doses){
									for(var i = 0; i < doses.length; i++) {
										if(Dino.isString(doses[i]) && doses[i] !== '')
											doses[i] = parseFloat(doses[i]);
									}
									w.data.set(doses);
									calc_appointment_dose( w.parent.parent.getRow() );
								});
								
							}
						},
						binding: function(val) {
							this.states.toggle('selected', (val[this.index] != null));
						}
					},
					items: [{}, {}, {innerText: '12'}, {}, {}, {}, {}, {}, {innerText: '18'}, {}, {}, {}, {}, {}, {innerText: '24'}, {}, {}, {}, {}, {}, {innerText: '6'}, {}, {}, {cls: 'last'}],
					contextMenu: {
						dtype: 'context-menu',
						items: [
							{text: '12-15-18-21-24-3-6-9', tag: '2-5-8-11-14-17-20-23'},
							{text: '12-18-24-6', tag: '2-8-14-20'},
							{text: '12-24', tag: '2-14'},
						],
						onSelect: function(e) {
							var w = this.sourceWidget;
							var doses = [];
							doses[23] = undefined; //финт ушами
							var s = e.target.tag;
							var s_a = s.split('-');
							Dino.each(s_a, function(n){ doses[parseInt(n)] = ''; });
							w.data.set(doses);
							calc_appointment_dose( w.parent.getRow() );							
						}
					}
				},
				editable: false
			}, {
				header: 'На кг',
				dataId: 'weight_dose',
//				updateOnValueChange: true,
				format: function() {
					var val = this.data.source.val();
					return Dino.format('%s %s/кг/сут', val.weight_dose.toFixed(1), DataSources.DrugUnits.find_by_oid(val.units)['name']);
				},
				width: 100
			}]
		}
		
	}]
	
//	extensions: [{
//	}]
	
};


