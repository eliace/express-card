


Dialogs.HoursDialog = $.dino({
	dtype: 'dialog',
	title: 'Дозировка по часам',
	renderTo: 'body',
	content: {
		dtype: 'box',
		style: {'padding': '5px'},
		components: {
			header: {
				dtype: 'box',
				layout: 'hbox',
				defaultItem: {
					dtype: 'text',
					width: 25,
					style: {'text-align': 'center', 'font-size': '12px', 'color': '#aaa'}
				},
				items: [
					{text: '10'}, 
					{text: '11'}, 
					{text: '12'}, 
					{text: '13'}, 
					{text: '14'}, 
					{text: '15'}, 
					{text: '16'}, 
					{text: '17'}, 
					{text: '18'},
					{text: '19'},
					{text: '20'},
					{text: '21'},
					{text: '22'},
					{text: '23'},
					{text: '24'},
					{text: '1'},
					{text: '2'},
					{text: '3'},
					{text: '4'},
					{text: '5'},
					{text: '6'},
					{text: '7'},
					{text: '8'},
					{text: '9'}
				]
			},
			values: {
				dtype: 'box',
				layout: 'hbox',
				cls: 'dino-border-all dino-corner-all dino-panel-shadow',
				defaultItem: {
					dtype: 'box',
					cls: 'hour-cell-x',
					width: 24,
					height: 24,
					extensions: [Dino.Editable, Dino.RClickable],
					updateOnValueChange: true,
					events: {
//						'dblclick': function(e, w) {
//						this.states.toggle('selected');
//						}
						'click': function(e, w) {
							if(e.button == 0) {
								w.states.toggle('selected');								
								w.data.set(( w.states.is('selected') ) ? '' : null);
							}
						}
					},
					onClick: function(e) {
						if(e.button == 2)
							if(this.states.is('selected')) this.startEdit();
					},
					binding: function(val) {
						this.el.text((val === null || val === undefined) ? '' : val);
//						this.states.toggle('selected', !(!val));
					},
//					states: {
//						'selected': function(on) {
//						}
//					}					
				},
				items: [
					{dataId:0}, 
					{dataId:1}, 
					{dataId:2}, 
					{dataId:3}, 
					{dataId:4}, 
					{dataId:5}, 
					{dataId:6}, 
					{dataId:7}, 
					{dataId:8}, 
					{dataId:9}, 
					{dataId:10}, 
					{dataId:11}, 
					{dataId:12}, 
					{dataId:13}, 
					{dataId:14}, 
					{dataId:15}, 
					{dataId:16}, 
					{dataId:17}, 
					{dataId:18}, 
					{dataId:19}, 
					{dataId:20}, 
					{dataId:21}, 
					{dataId:22}, 
					{dataId:23, cls: 'last'}
				] 
			}
		}		
	},
	headerButtons: ['close'],
	buttons: ['ok', 'cancel'],
	onOpen: function() {
		var doses = this.data.val();
		for(var i = 0; i < doses.length; i++) {
			this.content.values.getItem(i).states.toggle('selected', !(doses[i] === null || doses[i] === undefined));
		}
	},
	onClose: function(e) {
		if(e.button == 'ok') this.dialogResult = this.data.val();
	}
});