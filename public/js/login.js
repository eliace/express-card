


$(document).ready(function(){
	
	
	Login = new Dino.framework.Application({
		dtype: 'panel',
		renderTo: 'body',
		title: 'Вход в систему',
		cls: 'login-box dino-border-all dino-panel-shadow',
		components: {
			header: {
				components: {
					title: {
						icon: 'silk-icon-key'
					}
				}
			}
		},
		content: {
			dtype: 'form',
			content: {
				dtype: 'box',
				weight: 2,
				layout: 'form',
				defaultItem: {
					style: {'display': 'block'}
				},
				items: [{
					dtype: 'input',
					label: 'Логин',
					id: 'login',
					name: 'login'
				}, {
					dtype: 'password',
					label: 'Пароль',
					name: 'password'
				}],				
			},
			components: {
//				errors: {
//					dtype: 'box',
//					cls: 'error-panel',
//					data: Globals.messages,
//					dynamic: true,
//					defaultItem: {
//						dtype: 'text'
//					}
//				},
				submit: {
					dtype: 'submit',
					text: 'Войти',
					style: {'margin-top': '3px'}
				}
			}
		}
		
	});
	
	var w = Login.root.el.width();
	var h = Login.root.el.height();
	
	Login.root.el.css({'margin-left': -w/2, 'margin-top': -h/2});
	
	$('#login').focus();
	
	if(Globals.error != '') {
		growl.error(Globals.error);
	}
	
});
