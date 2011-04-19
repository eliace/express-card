
var drugsClassification = new Dino.data.ArrayDataSource();

var expressCardSums = new Dino.data.ObjectDataSource({
	v: 0,
	fats: 0,
	proteins: 0,
	carbohyds: 0,
	calories: 0,
	k: 0,
	mg: 0,
	na: 0,
	ca: 0
});



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
	var total_vol = total;
	// если указано содержание в растворителе, то высчитываем объем растворителя
	if(val.drug_content) total_vol = total*100/val.drug_content;
	// если указан раствор, то добавляем его объем
	if(total && val.solvent) total_vol += val.solvent_vol;
	
	row.data.set('total_vol', total_vol);
	
	row.getColumn(1).states.toggle('disabled', (total > 0 && n == 0));
	
	row.$dataChanged();
	
	calc_appointment_sums(row.data.source.val());
}		


function calc_appointment_sums(arr){
	
	var sums = {
		v: 0,
		fats: 0,
		proteins: 0,
		carbohyds: 0,
		calories: 0,
		k: 0,
		mg: 0,
		na: 0,
		ca: 0		
	}
	
	for(var i = 0; i < arr.length; i++) {
		var appointment = arr[i];
		if(appointment.total_vol) {
			sums.v += appointment.total_vol;
			Dino.each(appointment.drug_effects, function(eff, k){ sums[k] += (eff*appointment.total_vol/100); }); // из расчета эффекта на 100 мл			
		}
	}
	
	expressCardSums.set(sums);
}





Snippets.AppointmentsTab = {
	dtype: 'box',
	layout: 'column',
	width: 1000,
	tag: 'appointments',
	items: [{
		dtype: 'box',
//		cls: 'dino-border-all',
		height: 'auto',
		style: {'margin-right': 3},
		width: 160,
		content: {
			weight: 1,
			dtype: 'box',
			layout: 'form',
			style: {'margin': 3},
			items: [{
				dtype: 'text',
				label: 'Текущий вес',
				dataId: 'weight',
				format: function(val) { return (val) ? ''+val+' кг' : ''; },
			}, {
				dtype: 'input',
				label: 'Расчетный вес',
				width: 50,
				rawValueOnFocus: true,
				dataId: 'calc_weight',
				format: function(val) { return (val) ? ''+val+' кг' : ''; },
				onValueChanged: function() {
					this.getParent('appointments').getItem(1).eachRow(function(row){
						calc_appointment_dose(row);
					});
				}
			}]
		},
		components: {
			resultPanel: {
				weight: 2,
				dtype: 'group-box',
				title: 'Результаты',
				data: expressCardSums,
				updateOnValueChange: true,
				content: {
					dtype: 'box',
					layout: 'form',
					items: [{
						dtype: 'text',
						label: 'V',
						format: function(val) {return val.toFixed(1) + ' мл'},
						dataId: 'v'
					}, {
						dtype: 'text',
						label: 'Белки',
						format: function(val) {return val.toFixed(1) + ' г'},
						dataId: 'proteins'
					}, {
						dtype: 'text',
						label: 'Жиры',
						format: function(val) {return val.toFixed(1) + ' г'},
						dataId: 'fats'
					}, {
						dtype: 'text',
						label: 'Углеводы',
						format: function(val) {return val.toFixed(1) + ' г'},
						dataId: 'carbohyds'
					}, {
						dtype: 'text',
						label: 'Калории',
						format: function(val) {return val.toFixed(1) + ' ккал'},
						dataId: 'calories'
					}, {
						dtype: 'text',
						label: 'K',
						dataId: 'k'
					}, {
						dtype: 'text',
						label: 'Ca',
						dataId: 'ca'						
					}, {
						dtype: 'text',
						label: 'Na',
						dataId: 'na'
					}, {
						dtype: 'text',
						label: 'Mg',
						dataId: 'mg'
					}]					
				}
			}
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
					xicon: 'dino-icon-spinner-down',
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
							dose: new Array(24),
							drug_content: val.content,
							drug_effects: val.effects,
							solvent: null,
							solvent_vol: 0
						};
						
						var dataItem = this.data.add(obj);
						
//						var grid = this.parent.parent;
//						
//						var row = grid.getRow({data: dataItem});
//						row.eachItem(function(item){ 
//							if(item.options.editable) { 
//								item.startEdit(); return false; 
//							} 
//						});
						
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
				}, {}, {state: 'hidden'}]
			},
			pager: {
				state: 'hidden'
			}
		},
		
		tableModel: {
			columns: [{
				header: 'Препарат',
//				dataId: 'drug_name',
				editable: false,
				style: {'font-style': 'italic', 'color': '#444'},
				format: function(val) {
					var fmt = (val.drug_content) ? '#{drug_content}% #{drug_name}' : '#{drug_name}';
					return Dino.format_obj(fmt, val);
				}
	//			width: 200
			}/*, {
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
	            cls: 'dino-icon-spinner-down',
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
			}*//*, {
				header: 'Объем',
				width: 80,				
				dataId: 'solvent_vol',
			}*/, {
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
				header: 'Раствор',
				width: 120,
				editable: false,
				content: {
					dtype: 'text-button',
					width: 113,
					content: {
						format: function(val) {
							if(val.solvent) {
								var solvent = DataSources.DrugSolvents.find_by_oid(val.solvent);
								this.opt('innerText', Dino.format('%s %s мл', solvent['name'], val.solvent_vol))
							}
							else {
								this.opt('innerHtml', '&nbsp;');
							}
						}						
					},
					style: {'line-height': '11px', 'vertical-align': 'middle', 'padding': 0, 'margin': 0},
					onAction: function() {
						
						var self = this;
						
						Dialogs.SolventDialog.opt('title', this.data.get('drug_name')+' в растворе');
						Dialogs.SolventDialog.$bind( Dino.deep_copy(this.data.val()) );
						Dialogs.SolventDialog.$dataChanged();
						Dialogs.SolventDialog.open(function(result){
							result.solvent_vol = parseFloat(result.solvent_vol);
							self.data.set(result);
							calc_appointment_dose( self.parent.getRow() );
						});						
					}
				}
			}, {
				header: 'По часам',
				width: 320,
				dataId: 'dose',
				updateOnValueChange: true,
				content: {
					dtype: 'button',
					cls: 'hour-button',
//					style: {'padding': 0, 'margin': 0, 'line-height': '8px'},
//					height: 17,
					
					onAction: function(){

						var w = this;

						Dialogs.HoursDialog.opt('title', w.data.source.get('drug_name')+' по часам');
						Dialogs.HoursDialog.$bind( Dino.deep_copy(w.data.val()) );
						Dialogs.HoursDialog.$dataChanged();
						Dialogs.HoursDialog.open(function(doses){
							for(var i = 0; i < doses.length; i++) {
								if(Dino.isString(doses[i]) && doses[i] !== '')
									doses[i] = parseFloat(doses[i]);
							}
							w.data.set(doses);
							calc_appointment_dose( w.parent.getRow() );
						});
						
					},
					
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
					},
					
					
					content: {
						
						dtype: 'box',
						style: {'display': 'inline-block'/*, 'line-height': '8px'*/},
//						cls: 'dino-border-all dino-corner-all dino-bg-3',
						layout: 'hbox',
						defaultItem: {
							width: 12,
							height: 13,
							style: {'line-height': '16px'},
							cls: 'hour-cell silk-icon',
//							events: {
//								'click': function(e, w) {
									
//									Dialogs.HoursDialog.opt('title', w.data.source.get('drug_name')+' по часам');
//									Dialogs.HoursDialog.$bind( Dino.deep_copy(w.data.val()) );
//									Dialogs.HoursDialog.$dataChanged();
//									Dialogs.HoursDialog.open(function(doses){
//										for(var i = 0; i < doses.length; i++) {
//											if(Dino.isString(doses[i]) && doses[i] !== '')
//												doses[i] = parseFloat(doses[i]);
//										}
//										w.data.set(doses);
//										calc_appointment_dose( w.parent.parent.getRow() );
//									});
									
//								}
//							},
							binding: function(val) {
								this.states.toggle('selected', (val[this.index] != null));
							},
							states: {
								'selected': function(on) {
									this.el.removeClass('silk-icon-bullet-red');
									this.el.removeClass('silk-icon-bullet-purple');										
									if(on) {
										var icon = (this.data.val()[this.index] === '') ? 'silk-icon-bullet-red' : 'silk-icon-bullet-purple';
										this.el.addClass(icon);										
									}
								}
							}
						},
						items: [{}, {}, {/*innerText: '12'*/cls: 'marked'}, {}, {}, {}, {}, {}, {/*innerText: '18'*/cls: 'marked'}, {}, {}, {}, {}, {}, {/*innerText: '24'*/cls: 'marked'}, {}, {}, {}, {}, {}, {/*innerText: '6'*/cls: 'marked'}, {}, {}, {cls: 'last'}]
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
				width: 120
			}]
		}
		
	}]
	
//	extensions: [{
//	}]
	
};


