

	
get '/login' do
  haml :login
end
	
post '/login' do
	login = params[:login];
	d = Digest::SHA2.new
	password = d.hexdigest(params[:password]);
	user = User.find_by_login_and_password(login, password);
	if user.nil?
		@error_message = 'Неверное имя пользователя или пароль'
  	haml :login
	else
		session[:user] = user
		redirect '/'
	end
end
	
