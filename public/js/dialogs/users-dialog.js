

Dialogs.PasswordDialog = $.dino({
	dtype: 'dialog',
	title: 'Изменение пароля',
	renderTo: 'body',
	content: {
		dtype: 'box',
		style: {'padding': 5},
		defaultItem: {
			style: {'display': 'block'}
		},
		items: [{
			dtype: 'text',
			text: 'Введите новый пароль'
		}, {
			dtype: 'password',
			width: 200,
		}]
	},
	onClose: function(e) {
		if(e.button == 'ok') {
			this.dialogResult = this.content.getItem(1).el.val();
		}
	},
	headerButtons: ['close'],
	buttons: ['ok', 'cancel']
});




Dialogs.UsersDialog = $.dino({
	dtype: 'dialog',
	title: 'Справочник "Пользователи"',
	renderTo: 'body',
	data: DataSources.Users,
	height: '90%',
	content: {
		dtype: 'box',
		width: 600,
//		height: 600,
		components: {
			grid: {
				components: {
					pager: {
						state: 'hidden'
					}					
				},
				dtype: 'dictionary-grid',
				cls: 'dino-border-all',
				tableModel: {
					columns: [{
						header: 'Имя',
						dataId: 'display_name'
					}, {
						header: 'Логин',
						dataId: 'login'
					}, {
						header: 'Пароль',
						width: 120,
						editable: false,
						content: {
							dtype: 'text-button',
							text: 'Изменить',
							icon: 'silk-icon-bullet-key',
							style: {'padding': '0 3px'},
							onAction: function() {
								var id = this.data.get('id');
								Dialogs.PasswordDialog.open(function(result){
									$.post('/users/'+id+'/password', {password: result}, function(){
										growl.info('Пароль изменен');
									});									
								});								
							}
						}
//						format: function() { return '***'; },
//						editor: {
//							dtype: 'text-editor',
//							components: {
//								input: {
//									dtype: 'password'
//								}
//							}
//						}
					}]
				},
				objectFactory: function() {
					return {
						display_name: 'Новый пользователь'
					};
				}
			}
		},
	},
	onOpen: function() {
		// загружаем анализы
		Remote.Users.load_all().to(DataSources.Users); //FIXME это должно измениться на работу с пейджером
	},
	onClose: function(e) {
		if(e.button == 'save') {
			if( this.save() ) growl.info('Изменения в справочнике сохранены.');
		}
	},
	headerButtons: ['close'],
	buttons: ['save', 'cancel']
});



Dialogs.UsersDialog.save = function() {
	
	var result = false;
	
	this.content.grid.editBuffer.flush(function(val, action){
		
		if(action == 'Delete')
			Remote.User.remove(val);			
		else if(action == 'Add')
			Remote.User.create(val);			
		else if(action == 'Update')
			Remote.User.update(val);			
		
		result = true;
  });
	
	return result;
}
